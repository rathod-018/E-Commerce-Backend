import { User } from "../models/user.models.js"
import { ApiError } from "./ApiError.js"

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        console.log(error.message)
        throw new ApiError(400, "Error while generation access and refresh token")
    }
}

export { generateAccessTokenAndRefreshToken }

