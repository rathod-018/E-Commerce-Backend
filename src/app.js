import express from "express"
import cookieParser from "cookie-parser";


const app = express()

app.use(express.json()) // for json data
app.use(express.urlencoded({ extended: true })); // for form data
app.use(express.static("public"))
app.use(cookieParser())






// routes import
import userRouter from "./routes/user.routes.js"


// routes declaration
app.use("/api/v1/user", userRouter)

export { app }