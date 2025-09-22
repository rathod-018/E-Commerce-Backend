//take token from cookie or AUthentication header
// verify it using jwt.verify
// using id find user and add it to req.user

import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header?.("Authorization").split(" ")[1]

        if (!token.trim()) {
            throw new ApiError(401, "Unauthorized request")
        }

        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(payload?._id).select("-password")
        if (!user) {
            throw new ApiError(400, "Invalid accessToken")
        }

        req.user = user
        next()

    } catch (error) {
        throw new ApiError(400, "Invalid access token")
    }
})

export { verifyJWT }