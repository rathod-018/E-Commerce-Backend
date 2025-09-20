import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("MongoDB connected Successfully !!", connectionInstance.connection.host)

    } catch (error) {
        console.error("ERROR Mongodb connection failed !!!", error)
    }
}

export default connectDB