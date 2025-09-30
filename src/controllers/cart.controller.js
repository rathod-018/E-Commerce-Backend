import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Product } from "../models/product.model.js"
import mongoose, { isValidObjectId } from "mongoose"
import { Cart } from "../models/cart.model.js"
import { Address } from "../models/address.model.js"
import { Order } from "../models/order.model.js"
import { OrderItem } from "../models/orderItem.model.js"


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

    let cartItem = cart.items.find((item) => item.productId?.toString() === product._id.toString())

    if (cartItem) {
        cartItem.quantity += quantity
    }
    else {
        cart.items.push(
            {
                productId: product._id,
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

    const cartItem = cart.items?.find((item) => item.productId?.toString() === product._id.toString())

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
        (item) => item.productId?.toString() === product._id.toString()
    )

    if (!itemExist) {
        throw new ApiError(404, "Product does not exist in cart")
    }

    cart.items = cart.items?.filter(
        (item) => item.productId?.toString() === product._id.toString()
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

const checkout = asyncHandler(async (req, res) => {

    const userId = req.user._id
    const { addressId } = req.params

    const cart = await Cart.findOne({ userId, status: "active" }).populate("items.product")

    if (!cart || !cart.items.length) {
        throw new ApiError(400, "Cart is empty")
    }


    const items = []
    let totalPrice = 0

    for (const item of cart.items) {
        const product = item.productId

        if (!product) {
            throw new ApiError(400, "Product not found")
        }

        if (product.stockQty < item.quantity) {
            throw new ApiError(400, `Not enogh stock avaliable fro ${product.name}`)
        }

        const orderItem = await OrderItem.create(
            {
                productId: product._id,
                quantity: item.quantity,
                price: product.price
            }
        )


        items.push(orderItem._id)

        totalPrice += product.price * item.quantity

        product.stockQty -= item.quantity
        await product.save();
    }


    // validate address

    if (!addressId || !addressId.trim() || !isValidObjectId(addressId)) {
        throw new ApiError(400, "Invalid addressId")
    }

    const address = await Address.findById(addressId)

    if (!address) {
        throw new ApiError(400, "Invalid addressId")
    }


    // create order

    const order = await Order.create(
        {
            userId,
            items,
            status: "pending",
            shippingAddress: address._id,
            totalPrice
        }
    )


    // clear cart
    cart.items = []
    await cart.save()

    return res.status(201).json(
        new ApiResponse(201, order, "Order placed successfully")
    )
})

export {
    addCartItem,
    updateCartItem,
    removeCartItem,
    getCart,
    checkout
}