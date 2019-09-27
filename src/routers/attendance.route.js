const express = require('express')
const auth = require('../middleware/auth')
const Attendance = require('../model/attendance.model')
const router = new express.Router()

router.post("/saveAttendance", auth, async (req, res)=>{
    const attendance = new Attendance(req.body)
    try {
        await attendance.save()
        res.status(200).send({success : true})
    } catch (error) {
        console.log(error)
        res.status(400).send(error)   
    }
});

router.post("/getAttendance", auth, async (req, res)=>{
    try {
        const attendance = await Attendance.findById({branch : req.body.branch, batch : req.body.batch, batchType : req.body.batchType});
        if(!attendance) {
            throw new Error("No attendance Found");
        }

        res.status(201).send(attendance)
    } catch (e) {
        let err = "Something bad happend";
        res.status(400).send(err)
    }
});

module.exports = router