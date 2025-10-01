import mongoose, { Schema } from "mongoose";

const productImageSchema = new Schema(
    {
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    }
)


export const ProductImage = mongoose.model("ProductImage", productImageSchema)

