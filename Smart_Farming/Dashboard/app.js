const express = require('express');
const app = express();
const exphbs  = require('express-handlebars');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
var methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const path  = require('path');
const http = require("http");
var server = http.createServer(app);

//Load Routes
const users = require('./routes/users');
const sensorData = require('./routes/sensors');

//Map global promise - get rid of warning
mongoose.Promise = global.Promise;
//DB connect
const db = require('./config/database');

//Passport Config
require('./config/passport')(passport);

//connect to moongose
mongoose.connect(db.mongoURI,{
    useMongoClient: true
})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));



//Handlebars Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');


//BodyParser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//Method Override Middleware
app.use(methodOverride('_method'));


//Expres-Session Middleware
app.use(session({
    secret: 'a4f8071f-c873-4447-8ee2',
    resave: true,
    saveUninitialized: true
})); 

//passport middleware
app.use(passport.initialize());
app.use(passport.session());


//Connect-Flash Middleware
app.use(flash());


//Global Variables
app.use((req,res,next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

//Load SensorData Model
require('./models/SensorData');
const Sdata = mongoose.model('udata');



// //########################################Code to receive data from MQTT##################################################
// var io = require("socket.io")(server);
// var mqtt    = require('mqtt');
// var client  = mqtt.connect('mqtt://test.mosquitto.org');

// client.subscribe('test1');
// client.subscribe('test2');
// client.subscribe('test3');


// console.log('Subscribed to test');
// io.sockets.on('connection', function(socket){
//     socket.on('subscribe',function(data){
//         console.log('Subscribing to '+data.topic);
//         socket.join(data.topic);
//         client.subscribe(data.topic);
//     });

//     socket.on('publish',function(data){
//         console.log('Publishing to '+data.topic);
//         client.publish(data.topic,data.payload);
//     });

//     client.on('message', function(topic,payload,packet){
//         //console.log('Animesh');
//         if(topic == 'test1'){
//             var sensorValue = JSON.parse(payload);
//             //console.log(sensorValue);
//             new Sdata(sensorValue).save();
//             io.sockets.emit('mqtt',{'topic':String(topic), 'payload':String(payload)});
//         }
//     });

//     client.on('message', function(topic,payload,packet){
//         //console.log('Kamrul');
//         if(topic == 'test2'){
//             var sensorValue = JSON.parse(payload);
//             //console.log(sensorValue);
//             new Sdata(sensorValue).save();
//             io.sockets.emit('mqtt',{'topic':String(topic), 'payload':String(payload)});
//         }
//     });

//     client.on('message', function(topic,payload,packet){
//         //console.log('Tasfia');
//         if(topic == 'test3'){
//             var sensorValue = JSON.parse(payload);
//             //console.log(sensorValue);
//             new Sdata(sensorValue).save();
//             io.sockets.emit('mqtt',{'topic':String(topic), 'payload':String(payload)});
//         }
//     });
// });

// //#####################################################################################################################


























//########################################Code to receive data from MQTT##################################################
var io = require("socket.io")(server);
var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://test.mosquitto.org');
var msg1= "1";
var msg2= "";

client.subscribe('mesh/test');
//client.subscribe('test2');
//client.subscribe('test3');


console.log('Subscribed to test');
io.sockets.on('connection', function(socket){
    // socket.on('subscribe',function(data){
    //     console.log('Subscribing to '+data.topic);
    //     socket.join(data.topic);
    //     //client.subscribe(data.topic);
    // });

    socket.on('publish',function(data){
        console.log('Publishing to '+data.topic);
        client.publish(data.topic,data.payload);
    });

    client.on('message', function(topic,payload,packet){
        var sensorValue = JSON.parse(payload);
        msg2=payload;
        //console.log(msg2);
        if(msg2 != msg1){
            msg1=payload;
           // console.log(msg1);
            //console.log(sensorValue);
            //console.log(typeof(sensorValue));
            var date = new Date();
            var day = (date.getDate());
            var month = (date.getMonth()+1);
            if(month<10) month = "0"+month;
            else month = month.toString();

            if(day<10) day = "0"+day;
            else day = day.toString();

            var year = date.getFullYear().toString();
            var fullDate = year+"-"+month+"-"+day;
            //console.log(sensorValue);
            sensorValue["date"]=fullDate;
            //console.log(sensorValue);
            new Sdata(sensorValue).save().then(
                console.log("Data Saved To DB")
            );
            io.sockets.emit('mqtt',{'topic':String(topic), 'payload':String(payload)});
        }
    });

    // client.on('message', function(topic,payload,packet){
    //     //console.log('Kamrul');
    //     if(payload.device == 'lc1'){
    //         var sensorValue = JSON.parse(payload);
    //         //console.log(sensorValue);
    //         new Sdata(sensorValue).save();
    //         io.sockets.emit('mqtt',{'topic':"lc1", 'payload':String(payload)});
    //     }
    // });

    // client.on('message', function(topic,payload,packet){
    //     //console.log('Tasfia');
    //     if(payload.device == 'lc2'){
    //         var sensorValue = JSON.parse(payload);
    //         //console.log(sensorValue);
    //         new Sdata(sensorValue).save();
    //         io.sockets.emit('mqtt',{'topic':"lc2", 'payload':String(payload)});
    //     }
    //});
});

//#####################################################################################################################




//##################################################---Fetch Data From MongoDB---######################################




//#####################################################################################################################

//static folder
app.use(express.static(path.join(__dirname, 'public')));



app.get('/',(req,res)=>{
    res.render('index');
})

//use routes
app.use('/users',users);
app.use('/sensors',sensorData);


server.listen(process.env.PORT || 3000,()=>{
    console.log(`Server started at port 3000`);
});
