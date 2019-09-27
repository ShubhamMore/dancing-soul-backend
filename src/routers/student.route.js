const express = require('express')
const Student = require('../model/student.model')
const User = require('../model/user.model')
const auth = require('../middleware/auth')
const sendMail = require("../mail/mail")

const router = new express.Router()

router.post('/addStudent', auth, async (req, res) => {
    const student = new Student(req.body.student)
    const user = new User(req.body.user)
    try {
        await user.save()
        await student.save()
        
        const mail = {
            from : "shubhammore.developer@gmail.com",
            to : "shubhammore1796@gmail.com",
            subject : "Welcome to Dancing Soul",
            text : "Welcome Shubham",
            html : "<b>Welcome</b>" + student.name +"<br>Userid : " + student.email +"<br>Password : " + student.phone
        }

        await sendMail(mail)
   
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

router.post('/getStudents', auth, async (req, res) => {
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

router.post('/getStudent', auth, async (req, res) => {
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

router.post('/editStudent', auth, async (req, res) => {
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

router.post('/changeStudentStatus', auth, async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.body._id, {status : req.body.status});
        if(!student) {
            throw new Error("Student Updation Failed");
        }

        if(req.body.status === "0") {
            const user = await User.findOne({email : student.email});
            if(!user) {
                return;
            }
            await User.findByIdAndRemove(user._id);
            const mail = {
                from : "shubhammore.developer@gmail.com",
                to : "shubhammore1796@gmail.com",
                subject : "Thanks for using Dancing Soul",
                text : "Thanks",
                html : "<b>Thanks</b> " + student.name +" You are no longer part of dancing Soul Acadamy, Thanks for Supporting Us.."
            }
            await sendMail(mail);
        }

        else if(req.body.status === "1") {
            const user = new User({
                email : student.email,
                password : student.phone,
                userType : "student"
            })
            await user.save();
            const mail = {
                from : "shubhammore.developer@gmail.com",
                to : "shubhammore1796@gmail.com",
                subject : "Welcome to Dancing Soul",
                text : "Welcome Back Shubham",
                html : "<b>Welcome back </b>" + student.name +"<br>Userid : " + student.email +"<br>Password : " + student.phone
            }
            await sendMail(mail);
        }
        res.status(200).send({succes : true});
    }
    catch(e) {
        res.status(400).send(""+e);
    }
});

router.post("/deleteStudent", auth, async (req,res)=>{
    
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