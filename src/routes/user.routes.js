import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js"

const router = Router()

router.route("/create").post(upload.single("avatar"), registerUser)

export default router