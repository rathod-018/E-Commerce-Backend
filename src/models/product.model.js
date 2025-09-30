import mongoose, { Schema } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

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
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Categories"
        }
    },
    {
        timestamps: true
    }
)

productSchema.plugin(aggregatePaginate)

export const Product = mongoose.model("Product", productSchema)