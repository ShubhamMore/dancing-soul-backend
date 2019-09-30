const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    body : {
        type : String,
        required : true
    }
})

const Article = mongoose.model('articles', articleSchema)
module.exports = Article