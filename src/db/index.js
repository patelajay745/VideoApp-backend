import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}${DB_NAME}`
        );

        console.log("mongoDb connected", connectionInstance.connection.name);
    } catch (error) {
        console.log("mongoDb connection error", error);
    }
};

export default connectDB;
