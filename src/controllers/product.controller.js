import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Product } from "../models/product.model.js"
import { Categories } from "../models/categories.model.js"
import { isValidObjectId } from "mongoose"

const createProduct = asyncHandler(async (req, res) => {

    const { sellerId } = req.params
    if (!sellerId.trim() || !isValidObjectId(sellerId)) {
        throw new ApiError(400, "invalid userId")
    }

    const { name, description, price, stockQty, category } = req.body
    if ([name, description, category].some((val) => val.trim() === "")) {
        throw new ApiError(400, "all fields are requires")
    }

    if (price === null || stockQty === null) {
        throw new ApiError(400, "Price and stock quantity are required")
    }

    const getCategory = await Categories.findOne({ name: category })

    if (!getCategory) {
        throw new ApiError(400, "Invalid category")
    }

    const product = await Product.create(
        {
            name,
            description,
            price,
            stockQty,
            category,
            sellerId,
            category: getCategory._id
        })

    const createProduct = await Product.findById(product._id).populate("sellerId", "-password").populate("category")

    if (!createProduct) {
        throw new ApiError(500, "Failed to create product")
    }

    return res.status(201).json(
        new ApiResponse(201, createProduct, "Product created successfully")
    )
})


const getProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    if (!productId || !productId.trim() || !isValidObjectId(productId)) {
        throw new ApiError(400, "invalid productId")
    }

    const product = await Product.findById(productId).populate("sellerId", "-password").populate("category")

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    return res.status(200).json(
        new ApiResponse(200, product, "Product fetched successfully")
    )
})


const updateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    if (!productId || !productId?.trim() || !isValidObjectId(productId)) {
        throw new ApiError(400, "invalid productId")
    }
    const { name, description, price, stockQty, category } = req.body
    if ([name, description, category].some((val) => val?.trim() === "")) {
        throw new ApiError(400, "all fields are requires")
    }

    if (price === null || stockQty === null) {
        throw new ApiError(400, "Price and stock quantity are required")
    }

    const getCategory = await Categories.findOne({ name: category })

    if (!getCategory) {
        throw new ApiError(400, "Invalid category")
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, {
        name,
        description,
        price,
        stockQty,
        category: getCategory._id
    }, { new: true }).populate("sellerId", "-password").populate("category")

    if (!updatedProduct) {
        throw new ApiError(404, "Product not found")
    }

    return res.status(200).json(
        new ApiResponse(200, updatedProduct, "Product updated successfully")
    )
})


const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    if (!productId?.trim() || !isValidObjectId(productId)) {
        throw new ApiError(400, "invalid productId")
    }

    const deletedProduct = await Product.findByIdAndDelete(productId)

    if (!deletedProduct) {
        throw new ApiError(404, "Product not found")
    }

    return res.status(200).json(
        new ApiResponse(200, deletedProduct, "Product deleted successfully")
    )
})


const listProducts = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10
    const page = parseInt(req.query.page) || 1
    const { sortBy } = req.query.sortBy || "createdAt"
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1

    const aggregation = Product.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "sellerId",
                foreignField: "_id",
                as: "seller",
                pipeline: [
                    {
                        $project: {
                            name: 1, email: 1, role: 1, avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: "$seller"
        },
        {
            $unwind: "$category"
        },
        {
            $sort: {
                [sortBy]: sortOrder
            }
        }
    ])

    const option = {
        page,
        limit
    }

    const products = await Product.aggregatePaginate(aggregation, option)

    return res.status(200).json(
        new ApiResponse(200, products, "Products fetched successfully")
    )

})

export {
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct,
    listProducts
}