import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Product } from "../models/product.model.js"
import mongoose, { isValidObjectId } from "mongoose"
import { Cart } from "../models/cart.model"


const addCartItem = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    const { productId } = req.params
    const { quantity } = req.body

    if (!productId || !productId.trim() || !isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid productId")
    }

    const product = await Product.findById(productId)

    if (!product) {
        throw new ApiError(400, "Invalid productId")
    }

    if (!quantity || quantity === null) {
        throw new ApiError(400, "quantity is required")
    }

    if (quantity <= 0) {
        throw new ApiError(400, "quantity must be greter than 0")
    }

    let cart = await Cart.findOne({ userId, status: "active" })
    if (!cart) {
        cart = await Cart.create({
            userId,
            items: []
        })
    }

    let cartItem = cart.items.find((item) => item.product?.toString() === product._id.toString())

    if (cartItem) {
        cartItem.quantity += quantity
    }
    else {
        cart.items.push(
            {
                product: productId,
                quantity
            })
    }

    await cart.save()

    return res.status(200).json(
        new ApiResponse(200, cart, "Product successfully added to cart")
    )

})


const updateCartItem = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    const { productId } = req.params
    const { quantity } = req.body

    if (!productId || !productId.trim() || !isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid productId")
    }

    const product = await Product.findById(productId)

    if (!product) {
        throw new ApiError(400, "Invalid productId")
    }

    if (!quantity || quantity === null) {
        throw new ApiError(400, "quantity is required")
    }

    if (quantity <= 0) {
        throw new ApiError(400, "quantity must be greter than 0")
    }

    const cart = await Cart.findOne({ userId, status: "active" })

    if (!cart) {
        throw new ApiError(400, "User does not have any active cart")
    }

    const cartItem = cart.items?.find((item) => item.product?.toString() === product._id.toString())

    if (!cartItem) {
        throw new ApiError(404, "Item not found in cart")
    }

    cartItem.quantity += quantity

    await cart.save()

    return res.status(200).json(
        new ApiResponse(200, cart, "Cart item updated successfully")
    )
})


const removeCartItem = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    const { productId } = req.params

    if (!productId || !productId.trim() || !isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid productId")
    }

    const product = await Product.findById(productId)

    if (!product) {
        throw new ApiError(400, "Invalid productId")
    }

    const cart = await Cart.findOne({ userId, status: "active" })

    if (!cart) {
        throw new ApiError(400, "User does not have any active cart")
    }

    const itemExist = cart.items?.some(
        (item) => item.product?.toString() === product._id.toString()
    )

    if (!itemExist) {
        throw new ApiError(404, "Product does not exist in cart")
    }

    cart.items = cart.items?.filter(
        (item) => item.product?.toString() === product._id.toString()
    )

    await cart.save()

    return res.status(200).json(
        new ApiResponse(200, cart, "Item removed from cart successfully")
    )
})


const getCart = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const cart = await Cart.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                status: "active"
            }
        },
        {
            $unwind: "$items"
        },
        {
            $lookup: {
                from: "products",
                localField: "items.product",
                foreignField: "_id",
                as: "item.productInfo",
                pipeline: [
                    {
                        $lookup: {
                            from: "productImages",
                            localField: "_id",
                            foreignField: "productId",
                            as: "images",
                            pipeline: [
                                { $project: { url: 1 } },
                                { $limit: 1 }
                            ]
                        }
                    },
                    {
                        $project: {
                            sellerId: 0,
                            image: { $arrayElemAt: ["$images.url", 0] }
                        }
                    }
                ]
            }
        },
        { $project: { userId: 0 } }
    ])


    if (!cart.length) {
        return res.status(200).json(
            new ApiResponse(200, {}, "User done not have any element in cart")
        )
    }

    return res.status(200).json(
        new ApiResponse(200, cart[0], "Cart items fetched successfully")
    )
})

const checkOut = asyncHandler(async (req, res) => { })

export {
    addCartItem,
    updateCartItem,
    removeCartItem,
    getCart,
    checkOut
}