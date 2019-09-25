const express = require('express')
const Student = require('../model/student.model')
const User = require('../model/user.model')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/addStudent', async (req, res) => {
    const student = new Student(req.body.student)
    const user = new User(req.body.user)
    try {
        await user.save()
        await student.save()      
        res.status(200).send(user)  
    } catch (e) {
        console.log(e)
        let err = "Something bad happend";
        if(e.code == 11000) {
            err = "User alredy register";
        }
        res.status(400).send(err)
    }
})

router.post('/getStudents', async (req, res) => {
    try {
        const students = await Student.find()
        if(!students) {
            throw new Error("No Student Found");
        }
        res.status(200).send(students);
    }
    catch(e) {
        res.status(400).send(""+e);
    }
})

router.post('/getStudent', async (req, res) => {
    try {
        const student = await Student.findById(req.body._id);
        if(!student) {
            throw new Error("No Student Found");
        }
        res.status(200).send(student);
    }
    catch(e) {
        let error = ""+e;
        if(e.name === "CastError") {
            error = "No Student Found";
        }
        res.status(400).send(error);
    }
})

router.post('/editStudent', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.body._id, req.body);
        if(!student) {
            throw new Error("Student Updation Failed");
        }
        res.status(200).send({succes : true});
    }
    catch(e) {
        res.status(400).send(""+e);
    }
});

router.post("/deleteStudent", async (req,res)=>{
    
    try {
        const student = await Student.findByIdAndDelete(req.body._id) 
        if(!student) {
            throw new Error("No student found");
        }  
        res.status(200).send({success : true})
    } catch (error) {
        res.status(401).send(error)    
    } 
});

module.exports = router