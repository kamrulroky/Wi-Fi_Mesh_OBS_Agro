var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://test.mosquitto.org');

var i = 0;
function all(){
     n1()
     n2()
     n3()
}

function n1(){
    var temp = Math.floor(Math.random() * Math.floor(100)).toString();
    var moist = Math.floor(Math.random() * Math.floor(100)).toString();
    var wl = Math.floor(Math.random() * Math.floor(100)).toString();
    var date = new Date();
    var message1 = {"device":1, "temperature":temp,"moisture":moist,"waterLevel":wl,"date":date.getTime()}
    var message = JSON.stringify(message1);
    console.log("sending ", message)
    client.publish("test1", message, {qos: 1}, function(){
        console.log("sent ", message)
    });
    //i += 1;
}
function n2(){
    var temp = Math.floor(Math.random() * Math.floor(100)).toString();
    var moist = Math.floor(Math.random() * Math.floor(100)).toString();
    var wl = Math.floor(Math.random() * Math.floor(100)).toString();
    var date = new Date();
    var message1 = {"device":2, "temperature":temp,"moisture":moist,"waterLevel":wl,"date":date.getTime()}
    var message = JSON.stringify(message1);
    console.log("sending ", message)
    client.publish("test2", message, {qos: 1}, function(){
        console.log("sent ", message)
    });
    //i += 1;
}

function n3(){
    var temp = Math.floor(Math.random() * Math.floor(100)).toString();
    var moist = Math.floor(Math.random() * Math.floor(100)).toString();
    var wl = Math.floor(Math.random() * Math.floor(100)).toString();
    var date = new Date();
    var message1 = {"device":3, "temperature":temp,"moisture":moist,"waterLevel":wl,"date":date.getTime()}
    var message = JSON.stringify(message1);
    console.log("sending ", message)
    client.publish("test3", message, {qos: 1}, function(){
        console.log("sent ", message)
    });
    //i += 1;
}

setInterval(all,10000)