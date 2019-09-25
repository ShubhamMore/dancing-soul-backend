const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema({
    date:{
        type:String,
        required:true
    },
    branch:{
        type:String,
        required:true
    },
    batch:{
        type:String,
        required:true
    },
    batchType:{
        type:String,
        required:true
    },
    present:[
        {
            type:String 
        }
    ],
    absent:[
       { 
           type:String
       }
    ]
})

const Attendance = mongoose.model('attendances',attendanceSchema)

module.exports = Attendance