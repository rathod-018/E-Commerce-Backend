import express from "express"
import cookieParser from "cookie-parser";


const app = express()

app.use(express.json()) // for json data
app.use(express.urlencoded({ extended: true })); // for form data
app.use(express.static("public"))
app.use(cookieParser())


// routes import
import authenticationRouter from "./routes/user.routes.js"
import userRouter from "./routes/user.routes.js"
import addressRouter from "./routes/address.routes.js"
import productRouter from "./routes/product.routes.js"
import categoryRouter from "./routes/category.routes.js"
import productImageRouter from "./routes/productImage.routes.js"

// routes declaration
app.use("/api/v1/auth", authenticationRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/address", addressRouter)
app.use("/api/v1/product", productRouter)
app.use("/api/v1/category", categoryRouter)
app.use("/api/v1/productImage", productImageRouter)

export { app }