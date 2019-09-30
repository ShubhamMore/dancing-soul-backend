const express = require('express')
const auth = require('../middleware/auth')
const Receipt = require('../model/receipt.model')
const router = new express.Router()

router.post("/addReceipt", auth, async (req,res) =>{

    const receipt = new Receipt(req.body)
    try {
        await receipt.save()      
        res.status(200).send({success : true})  
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post("/getReceipts", auth, async(req, res)=>{
    try {
        const receipts = await Receipt.find({student : req.body.student})
        if(!receipts) {
            throw new Error("No Receipt found");
        }
        res.status(200).send(receipts)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post("/getReceipt", auth, async(req,res)=>{
    try {
        const receipt = await Receipt.findById(req.body._id)
        if(!receipt) {
            throw new Error("No Receipt found");
        }
        res.status(200).send(receipt)
        
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post("/editReceipt", auth, async(req,res)=>{
    try {
        const receipt = await Receipt.findByIdAndUpdate(req.body._id, req.data)
        if(!receipt) {
            throw new Error("No Receipt found");
        }
        res.status(200).send(receipt)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post("/deleteReceipt", auth, async (req,res)=>{
    console.log(req.body)
    try {
        const receipt = await Receipt.findByIdAndDelete(req.body._id)
        if(!receipt) {
            throw new Error("No Receipt found");
        }  
        res.status(200).send({success : true})
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

module.exports = router;