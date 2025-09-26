import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js"
import {
    addAddress,
    getAlladdress,
    getAddressById,
    updateAddress,
    deleteAddress
} from "../controllers/address.controller.js";
import { verifyRole } from "../middleware/verifyRole.middleware.js"


const router = Router()

router.use(verifyJWT)
router.use(verifyRole("customer", "admin"))

router.route("/user/:userId")
    .post(addAddress)
    .get(getAlladdress)

router.route("/:addressId")
    .get(getAddressById)
    .post(updateAddress)
    .delete(deleteAddress)


export default router