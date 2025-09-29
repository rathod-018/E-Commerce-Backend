import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        quantity: {
            type: Number,
            require: true
        },
        price: {
            type: Number,
            required: true
        }
    },
    {
        _id: false
    }
)

const orderSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        items: [orderItemSchema],
        satus: {
            type: String,
            required: true,
            enum: ["pending", "conformed", "shipped", "completed", "cancelled"],
            default: "pending"
        },
        shippindAddress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address"
        },
        totalPrice: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
)


export const Order = mongoose.model("Order", orderSchema)