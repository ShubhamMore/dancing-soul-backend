const multer = require("multer")
const express = require('express')

const auth = require("../middleware/auth")
const Gallery = require("../model/gallery.model")
const Video = require("../model/video.model")

const storage = require("../image-upload/multerConfig")
const cloudinaryUploadImage = require("../image-upload/cloudinaryUploadImage")
const cloudinaryUploadImages = require("../image-upload/cloudinaryUploadImages")
const cloudinaryRemoveImage = require("../image-upload/cloudinaryRemoveImage")

const fs = require("fs")
const path = require("path")

const router = new express.Router()

const writeImagesToFile = async(category) => {

    const categoryType = new RegExp(".*" + category + ".*");
    
    const images = await Gallery.find({image_name: categoryType}, {_id: 0, secure_url: 1, width: 1, height: 1});            
            
    const saveImages = new Array();

    images.forEach((curImage) => {
        const devicePreviews = {
        };
                
        devicePreviews.preview_xxs = {
            path: curImage.secure_url,
            width: curImage.width,
            height: curImage.height
        }
        devicePreviews.preview_xs = {
            path: curImage.secure_url,
            width: curImage.width,
            height: curImage.height
        }
        devicePreviews.preview_s = {
            path: curImage.secure_url,
            width: curImage.width,
            height: curImage.height
        }
        devicePreviews.preview_m = {
            path: curImage.secure_url,
            width: curImage.width,
            height: curImage.height
        }
        devicePreviews.preview_l = {
            path: curImage.secure_url,
            width: curImage.width,
            height: curImage.height
        }
        devicePreviews.preview_xl = {
            path: curImage.secure_url,
            width: curImage.width,
            height: curImage.height
        }
        devicePreviews.raw = {
            path: curImage.secure_url,
            width: curImage.width,
            height: curImage.height
        }

        saveImages.push(devicePreviews);
    });

    let imagePath;

    if(category == "mdp") {
        imagePath = path.join(__dirname, "../../", "images/mdp.json");
    } else if(category == "itc") {
        imagePath = path.join(__dirname, "../../", "images/itc.json");
    } else if(category == "mdm") {
        imagePath = path.join(__dirname, "../../", "images/mdm.json");
    } else {
        imagePath = path.join(__dirname, "../../", "images/images.json");
    }
    fs.writeFileSync(imagePath, JSON.stringify(saveImages), (err) => {                  
        if (err) {
            console.log(err);
        }                           
       });
    return;
}

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

            await writeImagesToFile(req.body.category);
        
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

        await writeImagesToFile(req.body.category);

        res.status(200).send({responce, upload_responce})
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
})

router.post("/getImages", async (req, res) => {

    try {
        const categoryType = new RegExp(".*" + req.body.category + ".*");
        const images = await Gallery.find({image_name: categoryType});
        res.status(200).send(images)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
})

router.post("/getAllImages", async (req, res) => {
    
    try {
        
        const images = await Gallery.find({}, {_id: 0, secure_url: 1, width: 1, height: 1});

        res.status(200).send(images)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
})

router.post("/removeImage", auth, async (req, res) => {

    const public_id = req.body.public_id;
    try {
        const image = await Gallery.findOneAndRemove({public_id});

        if(!image) {
            throw new Error("No Image Found");
        }

        const category = image.image_name.split("-")[0].substr(0, 3);
        
        const responce = await cloudinaryRemoveImage(public_id);

        await writeImagesToFile(category);

        res.status(200).send(responce)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
})

router.post("/addVideo", auth, async (req, res) => {
    try {
        const video = new Video(req.body);
        await video.save();
        res.status(200).send({success: true});
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post("/getVideos", async (req, res) => {
    try {
        const video = await Video.find();
        res.status(200).send(video);
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
})

router.post("/getVideo", async (req, res) => {
    try {
        const video = await Video.findById(req.body._id);

        if(!video) {
            throw new Error("No Video Found");
        }

        res.status(200).send(video);
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
})

router.post("/removeVideo", auth, async (req, res) => {
    try {
        const video = await Video.findByIdAndRemove(req.body._id);

        if(!video) {
            throw new Error("No Video Found");
        }
        
        res.status(200).send({success: true});
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
})

module.exports = router