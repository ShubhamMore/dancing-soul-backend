const path = require("path")
const fs = require("fs")


const cloudinary = require("./cloudinaryConfig")

const uploadImageToCloude = async (filePath, fileName, cloudeDirectory) => {

    try {

        let upload_res;
        let upload_err;
        let file_err;
        
        await cloudinary.v2.uploader.upload(
            filePath,
            { 
                folder: cloudeDirectory,
                public_id: fileName
            },
            (error, responce)  => {
                if (error) {

                    fs.unlink(path.join(__dirname, "../../", filePath), (err) => {
                        if (err) {
                            file_err = err;
                        }
                    });
                    upload_err = error;
                }
                
                fs.unlink(path.join(__dirname, "../../", filePath), (err) => {
                    if (err) {
                        file_err = err;
                    }
                });
                upload_res = responce;
            }
        )
        return {upload_res, upload_err, file_err};
    }
    catch(e) {
        const err = "Something bad happen while uploading image file, " + e;
        throw new Error(err.replace('Error: ', ''));
    }
}

module.exports = uploadImageToCloude
