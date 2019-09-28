const path = require("path")
const fs = require("fs")


const cloudinary = require("./cloudinaryConfig")

const uploadImagesToCloude = async (filePaths, imageNames, cloudeDirectory) => {

    try {

        let upload_len = filePaths.length
        let upload_res = new Array();
    
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
                    upload_res.push(responce)
                }
            )
        }
        console.log(upload_res)
        return upload_res;
    }
    catch(e) {
        console.log(e);
    }
}

module.exports = uploadImagesToCloude
