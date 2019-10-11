const multer = require("multer")
const express = require('express')

const auth = require('../middleware/auth')

const storage = require("../image-upload/multerConfig")

const cloudinaryRemoveImage = require("../image-upload/cloudinaryRemoveImage")
const cloudinaryUploadImage = require("../image-upload/cloudinaryUploadImage")

const Certificate = require("../model/certificate.model")

const findIndexByKey = require("../shared/findIndex")

const router = new express.Router()

router.post('/saveCertificate', auth, multer({ storage: storage }).single("image"), async(req, res) => {
    
    const file = req.file;
    try {
        let images = new Array();
        let certificate;
        if(req.body._id) {
            certificate = await Certificate.findById(req.body._id);
            if(certificate) {
                images = certificate.certificateImages
            }
        }
        
        if(file !== undefined) {
            let imagePath = file.path;
            let imageName = file.filename.split(".")[0];
        
            const cloudeDirectory = "certificates";
        
            try {
                const upload_responce = await cloudinaryUploadImage(imagePath, imageName, cloudeDirectory);
        
                const upload_res = upload_responce.upload_res;
                
                if(upload_res) {
                    const img_data = {
                        image_name : upload_res.original_filename + "." + upload_res.format,
                        secure_url : upload_res.secure_url,
                        public_id : upload_res.public_id,
                        created_at : upload_res.created_at,
                        width: upload_res.width,
                        height: upload_res.height
                    }
                    images.push(img_data);
                    
                }
            }
            catch(e) {
                throw new Error("Operation Failed.. " + e);
            }
        }
        else {
            throw new Error("Operation Failed.. ");
        }

        const certificateData = {
            student: req.body.student,
            certificateImages: images,
        };

        if(req.body._id) {
            certificateData._id = req.body._id;
            await Certificate.findByIdAndUpdate(certificateData._id, certificateData);
        }
        else {
            certificate = new Certificate(certificateData);
            await certificate.save();
        }
            

        res.status(200).send({success: true});  
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post("/getCertificates", auth, async (req, res) => {
    try {
        const certificate = await Certificate.findOne({student: req.body.student});
        res.status(200).send(certificate);
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post("/removeCertificate", auth, async (req, res) => {

    try {

        const certificate = await Certificate.findById(req.body._id);

        if(!certificate) {
            throw new Error("No certificate Found");
        }

        images = certificate.certificateImages;
        
        const responce = await cloudinaryRemoveImage(req.body.public_id);

        if(responce.result == 'ok') {
            const index = findIndexByKey(images, "public_id", req.body.public_id);
            if(index !== null) {
                images.splice(index, 1);
            }
        }
        
        const certificateData = {
            _id : certificate._id,
            student: certificate.student,
            certificateImages : images
        };

        await Certificate.findByIdAndUpdate(certificateData._id, certificateData);
        
        res.status(200).send({success : true});

    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

module.exports = router