const mongoose = require('mongoose')
const validator = require('validator')
const enquirySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    }
})
const Enquiry = mongoose.model('enquiry',enquirySchema)

module.exports = Enquiry