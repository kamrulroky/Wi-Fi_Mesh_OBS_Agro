var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://test.mosquitto.org');

var i = 0;
setInterval(
    function(){
        var message = Math.floor(Math.random() * Math.floor(100)).toString();
        console.log("sending ", message)
        client.publish("test", message, {qos: 1}, function(){
            console.log("sent ", message)
        });
        i += 1;
    },
3000)