const path = require("path")
const fs = require("fs")


const cloudinary = require("./cloudinaryConfig")

const uploadImagesToCloude = async (filePaths, imageNames, cloudeDirectory) => {

    try {

        let upload_len = filePaths.length
        let upload_res = new Array();
        let upload_err = new Array();
        let file_err = new Array();
    
        for(let i = 0; i < upload_len; i++)
        {
            let filePath = filePaths[i];
            let fileName = imageNames[i];
            console.log(path.join(__dirname, filePath))
            await cloudinary.v2.uploader.upload(
                filePath,
                { 
                    folder: cloudeDirectory,
                    public_id: fileName
                },
                (error, responce)  => {
                    if (error) {
                        console.log("error msg", error);
                        fs.unlink(path.join(__dirname, filePath), (err) => {
                            if (err) {
                                file_err.push(err);
                            }
                        });
                        upload_err.push(error);
                    }
                    
                    fs.unlink(path.join(__dirname, filePath), (err) => {
                        if (err) {
                            file_err.push(err);
                        }
                    });
                    upload_res.push(responce)
                }
            )
        }

        console.log(upload_res, upload_err, file_err);
        return {upload_res, upload_err, file_err};
    }
    catch(e) {
        throw new Error("Something bad happen, While uploading the files" + e)
    }
}

module.exports = uploadImagesToCloude
