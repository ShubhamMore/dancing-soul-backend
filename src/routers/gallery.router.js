const multer = require("multer")
const express = require('express')

const auth = require("../middleware/auth")
const Gallery = require("../model/gallery.model")

const storage = require("../image-upload/multerConfig")
const cloudinaryUploadImage = require("../image-upload/cloudinaryUploadImage")
const cloudinaryUploadImages = require("../image-upload/cloudinaryUploadImages")
const cloudinaryRemoveImage = require("../image-upload/cloudinaryRemoveImage")

const router = new express.Router()

router.post('/addImages', multer({ storage: storage }).array("image"), async (req, res) => {

    const file = req.files;
    let imagePaths = new Array();
    let imageNames = new Array();
    for(let i=0; i< file.length; i++) {
        imagePaths.push(file[i].path);
        imageNames.push(file[i].filename.split(".")[0]);
    }

    const cloudeDirectory = "blog";

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
                    created_at : upload_res[i].created_at
                }
                const gallery = new Gallery(img_data);
                const res = await gallery.save();
                responce.push(res);
            }
        }
    
        res.status(200).send({responce, upload_responce})
    }
    catch(e) {
        res.status(400).send(e);
    }

})

router.post('/addImage', multer({ storage: storage }).single("image"), async (req, res) => {

    const file = req.file;
    let imagePath = file.path;
    let imageName = file.filename.split(".")[0];

    const cloudeDirectory = "blog";

    const path = await cloudinaryUploadImage(imagePath, imageName, cloudeDirectory);

    res.status(200).send({responce: true, paths})
})

router.post("/removeImage", async (req, res) => {
    const id = req.body.public_id;
    await cloudinaryRemoveImage(id);
    res.send()
})

module.exports = router