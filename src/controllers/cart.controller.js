import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Product } from "../models/product.model.js"
import mongoose, { isValidObjectId } from "mongoose"
import { Cart } from "../models/cart.model.js"
import { Address } from "../models/address.model.js"
import { Order } from "../models/order.model.js"
import { OrderItem } from "../models/orderItem.model.js"
import { CartItem } from "../models/cartItem.model.js"
import { populate } from "dotenv"


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


    let cartItem = await CartItem.findOne({
        _id: { $in: cart.items },
        product: productId
    })


    if (cartItem) {
        cartItem.quantity += quantity
        await cartItem.save()
    }
    else {
        cartItem = await CartItem.create({
            product: productId,
            quantity
        })

        cart.items.push(cartItem._id)
        await cart.save()
    }

    cart = await Cart.findById(cart._id)
        .populate({
            path: "items",
            populate: {
                path: "product",
                model: "Product"
            }
        })

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

    let cart = await Cart.findOne({ userId, status: "active" })

    if (!cart) {
        throw new ApiError(400, "User does not have any active cart")
    }

    const cartItem = await CartItem.findOne({
        product: productId,
        _id: { $in: cart.items }
    })

    if (!cartItem) {
        throw new ApiError(404, "Item not found in cart")
    }

    cartItem.quantity = quantity

    await cartItem.save()

    cart = await Cart.findById(cart._id)
        .populate({
            path: "items",
            populate: {
                path: "product",
                model: "Product"
            }
        })

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

    const cartItem = await CartItem.findOne({
        _id: { $in: cart.items },
        product: productId
    })

    if (!cartItem) {
        throw new ApiError(404, "Product does not exist in cart")
    }

    const updatedCart = await Cart.findByIdAndUpdate(
        cart._id,
        { $pull: { items: cartItem._id } },
        { new: true }
    ).populate({
        path: "items",
        populate: {
            path: "product",
            model: "Product"
        }
    })

    await cartItem.deleteOne()

    return res.status(200).json(
        new ApiResponse(200, updatedCart, "Item removed from cart successfully")
    )
})


const getCart = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const cart = await Cart.findOne({ userId, status: "active" })
        .populate({
            path: "items",
            populate: {
                path: "product",
                model: "Product"
            }
        })
    if (!cart) {
        return res.status(200).json(
            new ApiResponse(200, {}, "User done not have any element in cart")
        )
    }

    return res.status(200).json(
        new ApiResponse(200, cart, "Cart items fetched successfully")
    )
})

const checkout = asyncHandler(async (req, res) => {

    const userId = req.user._id
    const { addressId } = req.params

    const cart = await Cart.findOne({ userId, status: "active" })
        .populate({
            path: "items",
            populate: {
                path: "product",
                model: "Product"
            }
        })

    if (!cart || !cart.items.length) {
        throw new ApiError(400, "Cart is empty")
    }


    // group product by sellerId
    const groupBySeller = {}

    for (const item of cart.items) {
        const product = item.product

        if (!product) {
            throw new ApiError(400, "Product not found")
        }

        if (product.stockQty < item.quantity) {
            throw new ApiError(400, `Not enogh stock avaliable fro ${product.name}`)
        }

        const orderItem = await OrderItem.create(
            {
                product: product._id,
                quantity: item.quantity,
                price: product.price
            }
        )

        product.stockQty -= item.quantity
        await product.save();

        const sellerId = product.sellerId.toString()

        if (!groupBySeller[sellerId]) {
            groupBySeller[sellerId] = []
        }

        groupBySeller[sellerId].push(orderItem)

    }


    // validate address

    if (!addressId || !addressId.trim() || !isValidObjectId(addressId)) {
        throw new ApiError(400, "Invalid addressId")
    }

    const address = await Address.findById(addressId)

    if (!address) {
        throw new ApiError(400, "Invalid addressId")
    }

    // create order for each seller

    const createdOrder = []
    for (const [sellerId, orderItems] of Object.entries(groupBySeller)) {
        let totalPrice = 0

        orderItems.forEach(item => {
            const price = item.price
            totalPrice += price * item.quantity
        })

        const items = orderItems.map(item => item._id)

        const order = await Order.create(
            {
                userId,
                sellerId,
                items,
                status: "pending",
                shippingAddress: address._id,
                totalPrice
            }
        )

        const populatedOrder = await Order.findById(order._id)
            .populate({
                path: "items",
                populate: {
                    path: "product",
                    model: "Product"
                }
            })
            .populate("shippingAddress")

        if (!populatedOrder) {
            throw new ApiError(400, "Error while creating order")
        }

        createdOrder.push(populatedOrder)

    }


    // clear cart
    // cart.items = []
    // await cart.save()

    return res.status(201).json(
        new ApiResponse(201, createdOrder, "Order placed successfully")
    )
})

export {
    addCartItem,
    updateCartItem,
    removeCartItem,
    getCart,
    checkout
}