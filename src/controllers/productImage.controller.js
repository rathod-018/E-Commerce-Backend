import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCludinary, deleteFromCludinary } from "../utils/cludinary.js"
import { isValidObjectId } from "mongoose"
import { ProductImage } from "../models/productImage.model.js"
import { Product } from "../models/product.model.js"



const uploadProductImage = asyncHandler(async (req, res) => {
    const { productId } = req.params

    if (!productId.trim() || !isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid productId")
    }

    let product = await Product.findById(productId)
    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    const uploadedFiles = [];

    for (const file of req.files) {
        const localPath = file.path

        const img = await uploadOnCludinary(localPath)
        if (!img) {
            throw new ApiError(400, "Error while uploading file to cludinary")
        }

        const prodImage = await ProductImage.create({
            url: img.secure_url,
            public_id: img.public_id
        })
        uploadedFiles.push(prodImage._id)

    }
    product.productImage = uploadedFiles
    await product.save()

    const updatedProduct = await Product.findById(product._id).populate("productImage")

    return res.status(200).json(
        new ApiResponse(200, updatedProduct, "Product Image uploaded successfully")
    )
})


const updateProductImage = asyncHandler(async (req, res) => {
    const { productId, imageId } = req.params;

    if (!productId || !isValidObjectId(productId))
        throw new ApiError(400, "Invalid productId");

    if (!imageId || !isValidObjectId(imageId))
        throw new ApiError(400, "Invalid imageId");

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    const imageDoc = await ProductImage.findById(imageId);
    if (!imageDoc) throw new ApiError(404, "Image not found");

    if (!req.file || !req.file.path)
        throw new ApiError(400, "No image file uploaded");


    const result = await deleteFromCludinary(imageDoc.public_id, "image");
    if (result?.result !== "ok" && result.result !== "not found")
        throw new ApiError(500, "Failed to delete image from Cloudinary");


    const newImage = await uploadOnCludinary(req.file.path);
    if (!newImage) throw new ApiError(400, "Error uploading file to Cloudinary");


    imageDoc.url = newImage.secure_url;
    imageDoc.public_id = newImage.public_id;
    await imageDoc.save();

    return res.status(200).json(
        new ApiResponse(200, imageDoc, "Image updated successfully")
    );
})



const deleteProductImage = asyncHandler(async (req, res) => {
    const { productId, imageId } = req.params

    if (!productId || !isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid productId");
    }
    if (!imageId || !isValidObjectId(imageId)) {
        throw new ApiError(400, "Invalid imageId");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const imageDoc = await ProductImage.findById(imageId);
    if (!imageDoc) {
        throw new ApiError(404, "Image not found");
    }

    const result = await deleteFromCludinary(imageDoc?.public_id, "image")

    if (result?.result !== "ok" && result.result !== "not found") {
        throw new ApiError(500, "Failed to delete image from cludinary")
    }

    await imageDoc.deleteOne()

    return res.status(200).json(
        new ApiResponse(200, {}, "Product image deleted successfully")
    )
})


export {
    uploadProductImage,
    updateProductImage,
    deleteProductImage
}