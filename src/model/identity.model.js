var mongoose = require('mongoose');

var identitySchema = mongoose.Schema({
    student: {
        type : String,
        required : true
    },
    identityImages: [
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
                require : true
            },
            created_at : {
                type : String,
                default : Date.now.toString()
            },
            width: {
                type : String,
                require: true
            },
            height: {
                type : String,
                require: true
            }
        }
    ]
})

const Identity = mongoose.model('Identity', identitySchema)
module.exports = Identity