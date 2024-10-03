import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({ path: "./.env" });

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () =>
            console.log(`Server ready on port ${process.env.PORT}`)
        );
    })
    .catch();

export default app;
