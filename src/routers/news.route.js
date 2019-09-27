const express = require('express')
const auth = require('../middleware/auth')
const News = require('../model/news.model')
const router = new express.Router()


router.post("/addNews", auth, async (req, res) =>{
    const news = new News(req.body)
    try {
        await news.save()      
        res.status(200).send({success : true})  
    } catch (error) {
        let err = "Something bad happend";
        res.status(400).send(err)
    }
});

router.post("/getAllNews", async(req, res)=>{
    try {
        const allNews = await News.find()
        if(!allNews) {
            throw new Error("No news found");
        }
        res.status(200).send(allNews)
    } catch (error) {
        console.log(error)
        res.status(401).send(error)
    }
});

router.post("/getNews", async(req,res)=>{
    try {
        const news = await News.findById(req.body._id)
        if(!news) {
            throw new Error("No news found");
        }
        res.status(200).send(news)
        
    } catch (error) {
        console.log(error)
        res.status(401).send(error)
    }
});

router.post("/editNews", auth, async(req, res)=>{
    try {
        const news = await News.findByIdAndUpdate(req.body._id, req.body)
        if(!news) {
            throw new Error("No news found");
        }
        res.status(200).send(news)
    } catch (error) {
        console.log(error)
        res.status(401).send(error)    
    }
});

router.post("/deleteNews", auth, async (req, res)=>{
    
    try {
        const news = await News.findByIdAndDelete(req.body._id) 
        if(!news) {
            throw new Error("No news found");
        }  
        res.status(200).send({success : true})
    } catch (error) {
        res.status(401).send(error)    
    } 
});

module.exports = router;