import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js";
import { uploadOnCludinary, deleteFromCludinary } from "../utils/cludinary.js";



const registerUser = asyncHandler(async (req, res) => {


    const { name, email, username, password, role } = req.body

    if ([name, email, username, password, role].some((item) => item?.trim() === "")) {
        throw new ApiError(400, "All fields are required !!")
    }

    if (role.toLowerCase() !== "customer" && role.toLowerCase() !== "seller") {
        throw new ApiError(400, "Invalid role")
    }

    const userExist = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (userExist) {
        throw new ApiError(400, "User with same username or email alredy exist")
    }

    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCludinary(avatarLocalPath)
    if (!avatar) {
        throw new ApiError(400, "avatar is required")
    }

    const user = await User.create({
        name,
        email,
        username,
        password,
        role,
        avatar: {
            url: avatar?.secure_url,
            public_id: avatar?.public_id
        }
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(400, "Error while creating user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully")
    )

})


export { registerUser }