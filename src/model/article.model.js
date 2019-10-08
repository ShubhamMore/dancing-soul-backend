const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    body : {
        type : String,
        required : true
    },
    image:{
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
            required : true
        },
        created_at: {
            type: String,
            default: Date.now.toString()
        },
        width : {
            type : String,
            required : true
        },
        height : {
            type : String,
            required : true
        }
    }
})

const Article = mongoose.model('articles', articleSchema)
module.exports = Article