const path = require("path")
const fs = require("fs")


const cloudinary = require("./cloudinaryConfig")

const uploadImageToCloude = async (filePath, fileName, cloudeDirectory) => {

    try {

        let res;
        
        console.log(path.join(__dirname, filePath))
        await cloudinary.v2.uploader.upload(
            filePath,
            { 
                folder: cloudeDirectory,
                public_id: fileName
            },
            (error, responce)  => {
                console.log(error, responce);
                if (error) {
                    console.log("error msg", error);
                    fs.unlink(path.join(__dirname, filePath), (err) => {
                        if (err) throw err;
                    });
                    res.status(400).send(error);
                    return;
                }
                
                console.log('file uploaded to Cloudinary');
                fs.unlink(path.join(__dirname, filePath), (err) => {
                    if (err) throw err;
                });
                res = responce;
            }
        )
        console.log(res)
        return res;
    }
    catch(e) {
        console.log(e);
    }
}

module.exports = uploadImageToCloude
