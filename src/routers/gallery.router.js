const multer = require("multer")
const express = require('express')

const auth = require("../middleware/auth")
const Gallery = require("../model/gallery.model")

const storage = require("../image-upload/multerConfig")
const cloudinaryUploadImage = require("../image-upload/cloudinaryUploadImage")
const cloudinaryUploadImages = require("../image-upload/cloudinaryUploadImages")
const cloudinaryRemoveImage = require("../image-upload/cloudinaryRemoveImage")

const fs = require("fs")
const path = require("path")

const router = new express.Router()

router.post('/addImages',  multer({ storage: storage }).array("image"), async (req, res) => {

    const file = req.files;
    if(file !== undefined) {
        let imagePaths = new Array();
        let imageNames = new Array();
        for(let i=0; i< file.length; i++) {
            imagePaths.push(file[i].path);
            imageNames.push(file[i].filename.split(".")[0]);
        }
    
        const cloudeDirectory = "gallery";
    
        try {
            const upload_responce = await cloudinaryUploadImages(imagePaths, imageNames, cloudeDirectory);
    
            const upload_res = upload_responce.upload_res;
            const upload_res_len = upload_res.length;
    
            const responce = new Array();
            
            if(upload_res_len > 0) {
                for(let i=0; i<upload_res_len; i++) {
                    const img_data = {
                        image_name : upload_res[i].original_filename + "." + upload_res[i].format,
                        secure_url : upload_res[i].secure_url,
                        public_id : upload_res[i].public_id,
                        created_at : upload_res[i].created_at,
                        width: upload_res[i].width,
                        height: upload_res[i].height
                    }
                    const gallery = new Gallery(img_data);
                    const res = await gallery.save();
                    responce.push(res);
                }
            }
        
            res.status(200).send({responce, upload_responce})
        } catch (e) {
            const err = "Something bad happen, " + e;
            res.status(400).send(err.replace('Error: ', ''));
        }
    }
    else {
        res.status(400).send({error : "File Not Found"})
    }

})

router.post('/addImage', auth, multer({ storage: storage }).single("image"), async (req, res) => {

    const file = req.file;
    let imagePath = file.path;
    let imageName = file.filename.split(".")[0];

    const cloudeDirectory = "gallery";

    try {
        const upload_responce = await cloudinaryUploadImage(imagePath, imageName, cloudeDirectory);
    
        const upload_res = upload_responce.upload_res;

        const img_data = {
            image_name : upload_res.original_filename + "." + upload_res.format,
            secure_url : upload_res.secure_url,
            public_id : upload_res.public_id,
            created_at : upload_res.created_at,
            width: upload_res.width,
            height: upload_res.height
        }

        const gallery = new Gallery(img_data);

        const responce = await gallery.save();

        res.status(200).send({responce, upload_responce})
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
})

router.post("/getImages", async (req, res) => {
    
    try {
        const images = await Gallery.find();
        res.status(200).send(images)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
})

router.post("/getAllImages", async (req, res) => {
    
    try {
        
        const images = await Gallery.find({}, {_id: 0, secure_url: 1, width: 1, height: 1});

        const saveImages = new Array();
        images.forEach((curImage) => {
            const image = {
                path: curImage.secure_url,
                width: curImage.width,
                height: curImage.height
            }
            saveImages.push(image);
        });
       const imagePath = path.join(__dirname, "../../", "images/images.json");
        fs.writeFileSync(imagePath, JSON.stringify(saveImages));
        res.status(200).send(images)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
})

router.post("/removeImage", auth, async (req, res) => {

    const public_id = req.body.public_id;
    try {  
        await Gallery.findOneAndRemove({public_id});
        
        const responce = await cloudinaryRemoveImage(public_id);

        res.status(200).send(responce)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
})

module.exports = router