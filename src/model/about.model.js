const mongoose = require('mongoose')

const aboutSchema = new mongoose.Schema({
    aim:{
        type:String
    },
    history:{
        type:String
    },
    philosophy:{
        type:String
    }
})

const About = mongoose.model('abouts',aboutSchema)
module.exports = About