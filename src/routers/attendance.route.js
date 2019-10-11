const express = require('express')
const auth = require('../middleware/auth')
const Attendance = require('../model/attendance.model')
const Student = require('../model/student.model')
const router = new express.Router()

const checkAttendanceStatus = (attendance, _id) => {
    let status;
    attendance.forEach((atten) => {
        if(atten.student == _id) {
            status = atten.attendanceStatus;
        }
    })
    return status;
}

router.post("/getStudentsForAttendance", auth, async (req, res) => {
    
    try {
        const student = await Student.find({branch: req.body.branch, batch: req.body.batch, status: '1'})
        res.status(200).send(student)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }   
});

router.post("/saveAttendance", auth, async (req, res)=>{
    try {
        let attendance = await Attendance.findOne({branch: req.body.branch, batch: req.body.batch, batchType: req.body.batchType, date: req.body.date})

        if(attendance) {
            throw new Error("Attendance alredy added for date" + req.body.date);
        }

        attendance = new Attendance(req.body)
        await attendance.save()
        res.status(200).send({success : true})
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }   
});

router.post("/getAttendance", async (req, res)=>{
    try {

        const attendance = await Attendance.find({attendance: {$elemMatch: {student: req.body._id}}});

        if(attendance.length < 1) {
            throw new Error("No attendance Found");
        }

        const studentAttendance = new Array()

        attendance.forEach((curAttendance) => {
            const atten = {
                date: curAttendance.date,
                status: checkAttendanceStatus(curAttendance.attendance, req.body._id)
            }
            studentAttendance.push(atten);
        });

        res.status(201).send(studentAttendance)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }   
});

module.exports = router