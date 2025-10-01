import { Router } from "express";
import {
    cancelOrder,
    getOrderById,
    getSellerOrders,
    getUserOrders,
    getAllOrders,
    updateOrderStatus
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js"
import { verifyRole } from "../middleware/verifyRole.middleware.js";

const router = Router()

router.use(verifyJWT)

// customer
router.route("/user").get(verifyRole("customer"), getUserOrders);
router.route("/user/:orderId").get(verifyRole("customer"), getOrderById);
router.route("/user/:orderId/cancel").patch(verifyRole("customer"), cancelOrder);

// seller
router.route("/seller").get(verifyRole("seller"), getSellerOrders);
router.route("/seller/:orderId").get(verifyRole("seller"), getOrderById);
router.route("/seller/:orderId/status").patch(verifyRole("seller"), updateOrderStatus);

// admin
router.route("/admin").get(verifyRole("admin"), getAllOrders);
router.route("/admin/:orderId").get(verifyRole("admin"), getOrderById);
router.route("/admin/:orderId/status").patch(verifyRole("admin"), updateOrderStatus);


export default router