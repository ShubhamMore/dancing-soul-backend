const express = require('express')
const auth = require('../middleware/auth')
const Exam = require('../model/exam.model')
const router = new express.Router()

router.post("/addExam", auth, async(req, res)=>{
    const exam = new Exam(req.body)
    try {
        await exam.save()
        res.status(200).send(exam)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post("/getExams", async(req,res)=>{
    try {
        const exams = await Exam.find()
        if(!exams) {
            throw new Error("No exams found");
        }
        res.status(200).send(exams)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post("/getExam", async(req,res)=>{
    try {
        const exam = await Exam.findById(req.body._id)
        if(!exam) {
            throw new Error("No exams found");
        }
        res.status(200).send(exam)
        
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
})

router.post("/editExam", auth, async(req,res)=>{
    try {
        const exam = await Exam.findByIdAndUpdate(req.body._id, req.body)
        if(!exam) {
            throw new Error("No exam found");
        }
        res.status(200).send(exam)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post("/deleteExam", auth, async(req,res)=>{
    
   try {
        const exam = await Exam.findByIdAndDelete(req.body._id) 
        if(!exam) {
            throw new Error("No exams found");
        }  
        res.status(200).send(exam)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

module.exports = router