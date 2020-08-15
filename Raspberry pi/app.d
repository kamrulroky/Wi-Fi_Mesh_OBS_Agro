#!/usr/bin/env dub
/+ dub.sdl:
	name "myscript"
	dependency "scriptlike" version="~>0.10.2"
	dependency "vibe-d:core" version="~>0.8.0-beta.5"
	dependency "vibe-d:stream" version="~>0.8.0-beta.5"
    dependency "painlessjson" version="~>1.3.6"
    versions "VibeDefaultMain"
+/

/+
  Program implementing a painlessMesh node that can run on any computer
  
    Dependencies:
        D programming language: https://dlang.org

  To run just make this script executable and run it. First time
  it will need to install some dependencies, so it might take some
  time to startup.

  The main functions you are likely to want to edit are the receivedMessage function and the Hello network function.
+/
import scriptlike;
import painlessjson;

import vibe.appmain;
import vibe.core.core : runTask, sleep;
import vibe.core.log;
import vibe.core.net : TCPConnection, listenTCP;
import vibe.stream.operations : readLine;

import core.time;

size_t port = 5555;

// This function is called when receiving a message
void receivedMessage(size_t from, JSONValue msg) {
    msg.writeln;
    //Here goes code to handle received messages
}

shared static this()
{
    // Broadcast every two minutes
    runTask(() {
        while(true) {
            JSONValue[string] msg;
            msg["topic"] = JSONValue("logNode");
            msg["nodeId"] = JSONValue(nodeId);
            sendBroadcast(msg.toJSON.to!string);
            sleep(120.seconds());
        }
    });

    //setLogLevel(LogLevel.debug_);

    /++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    Function below are needed for running the node. You probably want
    to leave them intact.
    +/
    runTask(() {
        while(true) {
            auto currT = MonoTime.currTime;
            logDebug("Checking for unused connections");
            foreach(fromID, conn; connections) {
                sendNodeSync(fromID);
                if (currT - conn.lastReceived > dur!"seconds"(15))
                        removeConnection(fromID);
            }
            sleep(6.seconds());
        }
    });

    nodeId = uniform(0, int.max);
    void delegate(TCPConnection) lambda = (TCPConnection conn) {
        logDebug("New connection");
        size_t fromID = 0;
		try {
			while (!conn.empty) {
				auto json = conn.readJsonObject();
                logDebug("Received message: %s", json);
                if (fromID == 0 && (
                        json["type"].integer == packageType.TIME_SYNC ||
                        json["type"].integer == 
                            packageType.NODE_SYNC_REQUEST ||
                        json["type"].integer == 
                            packageType.NODE_SYNC_REPLY)
                    ) {
                    fromID = json["from"].integer.to!size_t;
                    Connection meshConnection;
                    meshConnection.tcp = conn;
                    meshConnection.nodeId = fromID;
                    connections[fromID] = meshConnection;
                }

                if (fromID in connections) {
                    connections[fromID].lastReceived = MonoTime.currTime;
                }
 
                handleMessage(fromID, json);
			}
		} catch (Exception e) {
			logError("Failed to read from client: %s", e.msg);
		}
        removeConnection(fromID);
	};
	listenTCP(port.to!ushort, lambda);
}

size_t nodeId;
Connection[size_t] connections;

bool sendSingle(size_t dest, string msg) {
    JSONValue[string] pack;
    pack["dest"] = dest.toJSON;
    pack["from"] = nodeId.toJSON;
    pack["type"] = packageType.SINGLE.toJSON;
    pack["msg"] = msg;

    foreach(k, v; connections) {
        if (v.containsId(dest)) {
            k.safeWrite(pack.toJSON);
            return true;
        }
    }
    return false;
}

bool sendBroadcast(string msg) {
    JSONValue[string] pack;
    pack["dest"] = 0.toJSON;
    pack["from"] = nodeId.toJSON;
    pack["type"] = packageType.BROADCAST.toJSON;
    pack["msg"] = msg;

    foreach(k, v; connections) {
        logDebug("sendBroadcast: send message to %u.", k); 
        k.safeWrite(pack.toJSON);
    }
    return true;
}

struct subConnection {
    size_t nodeId;
    subConnection[] subs;
}

struct Connection {
    @SerializeIgnore TCPConnection tcp;
    size_t nodeId;
    subConnection[] subs;

    @SerializeIgnore MonoTime lastReceived;
}

bool containsId(C)(C conn, size_t id) {
    if (conn.nodeId == id)
        return true;
    else if (conn.subs.empty)
        return false;
    else
        return conn.subs.any!((c) => c.containsId(id));
}

bool safeWrite(size_t connectionId, JSONValue pkge) {
    logDebug("Send to %u, msg %s", connectionId, pkge.to!string);
    try {
        if (connectionId in connections) {
            connections[connectionId].tcp.write(pkge.to!string);
            connections[connectionId].tcp.write(['\0']); // append a zero character
            return true;
        } else
            return false;
    } catch (Exception e) {
        if (connectionId in connections) {
            connections[connectionId].tcp.close();
            removeConnection(connectionId);
        }
        logError("Failed to write to client: %s", e.msg);
        return false;
    }
}

bool removeConnection(size_t connId) {
    if (connId in connections) {
        logDebug("Removing connection %u: ", connId);
		connections[connId].tcp.close();
        connections.remove(connId);
        // Inform the other nodes
        foreach (connID; connections.keys) {
            sendNodeSync(connID, true);
        }
        return true;
    } else
        return false;
}

enum packageType {
    DROP                    = 3,
    TIME_SYNC               = 4,
    NODE_SYNC_REQUEST       = 5,
    NODE_SYNC_REPLY         = 6,
    BROADCAST               = 8,  //application data for everyone
    SINGLE                  = 9   //application data for a single node
};

auto readJsonObject(T)(ref T connection)
{
    import vibe.stream.operations : readUntil;
    import std.range : walkLength;
    import std.algorithm : balancedParens, filter;
    import std.json : parseJSON;

    bool firstRun = true;
    connection.readUntil([123]); // Find the starting {
    string line = "{";
    int countOpen = 1;
    while(countOpen > 0 || firstRun)
    {
        auto segment = cast(string) connection.readUntil([125]);
        auto newOpen = segment.filter!((a) => a == '{').walkLength;
        countOpen += newOpen;
        line ~= segment ~ "}";
        --countOpen;
        firstRun = false;
    }
    assert(line.balancedParens('{', '}'), "Object not complete");
    return line.parseJSON.object;
}

struct timeSync {
    uint type;
    uint t0;
    uint t1;
    uint t2;
}

import std.json : JSONValue;
auto handleMessage(size_t fromID, JSONValue[string] json) {
    if (fromID !in connections) {
        logDebug("Unknown nodeId");
        return false;
    }
    if (json["type"].integer == packageType.NODE_SYNC_REQUEST ||
            json["type"].integer == packageType.NODE_SYNC_REPLY ) {
        connections[fromID].subs = json["subs"].fromJSON!(subConnection[]);
        if (json["type"].integer == packageType.NODE_SYNC_REQUEST)
            sendNodeSync(fromID, false);
    } else if (json["type"].integer == packageType.TIME_SYNC) {
        auto timeReceived = nodeTime();
        auto tS = json["msg"].fromJSON!timeSync;
        if (tS.type != 2) {
            JSONValue[string] pack;
            pack["dest"] = fromID.toJSON;
            pack["from"] = nodeId.toJSON;
            pack["type"] = packageType.TIME_SYNC.toJSON;
            if (tS.type == 0) {
                tS.t0 = nodeTime();
            } else if (tS.type == 1) {
                tS.t1 = timeReceived;
                tS.t2 = nodeTime();
            }
            ++tS.type;
            pack["msg"] = tS.toJSON;
            fromID.safeWrite(pack.toJSON);
        } else {
            adjustTime += ((tS.t1 - tS.t0)/2 - (tS.t2-timeReceived)/2);
        }
    } else if (json["type"].integer == packageType.BROADCAST) {
        // if broadcast, forward it and pass it to received callback
        foreach(k, v; connections) {
            if (!v.containsId(fromID)) { // Don't send it back
                k.safeWrite(json.toJSON);
            }
        }
        receivedMessage(json["from"].fromJSON!size_t, json["msg"]);
    } else if (json["type"].integer == packageType.SINGLE) {
        auto dest = json["dest"].fromJSON!size_t;
        if (dest == nodeId) {
            receivedMessage(json["from"].fromJSON!size_t, json["msg"]);
        } else {
            // Forward it
            foreach(k, v; connections) {
                if (v.containsId!(typeof(v))(dest)) {
                    //forwarding
                    k.safeWrite(json.toJSON);
                    break;
                }
            }
        }
    }
    return true;
}

void sendNodeSync(size_t fromID, bool request = true) {
    if (fromID in connections) {
        JSONValue[string] pack;
        pack["dest"] = fromID.toJSON;
        pack["from"] = nodeId.toJSON;
        if (request)
            pack["type"] = packageType.NODE_SYNC_REQUEST.toJSON;
        else
            pack["type"] = packageType.NODE_SYNC_REPLY.toJSON;
        pack["subs"] = connections.byPair.filter!((t) => t[0] != fromID).map!((t) => t[1]).array.toJSON;
        fromID.safeWrite(pack.toJSON);
    } else {
        logDebug("Connection not found during node sync");
    }
}

uint adjustTime = 0;

uint nodeTime() {
    return cast(uint) (((MonoTime.currTime-MonoTime(0)).total!"usecs") + adjustTime);
}
