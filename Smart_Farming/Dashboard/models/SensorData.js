const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema

const SensorDataSchema = new Schema({
    device:{
        type : String,
        required: true
    },
    nodeId:{
        type : Number,
        required : true
    },
    temperature:{
        type : Number,
        required: true
    },
    moisture:{
        type : Number,
        required: true
    },
    waterLevel:{
        type : Number,
        required: true
    },
    date:{
        type: String,
        required: true
    },
    datetime:{
        type : Date,
        required: true,
        default: Date.now
    }
});

mongoose.model('udata', SensorDataSchema);