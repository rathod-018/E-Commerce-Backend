import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/verifyRole.middleware.js"
import {
    createProduct,
    deleteProduct,
    getProduct,
    listProducts,
    updateProduct
} from "../controllers/product.controller.js";


const router = Router()

router.use(verifyJWT)

//only seller
router.route("/create/:sellerId").post(verifyRole("seller"), createProduct)


// public route
router.route("/").get(listProducts)


// both seller and admin

router.use(verifyRole("admin", "seller"))

router.route("/:productId")
    .get(getProduct)
    .patch(updateProduct)
    .delete(deleteProduct)


export default router
