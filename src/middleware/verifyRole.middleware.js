import { ApiError } from "../utils/ApiError.js"


const verifyRole = (...role) => (req, _, next) => {
    try {
        if (!req.user) {
            throw new ApiError(401, "User not logged in")
        }

        if (!role.includes(req.user.role)) {
            throw new ApiError(400, "You are not authorized to access this route")
        }
        next()

    } catch (error) {
        next(error)
    }
}

export { verifyRole }