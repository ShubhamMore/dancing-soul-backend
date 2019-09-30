const express = require('express')
const auth = require('../middleware/auth')
const Enquiry = require('../model/enquiry.model')
const sendMail = require("../mail/mail")

const router = new express.Router()

router.post('/sendEnquiry', async (req, res) => {

    const enquiry = new Enquiry(req.body)
    try {
        await enquiry.save()
        // send enquiry to mail

        // const mail = {
        //     from : enquiry.from,
        //     to : "shubhammore1796@gmail.com",
        //     subject : "Welcome to Nodemailer",
        //     text : "",
        //     html : "<b>Welcome</b>"
        // }

        // sendMail(mail)

        const data = {
            success : true
        }
        res.status(200).send(data)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post('/replyEnquiry', auth, async (req, res) => {

    // const reply = new Enquiry(req.body)
    try {
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
        res.status(200).send(data)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});


router.post('/getUnseenEnquiries', auth, async (req, res)=>{
    try {
        const enquiries = await Enquiry.find({seen : "0"});
        if(!enquiries) {
            throw new Error("No Enquiry Found");
        }

        res.status(200).send({ unseenEnquiries : enquiries.length})
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post('/getEnquiries', auth, async (req, res)=>{
    try {
        const enquiries = await Enquiry.find();
        if(!enquiries) {
            throw new Error("No Enquiry Found");
        }

        res.status(200).send(enquiries)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post('/enquirySeen', auth, async (req, res)=>{
    try {
        const enquiry = await Enquiry.findByIdAndUpdate(req.body._id, {seen : "1"});
        if(!enquiry) {
            throw new Error("No Enquiry Found");
        }

        res.status(200).send({success : true})
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post('/getEnquiry', auth, async (req, res)=>{
    try {
        const enquiry = await Enquiry.findById(req.body._id);
        if(!enquiry) {
            throw new Error("No Enquiry Found");
        }

        res.status(200).send(enquiry)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

module.exports = router