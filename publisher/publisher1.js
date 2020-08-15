
var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://test.mosquitto.org');

var i = 0;
var date = new Date();
var day = date.getDate().toString();
var month = (date.getMonth());
if(month<9) month = "0"+month;
else month = month.toString();

var year = date.getFullYear().toString();
var fullDate = year+"-"+month+"-"+day;

function all(){
     n1()
     n2()
     n3()
}

function n1(){
    var node = ['ls','lc1','lc2'];
    var val = Math.floor(Math.random()*Math.floor(3));
    var temp = Math.floor(Math.random() * Math.floor(100));
    var moist = Math.floor(Math.random() * Math.floor(100));
    var wl = Math.floor(Math.random() * Math.floor(100));
    var message1 = {"device":node[val],"nodeId":007, "temperature":temp,"moisture":moist,"waterLevel":wl}
    var message = JSON.stringify(message1);
    console.log("sending ", message)
    client.publish("mesh/test", message, {qos: 1}, function(){
        console.log("sent ", message)
    });
    //i += 1;
}
function n2(){
    var temp = Math.floor(Math.random() * Math.floor(100));
    var moist = Math.floor(Math.random() * Math.floor(100));
    var wl = Math.floor(Math.random() * Math.floor(100));
   // var date = new Date();
    var message1 = {"device":2, "temperature":temp,"moisture":moist,"waterLevel":wl,"date":fullDate,"datetime":date.getTime()}
    var message = JSON.stringify(message1);
    console.log("sending ", message)
    client.publish("test2", message, {qos: 1}, function(){
        console.log("sent ", message)
    });
    //i += 1;
}

function n3(){
    var temp = Math.floor(Math.random() * Math.floor(100));
    var moist = Math.floor(Math.random() * Math.floor(100));
    var wl = Math.floor(Math.random() * Math.floor(100));
    //var date = new Date();
    var message1 = {"device":3, "temperature":temp,"moisture":moist,"waterLevel":wl,"date":fullDate,"datetime":date.getTime()}
    var message = JSON.stringify(message1);
    console.log("sending ", message)
    client.publish("test3", message, {qos: 1}, function(){
        console.log("sent ", message)
    });
    //i += 1;
}

setInterval(n1,12000)