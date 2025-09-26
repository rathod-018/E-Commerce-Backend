import { Router } from "express";
import {
    changePassword,
    getAllUser,
    getCurrentUser,
    getUserById,
    updateCurrentUser,
    updateUserRole
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js"
import { upload } from "../middleware/multer.middleware.js"
import { verifyRole } from "../middleware/verifyRole.middleware.js"
const router = Router()

router.route("/me").get(verifyJWT, getCurrentUser)
router.route("/me/update").post(verifyJWT, upload.single("avatar"), updateCurrentUser)
router.route("/me/password").post(verifyJWT, changePassword)


// admin only route

router.route("/admin/:userId")
    .get(verifyJWT, verifyRole("admin"), getUserById)
    .patch(verifyJWT, verifyRole("admin"), updateUserRole)
router.route("/admin/users").get(verifyJWT, verifyRole("admin"), getAllUser)

export default router