const express = require('express')
const auth = require('../middleware/auth')
const Article = require('../model/article.model')
const router = new express.Router()

router.post("/addArticle", async(req, res)=>{
    const article = new Article(req.body)
    try {
        await article.save()
        res.status(200).send({success : true})
    } catch (error) {
        res.status(401).send(error)    
    }
});

router.post("/getArticles", async(req,res)=>{
    try {
        const articles = await Article.find()
        if(!articles) {
            throw new Error("No Article found");
        }
        res.status(200).send(articles)
    } catch (error) {
        console.log(error)
        res.status(401).send(error)
    }
});

router.post("/getArticle", async(req,res)=>{
    try {
        const article = await Article.findById(req.body._id)
        if(!article) {
            throw new Error("No Articles found");
        }
        res.status(200).send(article)
        
    } catch (error) {
        console.log(error)
        res.status(401).send(error)
    }
})

router.post("/editArticle", async(req,res)=>{
    try {
        const article = await Article.findByIdAndUpdate(req.body._id, req.body)
        if(!article) {
            throw new Error("No Article found");
        }
        res.status(200).send(article)
    } catch (error) {
        console.log(error)
        res.status(401).send(error)    
    }
});

router.post("/deleteArticle", async(req,res)=>{
    
   try {
        const article = await Article.findByIdAndDelete(req.body._id) 
        if(!article) {
            throw new Error("No Articles found");
        }  
        res.status(200).send(article)
    } catch (error) {
        console.log(error)
        res.status(401).send(error)    
    } 
});

module.exports = router