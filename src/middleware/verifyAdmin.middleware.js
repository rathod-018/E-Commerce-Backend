import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"


const verifyAdmin = async function (req, _, next) {
    try {
        const admin = await User.findById(req.user?._id)

        if (!admin) {
            throw new ApiError(404, "User Not Found")
        }
        if (admin.role !== "admin") {
            throw new ApiError(403, "You are not authorized to access this route")
        }
        next()

    } catch (error) {
        next(error)
    }
}

export { verifyAdmin }