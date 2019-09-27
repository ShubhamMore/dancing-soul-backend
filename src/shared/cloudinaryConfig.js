const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'shubhamore',
    api_key: '215866698429818',
    api_secret: 'IdnqaAV6TOYeIdloKI4IMBtfSuA'
});

exports.uploads = (file) =>{
    return new Promise(resolve => {
        cloudinary.uploader.upload(file, (result) =>{
            resolve({
                url: result.url,
                id: result.public_id
            })
        }, 
        {
            resource_type: "auto"
        })
    })
}