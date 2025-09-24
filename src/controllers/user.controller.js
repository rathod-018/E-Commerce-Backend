import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js";
import { uploadOnCludinary, deleteFromCludinary } from "../utils/cludinary.js";
import { isValidObjectId } from "mongoose";

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user

    return res.status(200).json(
        new ApiResponse(200, user, "User fetched successfully")
    )
})


const updateCurrentUser = asyncHandler(async (req, res) => {

    const { name, username } = req.body

    const update = {}

    if (name.trim() !== "") {
        update.name = name.trim()
    }

    if (username.trim() !== "") {
        update.username = username.toLowerCase().trim()
    }

    if (req.file) {
        const avatarLocalPath = req.file.path

        const avatar = await uploadOnCludinary(avatarLocalPath)

        const result = await deleteFromCludinary(req.user?.avatar.public_id, "image")
        console.log(result)

        update.avatar = {
            url: avatar.secure_url,
            public_id: avatar.public_id
        }
    }

    const updatedUser = await User.findByIdAndUpdate(req.user?._id, update, { new: true })

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User updated successfully")
    )


})


const changePassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body
    if (!oldPassword.trim() || !newPassword.trim()) {
        throw new ApiError(400, "Both fields are required")
    }
    const user = await User.findById(req.user?._id)

    const isOldPasswordValid = await user.isPasswordCorrect(oldPassword)

    if (!isOldPasswordValid) {
        throw new ApiError(400, "Incorrect Old password")
    }
    if (oldPassword === newPassword) {
        throw new ApiError(400, "New password must be different from Old password")
    }
    user.password = newPassword

    await user.save()

    return res.status(200).json(
        new ApiResponse(200, {}, "Password updated successfully")
    )
})

// admin only controller

const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId.trim() && !isValidObjectId(userId)) {
        throw new ApiError(400, "invalid userId")
    }
    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "Incorrect UserId")
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User fetched sucessfully")
    )
})


const updateUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { role } = req.body

    if (!userId.trim() && !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }

    if (!role.trim()) {
        throw new ApiError(400, "content is required")
    }

    if (req.user?._id.toString() === userId.toString()) {
        throw new ApiError(403, "You are not allowed to update your role")
    }

    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(400, "Invalid userId")
    }

    if (!["customer", "seller", "admin"].includes(role)) {
        throw new ApiError(400, "Invalid role")
    }

    if (user.role.toString() === role) {
        return res.status(200).json(
            new ApiError(200, {}, "new role should not be same as old role")
        )
    }

    user.role = role
    const updatedUser = await user.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "role updated successfully")
    )

})


const getAllUser = asyncHandler(async (req, res) => {
    // const { page, limit, field, sortType, role } = req.query

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 3;
    const matchRole = req.query.role || "all";
    const sortBy = req.query.sortBy || "createdAt"
    const sortType = req.query.sortType === "desc" ? -1 : 1;

    const match = {}
    if (matchRole !== "all") {
        match.role = matchRole.toLowerCase()
    }

    const aggrigate = await User.aggregate([
        {
            $match: match
        },
        {
            $sort: { [sortBy]: sortType }
        }
    ])

    const option = {
        page,
        limit
    }

    const result = await User.mongooseAggregatePaginate(aggrigate, option)

    return res.status(200).json(
        new ApiError(200, result, "All users fetched successfully")
    )

})

export {
    getCurrentUser,
    changePassword,
    updateCurrentUser,
    getUserById,
    updateUserRole,
    getAllUser
}