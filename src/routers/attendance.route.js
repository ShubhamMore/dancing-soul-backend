const express = require('express')
const auth = require('../middleware/auth')
const Attendance = require('../model/attendance.model')
const Student = require('../model/student.model')
const router = new express.Router()

router.post("/getStudentsForAttendance", auth, async (req, res) => {
    
    try {
        const student = await Student.find({branch: req.body.branch, batch: req.body.batch})
        
        res.status(200).send(student)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }   
});

router.post("/saveAttendance", auth, async (req, res)=>{
    const attendance = new Attendance(req.body)
    try {
        await attendance.save()
        res.status(200).send({success : true})
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }   
});

router.post("/getAttendance", auth, async (req, res)=>{
    try {
        const attendance = await Attendance.find({branch : req.body.branch, batch : req.body.batch, batchType : req.body.batchType});
        if(!attendance) {
            throw new Error("No attendance Found");
        }

        res.status(201).send(attendance)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }   
});

module.exports = router