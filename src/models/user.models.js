import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"]
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        role: {
            type: String,
            enum: ["customer", "seller", "admin"],
            default: "customer"
        },
        avatar: {
            url: { type: String },
            public_id: { type: String }
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

export const User = mongoose.model("User", userSchema);
