const express = require('express')
const auth = require('../middleware/auth')
const Faculty = require('../model/faculty.model')
const User = require('../model/user.model')
const sendMail = require("../mail/mail")

const router = new express.Router()

router.post("/addFaculty", auth, async (req, res) =>{
    const faculty = new Faculty(req.body.faculty)
    const user = new User(req.body.user)
    try {
        
        await user.save()
        await faculty.save()
        
        const mail = {
            from : "shubhammore.developer@gmail.com",
            to : "shubhammore1796@gmail.com",
            subject : "Welcome to Dancing Soul",
            text : "Welcome Shubham",
            html : "<b>Welcome</b>" + faculty.name +"<br>Userid : " + faculty.email +"<br>Password : " + faculty.phone
        }
        await sendMail(mail);

        res.status(200).send(user)  
    } catch (e) {
        let err = "Something bad happend";
        if(e.code == 11000) {
            err = "User alredy register";
        }
        res.status(400).send(err)
    }
});

router.post("/getFaculties", auth, async(req,res)=>{
    try {
        const faculties = await Faculty.find()
        if(!faculties) {
            throw new Error("No Faculty found");
        }
        res.status(200).send(faculties)
    } catch (error) {
        console.log(error)
        res.status(401).send(error)
    }
});

router.post("/getActivateFaculties", async(req,res)=>{
    try {
        const faculties = await Faculty.find({status : "1"})
        if(!faculties) {
            throw new Error("No Faculty found");
        }
        res.status(200).send(faculties)
    } catch (error) {
        console.log(error)
        res.status(401).send(error)
    }
});

router.post("/getFaculty", auth, async(req,res)=>{
    try {
        const faculty = await Faculty.findById(req.body._id)
        if(!faculty) {
            throw new Error("No Facultys found");
        }
        res.status(200).send(faculty)
        
    } catch (error) {
        console.log(error)
        res.status(401).send(error)
    }
});

router.post("/changeFacultyStatus", auth, async(req, res)=>{
    try {

        const faculty = await Faculty.findByIdAndUpdate(req.body._id, {status : req.body.status})
        if(!faculty) {
            throw new Error("No Faculty found");
        }
        
        if(req.body.status === "0") {
            const user = await User.findOne({email : faculty.email});
            if(!user) {
                return;
            }
            await User.findByIdAndRemove(user._id);
            const mail = {
                from : "shubhammore.developer@gmail.com",
                to : "shubhammore1796@gmail.com",
                subject : "Thanks for using Dancing Soul",
                text : "Thanks",
                html : "<b>Thanks</b> " + faculty.name +" You are no longer part of dancing Soul Acadamy, Thanks for Supporting Us.."
            }
            await sendMail(mail);
        }

        else if(req.body.status === "1") {
            const user = new User({
                email : faculty.email,
                password : faculty.phone,
                userType : "faculty"
            })
            await user.save();
            const mail = {
                from : "shubhammore.developer@gmail.com",
                to : "shubhammore1796@gmail.com",
                subject : "Welcome to Dancing Soul",
                text : "Welcome Back Shubham",
                html : "<b>Welcome back </b>" + faculty.name +"<br>Userid : " + faculty.email +"<br>Password : " + faculty.phone
            }
            await sendMail(mail);
        }

        res.status(200).send(faculty)
    } catch (error) {
        console.log(error)
        res.status(401).send(error)    
    }
});

router.post("/editFaculty", auth, async(req,res)=>{
    try {

        const faculty = await Faculty.findByIdAndUpdate(req.body._id, req.body)
        if(!faculty) {
            throw new Error("No Faculty found");
        }
        res.status(200).send(faculty)
    } catch (error) {
        console.log(error)
        res.status(401).send(error)    
    }
});

router.post("/deleteFaculty", auth, async (req,res)=>{
    
    try {
        const faculty = await Faculty.findByIdAndDelete(req.body._id) 
        if(!faculty) {
            throw new Error("No faculty found");
        }  
        res.status(200).send({success : true})
    } catch (error) {
        res.status(401).send(error)    
    } 
});

module.exports = router;