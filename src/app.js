import express from "express"


const app = express()

app.use(express.json()) // for json data
app.use(express.urlencoded({ extended: true })); // for form data






// routes import
import userRouter from "./routes/user.routes.js"


// routes declaration
app.use("/api/v1/user", userRouter)

export { app }