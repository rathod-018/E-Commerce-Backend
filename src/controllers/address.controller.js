import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Address } from "../models/address.model.js"
import mongoose, { isValidObjectId } from "mongoose"


const addAddress = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId.trim() || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }

    const { street, city, state, postalCode, country, addressType } = req.body

    if ([street, city, state, postalCode, country, addressType].some((val) => val.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    if (!["home", "work"].includes(addressType)) {
        throw new ApiError(400, "Invalid address type")
    }

    const address = await Address.create(
        {
            street,
            city,
            state,
            postalCode,
            country,
            addressType,
            userId
        })

    const createdAddress = await Address.findById(address._id)

    if (!createdAddress) {
        throw new ApiError(400, "Error while creating address")
    }

    return res.state(200).json(
        new ApiResponse(200, createdAddress, "Address created successfully")
    )
})



const getAlladdress = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!userId.trim() || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }


    const alladdress = await Address.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            email: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        }
    ])

    if (!alladdress.length) {
        throw new ApiError(400, "Error while fetching address")
    }

    return res.status(200).json(
        new ApiError(200, alladdress, "address fetched successfully")
    )
})



const getAddressById = asyncHandler(async (req, res) => {

    const { addressId } = req.params

    if (!addressId.trim() || !isValidObjectId(addressId)) {
        throw new ApiError(400, "Invalid addressId")
    }

    const address = await Address.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(addressId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            email: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        }
    ])

    if (!address.length) {
        throw new ApiError(400, "Invalid addressId")
    }

    return res.status(200).json(
        new ApiResponse(200, address[0], "address fetched successfully")
    )

})



const updateAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params
    const { street, city, state, postalCode, country, addressType } = req.body

    if (!addressId.trim() || !isValidObjectId(addressId)) {
        throw new ApiError(400, "Invalid addressId")
    }

    if ([street, city, state, postalCode, country, addressType].some((val) => val.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }


    const address = await Address.findByIdAndUpdate(
        addressId,
        {
            street,
            city,
            state,
            postalCode,
            country,
            addressType
        },
        {
            new: true
        })

    if (!updatedAddress) {
        throw new ApiError(400, "Error while updating address")
    }

    return res.status(200).json(
        new ApiResponse(200, address, "Address updated successfully")
    )
})



const deleteAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params

    if (!addressId.trim() || !isValidObjectId(addressId)) {
        throw new ApiError(400, "Invalid addressId")
    }

    const address = await Address.findById(addressId)

    if (!address) {
        throw new ApiError(400, "Invalid addressId")
    }

    await address.deleteOne()

    return res.status(200).json(
        new ApiError(200, {}, "Address deleted successfully")
    )


})


export {
    addAddress,
    getAlladdress,
    getAddressById,
    updateAddress,
    deleteAddress
}