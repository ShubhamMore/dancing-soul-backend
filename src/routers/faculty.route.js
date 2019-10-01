const multer = require("multer")
const express = require('express')

const auth = require('../middleware/auth')

const storage = require("../image-upload/multerConfig")

const cloudinaryRemoveImage = require("../image-upload/cloudinaryRemoveImage")
const cloudinaryUploadImage = require("../image-upload/cloudinaryUploadImage")

const Faculty = require('../model/faculty.model')
const User = require("../model/user.model")

const user_image = require("../shared/user.image")

const sendMail = require("../mail/mail")

const router = new express.Router()

router.post("/addFaculty", auth, multer({ storage: storage }).single("image"), async (req, res) =>{

    const file = req.file;
    try {

        const data = req.body;
        
        const user = new User({
            email : data.email,
            password : data.phone,
            userType : "faculty"
        })
        
        await user.save()
        
        let image;

        if(file !== undefined) {
            let imagePath = file.path;
            let imageName = file.filename.split(".")[0];
        
            const cloudeDirectory = "faculties";
        
            try {
                const upload_responce = await cloudinaryUploadImage(imagePath, imageName, cloudeDirectory);
        
                const upload_res = upload_responce.upload_res;
                
                if(upload_res) {
                    const img_data = {
                        image_name : upload_res.original_filename + "." + upload_res.format,
                        secure_url : upload_res.secure_url,
                        public_id : upload_res.public_id,
                        created_at : upload_res.created_at
                    }
                    image = img_data;
                    
                }
            }
            catch(e) {
                image = user_image
            }
        }
        else {
            image = user_image
        }

        const facultyData = {
            name: data.name,
            birthDate: data.birthDate,
            description: data.description,
            image: image,
            email: data.email,
            phone: data.phone,
            status: data.status
        };
        
        const faculty = new Faculty(facultyData)

        await faculty.save()
        
        const mail = {
            from : provess.env.ADMIN_MAIL,
            to : faculty.email,
            subject : "Welcome to Dancing Soul",
            text : "Welcome " + faculty.name,
            html : "<b>Welcome</b>" + faculty.name +"<br>User Name : " + faculty.email +"<br>Password : " + faculty.phone
        }

        await sendMail(mail);

        res.status(200).send(user)  
    } catch (e) {
        let err = "Something bad happend, ";
        if(e.code == 11000) {
            err = "User alredy register, ";
        }
        err = err + e;
        res.status(400).send(err.replace('Error: ', ''));        
    }
});

router.post("/getFaculties", auth, async(req,res)=>{
    try {
        const faculties = await Faculty.find()
        if(!faculties) {
            throw new Error("No Faculty found");
        }
        res.status(200).send(faculties)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post("/getActivateFaculties", async(req,res)=>{
    try {
        const faculties = await Faculty.find({status : "1"})
        if(!faculties) {
            throw new Error("No Faculty found");
        }
        res.status(200).send(faculties)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post("/getFaculty", auth, async(req,res)=>{
    try {
        const faculty = await Faculty.findById(req.body._id)
        if(!faculty) {
            throw new Error("No Facultys found");
        }
        res.status(200).send(faculty)
        
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post("/changeFacultyStatus", auth, async(req, res)=>{
    try {

        const faculty = await Faculty.findByIdAndUpdate(req.body._id, {status : req.body.status})
        if(!faculty) {
            throw new Error("No Faculty found");
        }
        
        if(req.body.status === "0") {
            const user = await User.findOne({email : faculty.email});
            if(!user) {
                return;
            }
            await User.findByIdAndRemove(user._id);
            const mail = {
                from : provess.env.ADMIN_MAIL,
                to : faculty.email,
                subject : "Thanks for being part of Dancing Soul",
                text : "Thanks " + faculty.name,
                html : "<b>Thanks</b> " + faculty.name +" You are no longer part of dancing Soul Acadamy, Thanks for Supporting Us.."
            }
            await sendMail(mail);
        }

        else if(req.body.status === "1") {
            const user = new User({
                email : faculty.email,
                password : faculty.phone,
                userType : "faculty"
            })
            await user.save();
            const mail = {
                from : provess.env.ADMIN_MAIL,
                to : faculty.email,
                subject : "Welcome to Dancing Soul",
                text : "Welcome Back " + faculty.name,
                html : "<b>Welcome back </b>" + faculty.name +"<br>Userid : " + faculty.email +"<br>Password : " + faculty.phone
            }
            await sendMail(mail);
        }

        res.status(200).send(faculty)
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post("/editFaculty", auth, multer({ storage: storage }).single("image"), async(req,res)=>{

    const file = req.file;
    try {
        let image;

        const faculty = await Faculty.findById(req.body._id);
        
        if(!faculty) {
            throw new Error("No Faculty Found");
        }

        image = faculty.image;

        const img_pub_id = faculty.image.public_id;

        if(file !== undefined) {
            let imagePath = file.path;
            let imageName = file.filename.split(".")[0];
        
            const cloudeDirectory = "faculties";
        
            try {
                const upload_responce = await cloudinaryUploadImage(imagePath, imageName, cloudeDirectory);
        
                const upload_res = upload_responce.upload_res;
                
                if(upload_res) {
                    const img_data = {
                        image_name : upload_res.original_filename + "." + upload_res.format,
                        secure_url : upload_res.secure_url,
                        public_id : upload_res.public_id,
                        created_at : upload_res.created_at
                    }
                    image = img_data;
                }

                if(img_pub_id !== user_image.public_id) {
                    await cloudinaryRemoveImage(img_pub_id);
                }
            }
            catch(e) {
            }
        }

        const data = req.body;

        const facultyData = {
            _id : data._id,
            name: data.name,
            birthDate: data.birthDate,
            description: data.description,
            image: image,
            email: data.email,
            phone: data.phone,
            status: data.status
        };

        await Faculty.findByIdAndUpdate(data._id, facultyData);

        res.status(200).send({success: true})
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

router.post("/deleteFaculty", auth, async (req,res)=>{
    
    try {

        const user = await User.findByCredentials(req.user.email, req.body.password)
        if(!user) {
            throw new Error("Wrong Password, Please enter correct password");
        }

        const faculty = await Faculty.findById(req.body._id) 
        if(!faculty) {
            throw new Error("No faculty found");
        } 

        if(faculty.image.public_id !== user_image.public_id) {
            await cloudinaryRemoveImage(faculty.image.public_id);
        }

        await Faculty.findByIdAndDelete(req.body._id)

        await User.findByIdAndDelete(user._id);
        
        res.status(200).send({success : true})
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

module.exports = router;