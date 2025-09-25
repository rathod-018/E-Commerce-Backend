import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js"
import { verifyOwnerOrAdmin } from "../middleware/verifyOwnerOrAdmin.middleware.js";
import { addAddress, deleteAddress, getAddressById, getAlladdress } from "../controllers/address.controller.js";
import { getCurrentUserIdFromParams, getUserIdFromAddress } from "../middleware/getUserId.js"


const router = Router()

router.use(verifyJWT)

router.route("/user/:userId")
    .post(verifyOwnerOrAdmin(getCurrentUserIdFromParams), addAddress)
    .get(verifyOwnerOrAdmin(getCurrentUserIdFromParams), getAlladdress)

router.route("/:addressId")
    .get(verifyOwnerOrAdmin(getUserIdFromAddress), getAddressById)
    .post(verifyOwnerOrAdmin(getUserIdFromAddress), getAddressById)
    .delete(verifyOwnerOrAdmin(getUserIdFromAddress), deleteAddress)


export default router