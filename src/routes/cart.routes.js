import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/verifyRole.middleware.js"
import {
    addCartItem,
    getCart,
    removeCartItem,
    updateCartItem
} from "../controllers/cart.controller.js";

const router = Router()

router.use(verifyJWT)

router.use(verifyRole("customer"))

router.route("/add-item/:productId").post(addCartItem)

router.route("/update-item/:productId").post(updateCartItem)

router.route("/remove-item/:productId").post(removeCartItem)

router.route("/").post(getCart)

// checkout route

export default router