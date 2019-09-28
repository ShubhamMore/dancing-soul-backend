const cloudinary = require("./cloudinaryConfig")


const removeCloudeImage = async (public_id) => {
    await cloudinary.v2.uploader.destroy(public_id, 
        (error, result) => {
            console.log(result, error) 
        }
    );
}

module.exports = removeCloudeImage