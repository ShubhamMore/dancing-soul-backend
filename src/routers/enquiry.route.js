const express = require('express')
const auth = require('../middleware/auth')
const Enquiry = require('../model/enquiry.model')
const router = new express.Router()

router.post('/sendEnquiry', auth, async (req, res) => {

    const enquiry = new Enquiry(req.body)
    try {
        await enquiry.save()
        // send wnquiry to mail
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
        const data = {
            success : true
        }
        res.status(201).send(data)
    } catch (e) {
        let err = "Something bad happend";
        res.status(400).send(err)
    }
});


router.post('/getEnquiries', async (req, res)=>{
    try {
        const enquiries = await Enquiry.find();
        if(!enquiryes) {
            throw new Error("No Enquiry Found");
        }

        res.status(201).send(enquiries)
    } catch (e) {
        let err = "Something bad happend";
        res.status(400).send(err)
    }
});

router.post('/getEnquiry', async (req, res)=>{
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