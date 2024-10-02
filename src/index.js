import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({ path: "./.env" });

connectDB()
    .then(() => {
        app.listen(3000, () => console.log("Server ready on port 3000."));
    })
    .catch();

export default app;
