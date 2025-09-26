import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        stockQty: {
            type: Number,
            required: true
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        categorie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Categories"
        }
    },
    {
        timestamps: true
    }
)


export const Product = mongoose.model("Product", productSchema)