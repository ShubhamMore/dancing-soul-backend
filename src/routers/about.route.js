const express = require('express')
const auth = require('../middleware/auth')
const About = require('../model/about.model')
const router = new express.Router()

router.post('/addAbout', auth, async(req, res)=>{
    const about = new About(req.body);
    try {
        await about.save();
        res.status(200).send(about)
    } catch (error) {
        res.status(401).send(error)
    }   
});

router.post('/getAbout', async(req, res)=>{
    try {
        const about = await About.find()
        if(!about) {
            throw new Error("No About Info Found");
        }
        res.status(200).send(about)
    } catch (error) {
        res.status(401).send(error)
    }   
});

router.post('/editAbout', auth, async(req, res)=>{
    try {
        const about = await About.findByIdAndUpdate(req.body._id, req.body)
        if(!about) {
            throw new Error("No About Info Found");
        }
        res.status(200).send(about)
    } catch (error) {
        res.status(401).send(error)
    }   
});

module.exports = router