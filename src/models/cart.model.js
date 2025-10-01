import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "CartItem"
            }
        ],
        status: {
            type: String,
            enum: ["active", "ordered"],
            default: "active"
        }
    },
    {
        timestamps: true
    })


export const Cart = mongoose.model("Cart", cartSchema)