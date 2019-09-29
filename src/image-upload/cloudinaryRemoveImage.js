const cloudinary = require("./cloudinaryConfig")


const removeCloudeImage = async (public_id) => {

    try {
        const res = await cloudinary.v2.uploader.destroy(public_id, 
            (error, result) => {
                console.log(result, error)
                if(error) {
                    throw new Error("File cant Deleted");
                }
                return result;
            }
        );
        return res;
    }
    catch(e) {
        throw new Error("Something bad happen while removing file" + e);
    }
}

module.exports = removeCloudeImage