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

router.use(verifyJWT)

router.route("/me").get(getCurrentUser)
router.route("/me/update").patch(upload.single("avatar"), updateCurrentUser)
router.route("/me/password").patch(changePassword)


// admin only route

router.use(verifyRole("admin"))

router.route("/admin/:userId")
    .get(getUserById)
    .patch(updateUserRole)

router.route("/admin").get(getAllUser)

export default router