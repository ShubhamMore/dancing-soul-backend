var mongoose = require('mongoose');
var gallertSchema = mongoose.Schema({
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
    }
})
module.exports = mongoose.model('gallery', gallertSchema)