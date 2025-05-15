import express from "express";
import { PORT } from "./utils/env";
import cors from "cors";
import connectDB from "./config/db";
import indexRoute from "./routes/index.route";
import "./cron/expireBundles";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Urgent2kay API! 🎉");
});
app.use("/api", indexRoute); // Central route file for all routes
// app.use("/payment", paymentRoutes); !! This is now in the central route file

app.listen(PORT, () => {
  console.log(`🎉 Server is running on port ${PORT}`);
});
