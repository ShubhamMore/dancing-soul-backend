const multer = require("multer")
const express = require('express')

const auth = require('../middleware/auth')

const storage = require("../image-upload/multerConfig")

const cloudinaryRemoveImage = require("../image-upload/cloudinaryRemoveImage")
const cloudinaryUploadImages = require("../image-upload/cloudinaryUploadImages")

const Identity = require("../model/identity.model")

const findIndexByKey = require("../shared/findIndex")

const router = new express.Router()

router.post('/addIdentity', auth, multer({ storage: storage }).array("image"), async(req, res) => {
    
    const images = new Array();
    const file = req.files;
    try {

        if(file.length > 0) {
            let imagePaths = new Array();
            let imageNames = new Array();
            for(let i=0; i< file.length; i++) {
                imagePaths.push(file[i].path);
                imageNames.push(file[i].filename.split(".")[0]);
            }
        
            const cloudeDirectory = "identities";
        
            try {
                const upload_responce = await cloudinaryUploadImages(imagePaths, imageNames, cloudeDirectory);
        
                const upload_res = upload_responce.upload_res;
                const upload_res_len = upload_res.length;
                
                if(upload_res_len > 0) {
                    for(let i=0; i<upload_res_len; i++) {

                        const img_data = {
                            image_name: upload_res[i].original_filename + "." + upload_res[i].format,
                            secure_url: upload_res[i].secure_url,
                            public_id: upload_res[i].public_id,
                            created_at: upload_res[i].created_at,
                            width: upload_res[i].width,
                            height: upload_res[i].height
                        }
                        images.push(img_data);
                    }
                }
            }
            catch(e) {
                throw new Error("Operation Failed..");
            }
        }
        else {
            throw new Error("Please Provice Identity");
        }

        const identityData = {
            student: req.body.student,
            identityImages : images
        };

        const identity = new Identity(identityData)

        console.log(identity)

        await identity.save()
        
        res.status(200).send({success : true})
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
})

router.post("/getIdentity", auth, async (req, res) => {
    try {
        console.log(req.body)
        const identity = await Identity.findOne({student: req.body.student});
        res.status(200).send(identity);
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post("/editIdentity", auth, multer({ storage: storage }).array("image"), async (req, res) => {

    let images = new Array();
    const file = req.files;
    try {

        const identity = await Identity.findById(req.body._id);

        if(!identity) {
            throw new Error("No Identity Found");
        }

        images = identity.identityImages;

        const public_ids = new Array()

        images.forEach((image) => {
            public_ids.push(image.public_id);
        });
 
        if(file.length > 0) {
            
            let imagePaths = new Array();
            let imageNames = new Array();
            for(let i=0; i< file.length; i++) {
                imagePaths.push(file[i].path);
                imageNames.push(file[i].filename.split(".")[0]);
            }
        
            const cloudeDirectory = "identities";
        
            try { 
                const upload_responce = await cloudinaryUploadImages(imagePaths, imageNames, cloudeDirectory);
        
                const upload_res = upload_responce.upload_res;
                const upload_res_len = upload_res.length;
                
                if(upload_res_len > 0) {
                    for(let i=0; i<upload_res_len; i++) {

                        const img_data = {
                            image_name: upload_res[i].original_filename + "." + upload_res[i].format,
                            secure_url: upload_res[i].secure_url,
                            public_id: upload_res[i].public_id,
                            created_at: upload_res[i].created_at,
                            width: upload_res[i].width,
                            height: upload_res[i].height
                        }
                        images.push(img_data);

                        let public_id_to_remove;

                        public_ids.forEach((public_id) => {
                            if(public_id.split('-')[0] == upload_res[i].public_id.split('-')[0]) {
                                public_id_to_remove = public_id;
                            }
                        });

                        if(public_id_to_remove) {
                            const res = await cloudinaryRemoveImage(public_id_to_remove);
    
                            if(res.result == 'ok') {
                                const index = findIndexByKey(images, "public_id", public_id_to_remove);
                                if(index !== null) {
                                    images.splice(index, 1);
                                }
                            }
                        }
                    }
                }
            }
            catch(e) {
                throw new Error("Operation Failed..");
            }
        }

        const identityData = {
            _id : req.body._id,
            student: req.body.student,
            identityImages : images
        };

        await Identity.findByIdAndUpdate(identityData._id, identityData);
        
        res.status(200).send({success : true});

    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

module.exports = router