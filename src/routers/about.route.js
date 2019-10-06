const express = require('express')
const auth = require('../middleware/auth')
const About = require('../model/about.model')
const router = new express.Router()

router.post('/addAbout', auth, async(req, res)=>{
    const about = new About(req.body);
    try {
        await about.save();
        res.status(200).send(about)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }   
});

router.post('/getAbout', async(req, res)=>{
    try {
        const about = await About.find()
        if(!about[0]) {
            throw new Error("No About Info Found");
        }
        res.status(200).send(about[0])
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }   
});

router.post('/saveAbout', auth, async(req, res)=>{
    try {
        const about = await About.findByIdAndUpdate(req.body._id, req.body)
        if(!about) {
            throw new Error("No About Info Found");
        }
        res.status(200).send(about)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }   
});

module.exports = router