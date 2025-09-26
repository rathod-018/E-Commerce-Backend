import { Router } from "express";
import {
    logInUser,
    logoutUser,
    refreshAccessToken,
    registerAdmin,
    registerUser
} from "../controllers/authentication.controller.js";
import { upload } from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/verifyRole.middleware.js"

const router = Router()

router.route("/create").post(upload.single("avatar"), registerUser)

router.route("/login").post(logInUser)

router.route("/refresh-token").post(refreshAccessToken)

// secured route
router.route("/logout").post(verifyJWT, logoutUser)

// admin routes

router.route("/admin/create").post(verifyJWT, verifyRole("admin"), registerAdmin)

export default router