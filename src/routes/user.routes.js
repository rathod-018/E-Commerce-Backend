import { Router } from "express";
import {
    changePassword,
    logInUser,
    logoutUser,
    registerAdmin,
    registerUser
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/verifyAdmin.middleware.js";

const router = Router()

router.route("/create").post(upload.single("avatar"), registerUser)

router.route("/login").post(logInUser)

// secured routes

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/change-password").post(verifyJWT, changePassword)

// admin routes

router.route("/admin/create").post(verifyJWT, verifyAdmin, registerAdmin)

export default router