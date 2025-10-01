import mongoose, { Schema } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const orderSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "OrderItem"
            }],
        status: {
            type: String,
            required: true,
            enum: ["pending", "conformed", "shipped", "completed", "cancelled"],
            default: "pending"
        },
        shippingAddress: {
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

orderSchema.plugin(aggregatePaginate)

export const Order = mongoose.model("Order", orderSchema)