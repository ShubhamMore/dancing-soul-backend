const mongoose = require('mongoose')
const validator = require('validator')

const branchSchema = new mongoose.Schema({
    
    
    branch : {
        type : String,
        required : true
    },
    city : {
        type : String,
        required : true
    },
    address : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    images:[
        {
            image_name : {
                type : String,
                required : true
            },
            secure_url : {
                type : String,
                required : true
            },
            public_id : {
                type : String,
                required : true
            },
            created_at: {
                type: String,
                default: Date.now.toString()
            }
        }
    ],
    batch:[
        {
            batchType : {
                type : String,
                required : true
            },
            days : {
                type : String,
                required : true
            },
            batchName : {
                type : String,
                required : true
            },
            time : {
                type : String,
                required : true
            },
            fees : {
                type : String,
                required : true
            }
        }
    ],
    status : {
        type : String,
        required : true
    }
})
const Branch = mongoose.model('branches', branchSchema)

module.exports = Branch