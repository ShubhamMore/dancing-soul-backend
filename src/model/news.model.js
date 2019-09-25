const mongoose = require('mongoose')
const newsSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    body:{
        type:String,
        required:true
        }
})

const News = mongoose.model('news',newsSchema)

module.exports = News