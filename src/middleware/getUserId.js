import { Address } from "../models/address.model.js"


export const getCurrentUserIdFromParams = (req) => req.params.userId


export const getUserIdFromAddress = async (req) => {
    const address = await Address.findById(req.params.addressId);

    return address ? address.owner : null;
}