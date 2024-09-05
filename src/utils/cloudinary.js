import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_ACCESS_KEY,
    api_secret: process.env.CLOUDINARY_ACCESS_TOKEN,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        fs.unlink(localFilePath, () => console.log("file is removed"));
        return response;
    } catch (error) {
        console.log("File is not uploaded", error);
        await fs.unlink(localFilePath, () => console.log("file is removed"));
    }
};

export { uploadOnCloudinary };
