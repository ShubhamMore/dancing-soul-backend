const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
    title:{
        type:String
    },
    body:{
        type:String
    }
})

const Article = mongoose.model('articles',articleSchema)
module.exports = Article