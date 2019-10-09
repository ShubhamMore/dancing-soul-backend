var mongoose = require('mongoose');

var videoSchema = mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    url : {
        type : String,
        required : true
    },
    created_at : {
        type : String,
        default : Date.now.toString()
    }
})

const Video = mongoose.model('Video', videoSchema)
module.exports = Video