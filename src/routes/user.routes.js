import { Router } from "express";
import {
    changePassword,
    getAllUser,
    getCurrentUser,
    getUserById,
    updateCurrentUser,
    updateUserRole
} from "../controllers/user.controller.js";
import { verifyAdmin } from "../middleware/verifyAdmin.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js"
import { upload } from "../middleware/multer.middleware.js"

const router = Router()

router.route("/me").get(verifyJWT, getCurrentUser)
router.route("/me/update").post(verifyJWT, upload.single("avatar"), updateCurrentUser)
router.route("/me/password").post(verifyJWT, changePassword)


// admin only route

router.route("/admin/:userId").get(verifyJWT, verifyAdmin, getUserById)
router.route("/admin/:userId").patch(verifyJWT, verifyAdmin, updateUserRole)
router.route("/admin/users").get(verifyJWT, verifyAdmin, getAllUser)

export default router