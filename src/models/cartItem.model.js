import mongoose, { Schema } from "mongoose";

const cartItemSchema = new Schema(
    {
        product: {
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
        timestamps: true
    }
)


export const CartItem = mongoose.model("CartItem", cartItemSchema)