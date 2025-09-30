import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/verifyRole.middleware.js"
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "../controllers/categories.controller.js";

const router = Router()

router.use(verifyJWT)

// public route
router.route("/").get(getAllCategories)

// admin only routes

router.use(verifyRole("admin"))

router.route("/create").post(createCategory)

router.route("/update/:categoryId").patch(updateCategory)

router.route("/delete/:categoryId").delete(deleteCategory)


export default router