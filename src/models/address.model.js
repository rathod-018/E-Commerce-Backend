import mongoose, { Schema } from "mongoose";

const addressSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            lowercase: true,
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        addressType: {
            type: String,
            required: true,
            enum: ["home", "work"]
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
)


export const Address = mongoose.model("Address", addressSchema)