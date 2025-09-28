import { asyncHandler } from "../utils/asyncHandler.js"
import { Categories } from "../models/categories.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { isValidObjectId } from "mongoose"


const createCategory = asyncHandler(async (req, res) => {

    const { name, description } = req.body
    if (!name.trim() || !description.trim()) {
        throw new ApiError(400, "all fields are required")
    }

    const isCategoryExist = await Categories.findOne({ name })

    if (isCategoryExist) {
        throw new ApiError(400, "Given category is alredy exist")
    }

    const newCategory = await Categories.create(
        {
            name,
            description
        })

    const createdCategory = await Categories.findById(newCategory._id)

    if (!createdCategory) {
        throw new ApiError(400, "Error while creating category")
    }

    return res.status(200).json(
        new ApiResponse(200, createdCategory, "Category created successfully")
    )
})

const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Categories.find().sort({ createdAt: -1 })

    if (!categories.length) {
        return res.status(200).json(
            new ApiResponse(200, [], "No categories found")
        )
    }

    return res.status(200).json(
        new ApiResponse(200, categories, "categories fetched succesfully")
    )
})

const updateCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params
    const { name, description } = req.body

    if (!categoryId.trim() || !isValidObjectId(categoryId)) {
        throw new ApiError(400, "Invalid Id")
    }

    if (!name.trim() || !description.trim()) {
        throw new ApiError(400, "all fields are required")
    }

    const isCategoryExist = await Categories.findById(categoryId)
    if (!isCategoryExist) {
        throw new ApiError(400, "Invalid categoryId")
    }

    const updatedCategory = await Categories.findByIdAndUpdate(
        categoryId,
        {
            name, description
        },
        {
            new: true
        })

    if (!updatedCategory) {
        throw new ApiError(400, "Error while updating category")
    }

    return res.status(200).json(
        new ApiResponse(200, updatedCategory, "Category updated successfully")
    )

})

const deleteCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params
    if (!categoryId.trim() || !isValidObjectId(categoryId)) {
        throw new ApiError(400, "Invalid Id")
    }

    const deletedCategory = await Categories.findByIdAndDelete(categoryId)

    if (!deletedCategory) {
        throw new ApiError(400, "Error while deleting category")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "category deleted successfully")
    )

})

export {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
}