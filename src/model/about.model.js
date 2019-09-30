const mongoose = require('mongoose')

const aboutSchema = new mongoose.Schema({
    aim : {
        type : String,
        required : true
    },
    history : {
        type : String,
        required : true
    },
    philosophy : {
        type : String,
        required : true
    }
})

const About = mongoose.model('abouts', aboutSchema)
module.exports = About