const express = require('express')
const auth = require('../middleware/auth')
const Receipt = require('../model/receipt.model')
const router = new express.Router()

router.post("addReceipt", async (req,res) =>{
    const receipt = new Receipt(req.body.Receipt)
    try {
        await receipt.save()      
        res.status(200).send({success : true})  
    } catch (error) {
        let err = "Something bad happend";
        res.status(400).send(err)
    }
});

router.post("getReceipts", async(req, res)=>{
    try {
        const receipts = await Receipt.find()
        if(!receipts) {
            throw new Error("No Receipt found");
        }
        res.status(200).send(receipts)
    } catch (error) {
        console.log(error)
        res.status(401).send(error)
    }
});

router.post("getReceipt", async(req,res)=>{
    try {
        const receipt = await Receipt.findById(req.body._id)
        if(!receipt) {
            throw new Error("No Receipt found");
        }
        res.status(200).send(receipt)
        
    } catch (error) {
        console.log(error)
        res.status(401).send(error)
    }
});

router.post("editReceipt", async(req,res)=>{
    try {
        const receipt = Receipt.findByIdAndUpdate(req.body._id, req.data)
        if(!receipt) {
            throw new Error("No Receipt found");
        }
        res.status(200).send(receipt)
    } catch (error) {
        console.log(error)
        res.status(401).send(error)    
    }
});

router.post("deleteReceipt", async (req,res)=>{
    
    try {
        const receipt = Receipt.findByIdAndDelete(req.body._id) 
        if(!receipt) {
            throw new Error("No Receipt found");
        }  
        res.status(200).send({success : true})
    } catch (error) {
        res.status(401).send(error)    
    } 
});

module.exports = router;