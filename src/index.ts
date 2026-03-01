import express from "express";
import cookieParser from "cookie-parser";
import mainRoutes from "./routes/mainRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", mainRoutes);

// Basic health check route
app.get("/", (req, res) => {
    res.send("Tracker Server API is running");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});