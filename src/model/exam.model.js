const mongoose = require('mongoose')
const examSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    body:{
        type:String,
        required:true
        }
})

const Exam = mongoose.model('exams',examSchema)

module.exports = Exam