import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js";
import { uploadOnCludinary, deleteFromCludinary } from "../utils/cludinary.js";







const changePassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body
    if (!oldPassword.trim() || !newPassword.trim()) {
        throw new ApiError(400, "new password ")
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


export {
    changePassword
}
