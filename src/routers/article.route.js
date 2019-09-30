const express = require('express')
const auth = require('../middleware/auth')
const Article = require('../model/article.model')
const router = new express.Router()

router.post("/addArticle", auth, async(req, res)=>{
    const article = new Article(req.body)
    try {
        await article.save()
        res.status(200).send({success : true})
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post("/getArticles", async(req,res)=>{
    try {
        const articles = await Article.find()
        if(!articles) {
            throw new Error("No Article found");
        }
        res.status(200).send(articles)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }   
});

router.post("/getArticle", async(req,res)=>{
    try {
        const article = await Article.findById(req.body._id)
        if(!article) {
            throw new Error("No Articles found");
        }
        res.status(200).send(article)
        
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }   
})

router.post("/editArticle", auth, async(req,res)=>{
    try {
        const article = await Article.findByIdAndUpdate(req.body._id, req.body)
        if(!article) {
            throw new Error("No Article found");
        }
        res.status(200).send(article)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }   
});

router.post("/deleteArticle", auth, async(req,res)=>{
    
   try {
        const article = await Article.findByIdAndDelete(req.body._id) 
        if(!article) {
            throw new Error("No Articles found");
        }  
        res.status(200).send(article)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }   
});

module.exports = router