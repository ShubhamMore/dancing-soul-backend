var mongoose = require('mongoose');
var gallertSchema = mongoose.Schema({
    imageName: {
        type: String,
        required: true
    },
    cloudImage: {
        type: String,
        required: true
    },
    imageId: {
        type: String,
        require: true
    },
    post_date: {
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model('gallery', gallertSchema)