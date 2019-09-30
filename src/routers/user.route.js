const express = require('express')
const User = require('../model/user.model')
const Student = require('../model/student.model')
const Faculty = require('../model/faculty.model')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const sendMail = require("../mail/mail")

const router = new express.Router()

router.post('/newUser', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const data = {
            _id : user._id,
            email: user.email
        }
        res.status(201).send(data)
    } catch (e) {
        let err = "Something bad happend";
        if(e.code == 11000) {
            err = "User alredy register, Please login";
        }
        res.status(400).send(err)
    }
})

router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        
        const token = await user.generateAuthToken()
        let _id = user._id;

        if(user.userType == "student") {
            const student = await Student.find({email : user.email});
            _id = student[0]._id;
        }
        else if(user.userType == "faculty") {
            const faculty = await Faculty.find({email : user.email});
            _id = faculty[0]._id;
        }
        const data = {
            _id : _id,
            email: user.email,
            userType: user.userType,
            token,
            expiresIn : 1800
        }
        res.send(data)
    } catch (e) {
        const err = "" + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
})

router.post('/autoLogin', auth, async (req, res) => {
    try {
        res.status(200).send({authentication : true})
    } catch (e) {
        let err = ""+e;
        res.status(400).send(err.replace('Error: ', ''))
    }
})

router.post('/forgotPassword', async (req, res) => {
    try {

        const user = await User.findOne({ email: req.body.email })

        if(!user) {
            throw new Error('No such user Found..');
        }
        
        
        const token = await user.generateAuthToken();
        
        const link = process.env.MAIL_URI+"/#/reset_password?token="+token;

        const mail = {
            from : "shubhammore.developer@gmail.com",
            to : user.email,
            subject : "Reset Password Link",
            text : link
        }
            
        await sendMail(mail);
        
        res.status(200).send({data: "success"});

    } catch (e) {
        res.status(400).send("No such user found");
    }
})

router.post('/validateToken', async (req, res) => {
    try {
        const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET)

        
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': req.body.token })

        if (!user) {
            throw new Error("No such user found from validate password")
        }

        const data = {
            valid_token : true
        }

        res.status(200).send(data)
    } catch (e) {
        res.status(401).send("No such user found")
    }
});

router.post('/resetPassword', async (req, res) => {
    try {

        const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET)

        const user = await User.findOne({ _id: decoded._id, 'tokens.token': req.body.token });

        if (!user) {
            throw new Error()
        }

        user.tokens = [];
        user.password = req.body.password;

        await user.save();

        res.send()
    } catch (e) {
        res.status(400).send("No User Found")
    }
})

router.post('/changePassword', auth, async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);

        if (!user) {
            throw new Error()
        }

        user.password = req.body.newPassword;

        await user.save();

        res.send({success: true})
    } catch (e) {
        res.status(400).send("Old Password Does not Match, Please Try Again")
    }
})

router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.status(200).send({success:true})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send({success:true})
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router