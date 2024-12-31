import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


async function uploadCloudinary(localFilePath,type,imgConfig){
    
    try {
        if(!localFilePath) return null;
        let response;
        if(type==="image"){
            response = await cloudinary.uploader.upload(
                localFilePath,
                imgConfig
            );
            
        }else if(type==="video"){
            
            response = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_large(
                    localFilePath,
                    {
                        resource_type: "video",
                        folder: 'udemy/lecture/videos',
                        format: "mp4"
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            fs.unlinkSync(localFilePath);
                            resolve(result);
                        }
                    }
                );
            });

        }else{
            response = await cloudinary.uploader.upload(
                localFilePath,
                {
                    resource_type:"raw",
                    folder: 'udemy/lecture/files'
                },
                
            );
        }

        if(type!=="video") fs.unlinkSync(localFilePath);
        
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath);

        return null ;

    }
}

export {
    cloudinary,
    uploadCloudinary
}