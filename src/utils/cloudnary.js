import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME , 
    api_key:process.env.CLOUDINARY_KEY , 
    api_secret: process.env.CLOUDINARY_SECERET
});
const uploadCloud= async (localFile)=>{
    try {
        if(!localFile) return null
      const responce = await cloudinary.uploader.upload(localFile,{
            resource_type : "auto",
        })
        console.log(`file upload sucessfully ${responce}`);
        fs.unlink(localFile, (err) => {
            if (err) {
              console.error(`Error deleting local file: ${err}`);
            } else {
              console.log('Local file deleted successfully');
            }
          });
        return responce
    } catch (error) {
        fs.unlink(localFile);
        console.log(`having error in uploadCloud ${error}`);
        return null
    }
}

export {uploadCloud}