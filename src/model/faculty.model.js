const mongoose = require('mongoose')
const validator = require('validator')
const facultySchema = new mongoose.Schema({
    
    name:{
        type:String,
        required:true
    },
    birthDate:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
    image:{
        type:String
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:String,
        required:true,
        default:null
    },
    status:{
        type:String,
        required:true
    }
});

const Faculty = mongoose.model('Faculties', facultySchema)

module.exports = Faculty