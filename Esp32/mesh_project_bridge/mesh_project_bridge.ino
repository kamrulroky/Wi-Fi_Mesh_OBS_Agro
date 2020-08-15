//************************************************************
// this is a simple example that uses the painlessMesh library to
// connect to a node on another network. Please see the WIKI on gitlab
// for more details
// https://gitlab.com/BlackEdder/painlessMesh/wikis/bridge-between-mesh-and-another-network
//************************************************************
#include "painlessMesh.h"

#define   MESH_PREFIX     "whateverYouLike"
#define   MESH_PASSWORD   "somethingSneaky"
#define   MESH_PORT       5555


#define   STATION_SSID     "DataSoft_WiFi"
#define   STATION_PASSWORD "support123"
#define   STATION_PORT     5555
uint8_t   station_ip[4] =  {192, 168, 4, 100}; // IP of the server

painlessMesh  mesh;

// Send my ID every 10 seconds to inform others
Task logServerTask(10000, TASK_FOREVER, []() {
  DynamicJsonBuffer jsonBuffer;
  JsonObject& msg = jsonBuffer.createObject();
  msg["device"] = "ls";
  msg["nodeId"] = mesh.getNodeId();
  msg["temp"] = random(0, 70);
  msg["hum"] = random(0, 100);
  msg["waterLevel"] = random(0, 100);

  String str;
  msg.printTo(str);
  mesh.sendBroadcast(str);

  // log to serial
  msg.printTo(Serial);
  Serial.printf("\n");
});


void setup() {
  Serial.begin(115200);
  mesh.setDebugMsgTypes( ERROR | STARTUP | CONNECTION );  // set before init() so that you can see startup messages


  // Channel set to 6. Make sure to use the same channel for your mesh and for you other
  // network (STATION_SSID)
  mesh.init( MESH_PREFIX, MESH_PASSWORD, MESH_PORT, STA_AP, AUTH_WPA2_PSK, 1 );
  mesh.stationManual(STATION_SSID, STATION_PASSWORD, STATION_PORT,
                     station_ip);
  mesh.onReceive(&receivedCallback);

  mesh.onNewConnection([](size_t nodeId) {
    Serial.printf("New Connection %u\n", nodeId);
  });

  mesh.onDroppedConnection([](size_t nodeId) {
    Serial.printf("Dropped Connection %u\n", nodeId);
  });

  // Add the task to the mesh scheduler
  mesh.scheduler.addTask(logServerTask);
  logServerTask.enable();
}

void loop() {
  mesh.update();
}

void receivedCallback( uint32_t from, String &msg ) {
  Serial.printf("bridge: Received from %u msg=%s\n", from, msg.c_str());
  mesh.sendBroadcast(msg);
}
