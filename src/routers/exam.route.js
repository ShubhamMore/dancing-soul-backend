const express = require('express')
const auth = require('../middleware/auth')
const Exam = require('../model/exam.model')
const router = new express.Router()

router.post("/addExam", async(req, res)=>{
    const exam = new Exam(req.body)
    try {
        await exam.save()
        res.status(200).send(exam)
    } catch (error) {
        res.status(401).send(error)    
    }
});

router.post("/getExams", async(req,res)=>{
    try {
        const exams = await Exam.find()
        if(!exams) {
            throw new Error("No exams found");
        }
        res.status(200).send(exams)
    } catch (error) {
        res.status(401).send(error)
    }
});

router.post("/getExam", async(req,res)=>{
    try {
        const exam = await Exam.findById(req.body._id)
        if(!exam) {
            throw new Error("No exams found");
        }
        res.status(200).send(exam)
        
    } catch (error) {
        res.status(401).send(error)
    }
})

router.post("/editExam", async(req,res)=>{
    try {
        const exam = await Exam.findByIdAndUpdate(req.body._id, req.body)
        if(!exam) {
            throw new Error("No exam found");
        }
        res.status(200).send(exam)
    } catch (error) {
        res.status(401).send(error)    
    }
});

router.post("/deleteExam", async(req,res)=>{
    
   try {
        const exam = await Exam.findByIdAndDelete(req.body._id) 
        if(!exam) {
            throw new Error("No exams found");
        }  
        res.status(200).send(exam)
    } catch (error) {
        res.status(401).send(error)    
    } 
});

module.exports = router