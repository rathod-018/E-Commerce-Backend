import { ApiError } from "../utils/ApiError.js"

const verifyOwnerOrAdmin = (getOwnerId) => {
    return async (req, _, next) => {
        try {
            const { _id, role } = req.user

            if (role === "admin") return next()

            const ownerId = await getOwnerId(req)

            if (!ownerId) {
                return new ApiError(404, "Error Owner not found")
            }

            if (ownerId.toString() !== _id.toString()) {
                return new ApiError(403, "You are not allowed to access this route")
            }

            next()


        } catch (error) {
            next(error)
        }
    }
}

export { verifyOwnerOrAdmin }