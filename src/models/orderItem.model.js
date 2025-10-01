import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema(
    {
        product: {
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
        timestamps: true
    }
)


export const OrderItem = mongoose.model("OrderItem", orderItemSchema)