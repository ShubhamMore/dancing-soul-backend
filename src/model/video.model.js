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

videoSchema.methods.toJSON = function () {
    const video = this
    const videoObject = video.toObject()
    delete videoObject.__v
    return videoObject
}

const Video = mongoose.model('Video', videoSchema)
module.exports = Video