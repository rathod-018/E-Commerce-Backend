import mongoose, { Schema } from "mongoose";

const categorieSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    })


export const Categories = mongoose.model("Categories", categorieSchema)