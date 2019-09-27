const express = require('express')
const auth = require('../middleware/auth')
const Enquiry = require('../model/enquiry.model')
const sendMail = require("../mail/mail")

const router = new express.Router()

router.post('/sendEnquiry', async (req, res) => {

    const enquiry = new Enquiry(req.body)
    try {
        await enquiry.save()
        // send wnquiry to mail

        // const mail = {
        //     from : "shubhammore.developer@gmail.com",
        //     to : "shubhammore1796@gmail.com",
        //     subject : "Welcome to Nodemailer",
        //     text : "Welcome Shubham",
        //     html : "<b>Welcome</b>"
        // }

        // sendMail(mail)

        const data = {
            success : true
        }
        res.status(201).send(data)
    } catch (e) {
        let err = "Something bad happend";
        res.status(400).send(err)
    }
});

router.post('/replyEnquiry', auth, async (req, res) => {

    // const reply = new Enquiry(req.body)
    try {
        console.log("reply", req.body);
        // send enquiry to mail

        // const mail = {
        //     from : "shubhammore.developer@gmail.com",
        //     to : "shubhammore1796@gmail.com",
        //     subject : "Welcome to Nodemailer",
        //     text : "Welcome Shubham",
        //     html : "<b>Welcome</b>"
        // }

        // sendMail(mail)

        const data = {
            success : true
        }
        res.status(201).send(data)
    } catch (e) {
        let err = "Something bad happend";
        res.status(400).send(err)
    }
});


router.post('/getEnquiries', auth, async (req, res)=>{
    try {
        const enquiries = await Enquiry.find();
        if(!enquiries) {
            throw new Error("No Enquiry Found");
        }

        res.status(201).send(enquiries)
    } catch (e) {
        let err = "Something bad happend " + e;
        res.status(400).send(err)
    }
});

router.post('/getEnquiry', auth, async (req, res)=>{
    try {
        const enquiry = await Enquiry.findById(req.body._id);
        if(!enquiry) {
            throw new Error("No Enquiry Found");
        }

        res.status(201).send(enquiry)
    } catch (e) {
        let err = "Something bad happend";
        res.status(400).send(err)
    } 
});

module.exports = router