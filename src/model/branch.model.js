const mongoose = require('mongoose')
const validator = require('validator')

const branchSchema = new mongoose.Schema({
    
    
    branch:{
        type:String
    },
    city:{
        type:String,
        required:true
    },

    address:{
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
    description:{
        type:String
    },
    images:{
        type:String
    },
    batch:[
        {
            batchType:{
                type:String
            },
            days:{
                type:String
            },
            batchName:{
                type:String
            },
            time:{
                type:String
            },
            fees:{
                type:String
            }
        }
    ],
    status:{
        type:String
    }
    
})
const Branch = mongoose.model('branches',branchSchema)

module.exports = Branch