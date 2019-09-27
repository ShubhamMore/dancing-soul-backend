const express = require('express')
const auth = require('../middleware/auth')
const Branch = require('../model/branch.model')
const router = new express.Router()

router.post('/addBranch', auth, async (req, res) => {
    console.log("add branch body ", req.body)

    const branch = new Branch(req.body)
    try {
        await branch.save()
        const data = {
            success : true
        }
        res.status(201).send(data)
    } catch (e) {
        let err = "Something bad happend";
        res.status(400).send(err)
    }
});

router.post('/getBranches', auth, async (req, res)=>{
    try {
        const branches = await Branch.find();
        if(!branches) {
            throw new Error("No Branch Found");
        }

        res.status(201).send(branches)
    } catch (e) {
        let err = "Something bad happend";
        res.status(400).send(err)
    }
});

router.post('/getActivateBranches', async (req, res)=>{
    try {
        const branch = await Branch.find({status : "1"});
        if(!branch) {
            throw new Error("No Branch Found");
        }

        res.status(201).send(branch)
    } catch (e) {
        let err = "Something bad happend";
        res.status(400).send(err)
    } 
});

router.post('/getBranch', auth, async (req, res)=>{
    try {
        const branch = await Branch.findById(req.body._id);
        if(!branch) {
            throw new Error("No Branch Found");
        }

        res.status(201).send(branch)
    } catch (e) {
        let err = "Something bad happend";
        res.status(400).send(err)
    } 
});

router.post('/editBranch', auth, async (req, res)=>{
    try {
        const branch = await Branch.findByIdAndUpdate(req.body._id, req.body);
        if(!branch) {
            throw new Error("No Branch Found");
        }

        const data = {
            success : true
        }
        res.status(201).send(data)
    } catch (e) {
        let err = "Something bad happend";
        res.status(400).send(err)
    } 
});

router.post('/changeBranchStatus', auth, async (req, res)=>{
    try {
        const branch = await Branch.findByIdAndUpdate(req.body._id, {status : req.body.status});
        if(!branch) {
            throw new Error("No Branch Found");
        }

        const data = {
            success : true
        }
        res.status(201).send(data)
    } catch (e) {
        let err = "Something bad happend";
        res.status(400).send(err)
    } 
});

router.post('/deleteBranch', auth, async (req, res)=>{
    try {
        const branch = await Branch.findByIdAndDelete(req.body._id);
        if(!branch) {
            throw new Error("No Branch Found");
        }

        const data = {
            success : true
        }
        res.status(201).send(data)
    } catch (e) {
        let err = "Something bad happend";
        res.status(400).send(err)
    } 
});

module.exports = router