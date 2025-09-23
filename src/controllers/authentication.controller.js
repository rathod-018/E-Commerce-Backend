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

    const createdUser = await User.findById(user._id).select("-password")

    if (!createdUser) {
        throw new ApiError(400, "Error while creating user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully")
    )

})


// admin registration
const registerAdmin = asyncHandler(async (req, res) => {
    const { name, email, username, password } = req.body

    if ([name, email, username, password].some((item) => item?.trim() === "")) {
        throw new ApiError(400, "All fields are required !!")
    }

    const userExist = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (userExist) {
        throw new ApiError(400, "Admin with same username or email alredy exist")
    }

    const admin = await User.create({
        name,
        email,
        username,
        password,
        role: "admin"
    })

    const createdAdmin = await User.findById(admin._id).select("-password")

    if (!createdAdmin) {
        throw new ApiError(400, "Error while creating admin")
    }

    return res.status(201).json(
        new ApiResponse(201, createdAdmin, "Admin created successfully")
    )

})



const logInUser = asyncHandler(async (req, res) => {
    // algo
    // get user name email and password from body
    // validate --empty
    // find user by user name
    // generate access token. send via cookie
    // return responce without password

    const { username, email, password } = req.body

    if (!username.trim() && !email.trim()) {
        throw new ApiError(400, "Email or Username is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "Invalid Username or Email")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid password")
    }

    const accesstoken = user.generateAccessToken()

    const loggedInUser = await User.findById(user._id).select("-password")

    const option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accesstoken, option)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accesstoken
                },
                "User loggedIn successfully")
        )
})



const logoutUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(404, "User NOT found")
    }

    const option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", option)
        .json(
            new ApiResponse(200, {}, "User Logeed Out")
        )
})



export {
    registerUser,
    registerAdmin,
    logInUser,
    logoutUser,
    changePassword
}
