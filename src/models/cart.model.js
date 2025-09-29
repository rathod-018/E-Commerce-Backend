import mongoose, { Schema } from "mongoose";


const cartItemSchema = new Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1
        }
    },
    {
        _id: false
    })


const cartSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        items: [cartItemSchema],
        status: {
            type: Boolean,
            enum: ["active", "ordered"],
            default: "active"
        }
    },
    {
        timestamps: true
    })


export const Cart = mongoose.model("Cart", cartSchema)