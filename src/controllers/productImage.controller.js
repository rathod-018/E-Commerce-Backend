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

    const product = await Product.findById(productId)
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
            productId,
            url: img.secure_url,
            public_id: img.public_id
        })

        uploadedFiles.push(prodImage)

    }

    return res.status(200).json(
        new ApiResponse(200, uploadedFiles, "Product Image uploaded successfully")
    )
})


const getAllImageOfProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    if (!productId || !productId.trim() || !isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid productId");
    }

    const images = await ProductImage.find({ productId }).sort({ createdAt: -1 });

    if (!images.length) {
        return res.status(200).json(
            new ApiResponse(200, [], "No images found for this product")
        )
    }

    return res.status(200).json(
        new ApiResponse(200, images, "Images fetched successfully")
    )
})


const updateProductImage = asyncHandler(async (req, res) => {
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

    const imageLocalPath = req.file.path

    if (!imageLocalPath) {
        throw new ApiError(400, "no image file uploaded")
    }

    const newImage = await uploadOnCludinary(imageLocalPath)
    if (!newImage) {
        throw new ApiError(400, "Error while uploading file on cludinary")
    }

    imageDoc.url = newImage.secure_url
    imageDoc.public_id = newImage.public_id

    await imageDoc.save()

    return res.status(200).json(
        new ApiResponse(200, imageDoc, "Image updated successfully")
    )

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
    getAllImageOfProduct,
    updateProductImage,
    deleteProductImage
}