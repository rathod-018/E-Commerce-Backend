import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/verifyRole.middleware.js"
import {
    addCartItem,
    checkout,
    getCart,
    removeCartItem,
    updateCartItem
} from "../controllers/cart.controller.js";

const router = Router()

router.use(verifyJWT)
router.use(verifyRole("customer"))



router.route("/add-item/:productId").post(addCartItem)

router.route("/update-item/:productId").patch(updateCartItem)

router.route("/remove-item/:productId").patch(removeCartItem)

router.route("/").get(getCart)

// checkout route
router.route("/checkout").post(checkout)

export default router