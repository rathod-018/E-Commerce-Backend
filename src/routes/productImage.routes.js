import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js"
import { verifyRole } from "../middleware/verifyRole.middleware.js"
import {
    uploadProductImage,
    getAllImageOfProduct,
    updateProductImage,
    deleteProductImage
} from "../controllers/productImage.controller.js"
import { upload } from "../middleware/multer.middleware.js"

const router = Router()

router.use(verifyJWT)

// public route
router.route("/:productId").get(getAllImageOfProduct)

//seller only route
router.route("/create/:productId").post(verifyRole("seller"), upload.array("images", 5), uploadProductImage)

// seller and admin routes
router.use(verifyRole("seller", "admin"))

router.route("/update/:productId/:imageId").patch(upload.single("image"), updateProductImage)

router.route("/delete/:productId/:imageId").delete(deleteProductImage)


export default router