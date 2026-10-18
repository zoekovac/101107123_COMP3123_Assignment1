require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const REQUIRED_ENV = ["MONGODB_URI", "JWT_SECRET"];

for (const name of REQUIRED_ENV) {
    if (!process.env[name]) {
        console.error(`Missing required environment variable: ${name}`);
        process.exit(1);
    }
}

const PORT = process.env.PORT;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
