import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// function to upload files on cludinary
const uploadOnCludinary = async function (localFilePath) {
    try {

        if (!localFilePath) return null

        const result = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" })
        console.log("File uploaded successfully", result.url)
        fs.unlinkSync(localFilePath)
        return result
    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log("Error while uploading file on cludinary")
        throw error.message
    }
}


// function to delere files from cludinary
const deleteFromCludinary = async function (public_id, resource_type = "auto") {
    try {

        const result = await cloudinary.uploader.destroy(public_id, { resource_type })
        console.log("Response", result)
        console.log("File deleted successfully from cludinary")

        return result

    } catch (error) {
        console.log("Error while deleting file from cludinary")
        throw error.message
    }
}

export { uploadOnCludinary, deleteFromCludinary }