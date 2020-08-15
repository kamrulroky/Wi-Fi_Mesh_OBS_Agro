//************************************************************
// this is a simple example that uses the painlessMesh library to 
// setup a node that logs to a central logging node
// The logServer example shows how to configure the central logging nodes
//************************************************************
#include "painlessMesh.h"
#include <OneWire.h>
#include <DallasTemperature.h>

#define   MESH_PREFIX     "whateverYouLike"
#define   MESH_PASSWORD   "somethingSneaky"
#define   MESH_PORT       5555

#define ANALOG_PIN_0 36    // select the input pin for the potentiometer
#define ANALOG_PIN_3 39    // select the input pin for the potentiometer
#define ONE_WIRE_BUS 5
painlessMesh  mesh;

size_t logServerId = 0;

// Data wire is plugged into pin 2 on the Arduino

// Setup a oneWire instance to communicate with any OneWire devices (not just Maxim/Dallas temperature ICs)
OneWire oneWire(ONE_WIRE_BUS);
// Pass our oneWire reference to Dallas Temperature. 
DallasTemperature sensors(&oneWire);

int sensorValue1 = 0;  // variable to store the value coming from sensor A
int sensorValue2 = 0;  // variable to store the value coming from sensor B


// Send message to the logServer every 10 seconds 
Task myLoggingTask(10000, TASK_FOREVER, []() {

    DynamicJsonBuffer jsonBuffer;
    JsonObject& msg = jsonBuffer.createObject();
    msg["device"] = "lc2";
    msg["nodeId"] = mesh.getNodeId();
    
  
  sensorValue2 = analogRead(ANALOG_PIN_3); // 28.24;
  sensorValue2 = map(sensorValue2, 0,2250,0,40);

  sensorValue1 = analogRead(ANALOG_PIN_0);
  sensorValue1 = map(sensorValue1, 4200,1000,0,100);

  // Send the command to get temperatures
  sensors.requestTemperatures();  
  //Serial.println(sensors.getTempCByIndex(0)); // Why "byIndex"? You can have more than one IC on the same bus. 0 refers to the first IC on the wire
    Serial.println(sensors.getTempCByIndex(0));
    msg["temperature"] = sensors.getTempCByIndex(0);
    msg["moisture"] = sensorValue1;
    msg["waterLevel"] = sensorValue2;
  
    String str;
    msg.printTo(str);
    if (logServerId == 0) // If we don't know the logServer yet
        mesh.sendBroadcast(str);
    else
        mesh.sendSingle(logServerId, str);

    // log to serial
    msg.printTo(Serial);
    Serial.printf("\n");
});

void setup() {
  Serial.begin(9600);
  sensors.begin();
  Serial.printf("setup");  
  mesh.setDebugMsgTypes( ERROR | STARTUP | CONNECTION );  // set before init() so that you can see startup messages

  mesh.init( MESH_PREFIX, MESH_PASSWORD, MESH_PORT, STA_AP, WIFI_AUTH_WPA2_PSK, 1 );
  mesh.onReceive(&receivedCallback);

  // Add the task to the mesh scheduler
  mesh.scheduler.addTask(myLoggingTask);
  myLoggingTask.enable();
}

void loop() {
  mesh.update();
}

void Sensor(){
  
  
  }

void receivedCallback( uint32_t from, String &msg ) {
  Serial.printf("logClient: Received from %u msg=%s\n", from, msg.c_str());

  // Saving logServer
  DynamicJsonBuffer jsonBuffer;
  JsonObject& root = jsonBuffer.parseObject(msg);
  if (root.containsKey("device")) {
      if (String("ls").equals(root["device"].as<String>())) {
          // check for on: true or false
          logServerId = root["nodeId"];
          Serial.printf("logServer detected!!!\n");
      }
      Serial.printf("Handled from %u msg=%s\n", from, msg.c_str());
  }
}
