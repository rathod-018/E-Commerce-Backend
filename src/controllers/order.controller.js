import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Order } from "../models/order.model.js"
import mongoose, { isValidObjectId } from "mongoose"



//user

const getUserOrders = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const orders = await Order.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "orderitems",
                localField: "items",
                foreignField: "_id",
                as: "items",
                pipeline: [
                    {
                        $lookup: {
                            from: "products",
                            localField: "product",
                            foreignField: "_id",
                            as: "product",
                            pipeline: [
                                {
                                    $lookup: {
                                        from: "productimages",
                                        localField: "productImage",
                                        foreignField: "_id",
                                        as: "image",
                                        pipeline: [
                                            { $limit: 1 }
                                        ]
                                    }
                                },
                                {
                                    $unwind: "$image"
                                },
                                {
                                    $addFields: {
                                        image: "$image.url"
                                    }
                                },
                                {
                                    $project: {
                                        productImage: 0
                                    }
                                }
                            ]
                        }
                    },
                    { $unwind: "$product" },
                    {
                        $project: {
                            productImage: 1,
                            product: 1,
                            quantity: 1,
                            price: 1
                        }
                    }
                ]
            }
        }
    ])

    if (!orders.length) {
        return res.status(200).json(
            new ApiResponse(200, [], "User does not have any order history")
        )
    }

    return res.status(200).json(
        new ApiResponse(200, orders, "Order history fetched successfully")
    )
})

const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    const userId = req.user._id

    if (!orderId || !orderId.trim() || !isValidObjectId(orderId)) {
        throw new ApiError(400, "Invalid orderId")
    }

    const order = await Order.findOne({ _id: orderId, userId })

    if (!order) {
        throw new ApiError(400, "Invalid orderId")
    }

    if ("cancelled" === order.status) {
        return res.status(200).json(
            new ApiResponse(200, {}, "Order alredy cancelled")
        )
    }

    if (!["pending", "conformed"].includes(order.status)) {
        return res.status(200).json(
            new ApiResponse(200, {}, "Order cancelation failed")
        )
    }

    order.status = "cancelled"
    await order.save()

    return res.status(200).json(
        new ApiResponse(200, order.status, "Order cancelled successfully")
    )


})





//seller
const getSellerOrders = asyncHandler(async (req, res) => {
    const sellerId = req.user._id

    const allOrders = await Order.aggregate([
        {
            $match: {
                sellerId: new mongoose.Types.ObjectId(sellerId)
            }
        },
        {
            $lookup: {
                from: "orderitems",
                localField: "items",
                foreignField: "_id",
                as: "items",
                pipeline: [
                    {
                        $lookup: {
                            from: "products",
                            localField: "product",
                            foreignField: "_id",
                            as: "product",
                            pipeline: [
                                {
                                    $lookup: {
                                        from: "productimages",
                                        localField: "productImage",
                                        foreignField: "_id",
                                        as: "image",
                                        pipeline: [
                                            { $limit: 1 }
                                        ]
                                    }
                                },
                                {
                                    $unwind: "$image"
                                },
                                {
                                    $addFields: {
                                        image: "$image.url"
                                    }
                                },
                                {
                                    $project: {
                                        productImage: 0
                                    }
                                }
                            ]
                        }
                    },
                    { $unwind: "$product" }
                ]
            }
        },
        {
            $project: {
                _id: 1,
                user: 1,
                status: 1,
                totalAmount: 1,
                createdAt: 1,
                items: 1
            }
        }
    ])

    if (!allOrders.length) {
        throw new ApiError(404, "No orders found for this seller")
    }

    return res.status(200).json(
        new ApiResponse(200, allOrders, "Seller orders fetched successfully")
    )
})


const updateSellerOrderStatus = asyncHandler(async (req, res) => {

    const { orderId } = req.params

    const { status } = req.body

    if (!orderId || !orderId.trim() || !isValidObjectId(orderId)) {
        throw new ApiError(400, "Invalid Object Id")
    }

    if (!status || !status.trim()) {
        throw new ApiError(400, "product status is required")
    }

    let order = await Order.findById(orderId).populate({
        path: "items",
        populate: {
            path: "product",
            select: "_id name price"
        }
    })

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    if (order.status === "cancelled") {
        throw new ApiError(400, "Order  got cancelled")
    }

    const hasSellerProduct = order.items.some(item => item.product.sellerId.toString() === req.user._id.toString())

    if (!hasSellerProduct) {
        throw new ApiError(403, "You are not allowed to update this order status")
    }


    if (order.status === "pending") {
        order.status = "conformed"
    }
    else if (order.status === "conformed") {
        order.status = "shipped"
    }
    else {
        throw new ApiError(400, "You cannot update the order further");
    }

    await order.save()

    const updatedOrder = await Order.findById(orderId)
    return res.status(200).json(
        new ApiResponse(200, updatedOrder.status, "Order status updated successfully")
    )
})





// admin
const getAllOrders = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 3;
    const matchStatus = req.query.status || "all";
    const sortBy = req.query.sortBy || "createdAt";
    const sortType = req.query.sortType === "desc" ? -1 : 1;


    const match = {}
    if (matchStatus !== "all") {
        match.status = matchStatus.toLowerCase().trim()
        if (!["pending", "conformed", "shipped", "completed", "cancelled"].includes(match.status)) {
            throw new ApiError(400, "Invalid status")
        }
    }

    const aggregate = Order.aggregate([
        { $match: match },
        {
            $lookup: {
                from: "orderitems",
                localField: "items",
                foreignField: "_id",
                as: "items",
                pipeline: [
                    {
                        $lookup: {
                            from: "products",
                            localField: "product",
                            foreignField: "_id",
                            as: "product",
                            pipeline: [
                                {
                                    $lookup: {
                                        from: "productimages",
                                        localField: "productImage",
                                        foreignField: "_id",
                                        as: "image",
                                        pipeline: [
                                            { $limit: 1 }
                                        ]
                                    }
                                },
                                {
                                    $unwind: "$image"
                                },
                                {
                                    $addFields: {
                                        image: "$image.url"
                                    }
                                },
                                {
                                    $project: {
                                        productImage: 0
                                    }
                                }
                            ]
                        }
                    },
                    { $unwind: "$product" },
                    {
                        $project: {
                            productImage: 1,
                            product: 1,
                            quantity: 1,
                            price: 1
                        }
                    }
                ]
            }
        },
        {
            $sort: { [sortBy]: sortType }
        }
    ])

    const options = {
        page,
        limit
    }

    const result = await Order.aggregatePaginate(aggregate, options)

    if (!result.totalDocs) {
        return res.status(200).json(
            new ApiResponse(200, {
                orders: [],
                totalOrders: 0,
                totalPages: 0,
                currentPage: page
            }, "No orders found")
        )
    }

    return res.status(200).json(
        new ApiResponse(200, result, "All orders fetched successfully")
    )
})


const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params

    const { status } = req.body
    if (!orderId || !orderId.trim() || !isValidObjectId(orderId)) {
        throw new ApiError(400, "Invalid Object Id")
    }

    if (!status || !status.trim()) {
        throw new ApiError(400, "product status is required")
    }

    if (!["pending", "conformed", "shipped", "completed", "cancelled"].includes(status.trim().toLowerCase())) {
        throw new ApiError(400, "Invalid status")
    }

    let order = await Order.findById(orderId)

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    if (order.status === "cancelled") {
        throw new ApiError(400, "Order got cancelled")
    }
    if (order.status === status.trim().toLowerCase()) {
        return res.status(200).json(
            new ApiResponse(200, {}, "New status should not be same as old status")
        )
    }
    order.status = status.trim().toLowerCase()
    await order.save()

    const updatedOrder = await Order.findById(orderId)

    return res.status(200).json(
        new ApiResponse(200, updatedOrder.status, "Order status updated successfully")
    )
})





// for all [customer seller admin]
const getOrderById = asyncHandler(async (req, res) => {

    const { orderId } = req.params
    const loggedInUserId = req.user._id
    const role = req.user.role

    if (!orderId || !orderId.trim() || !isValidObjectId(orderId)) {
        throw new ApiError(400, "Invalid Object Id")
    }

    const matchObj = { _id: new mongoose.Types.ObjectId(orderId) }

    if (role === "customer") {
        matchObj.userId = new mongoose.Types.ObjectId(loggedInUserId)
    }
    else if (role === "seller") {
        matchObj.sellerId = new mongoose.Types.ObjectId(loggedInUserId)
    }
    console.log(matchObj)

    const order = await Order.aggregate([
        {
            $match: matchObj
        },
        {
            $lookup: {
                from: "orderitems",
                localField: "items",
                foreignField: "_id",
                as: "items",
                pipeline: [
                    {
                        $lookup: {
                            from: "products",
                            localField: "product",
                            foreignField: "_id",
                            as: "product",
                            pipeline: [
                                {
                                    $lookup: {
                                        from: "productimages",
                                        localField: "productImage",
                                        foreignField: "_id",
                                        as: "image",
                                        pipeline: [
                                            { $limit: 1 }
                                        ]
                                    }
                                },
                                {
                                    $unwind: "$image"
                                },
                                {
                                    $addFields: {
                                        image: "$image.url"
                                    }
                                },
                                {
                                    $project: {
                                        productImage: 0
                                    }
                                }
                            ]
                        }
                    }

                ]
            }
        },
        {
            $lookup: {
                from: "addresses",
                localField: "shippingAddress",
                foreignField: "_id",
                as: "shippingAddress"
            }
        },
        {
            $unwind: "$shippingAddress"
        }

    ])

    if (!order.length) {
        throw new ApiError(404, "Order not found")
    }
    return res.status(200).json(
        new ApiResponse(200, order[0], "Order details fetched success fully")
    )
})

export {
    getUserOrders,
    cancelOrder,
    getSellerOrders,
    updateSellerOrderStatus,
    getAllOrders,
    updateOrderStatus,
    getOrderById
}