import express from "express";
import { PORT } from "./utils/env";
import connectDB from "./config/db";
import paymentRoutes from "./routes/payment";
import router from "./routes/index.routes";  //created an index route  file in the routes folder to collect all routes

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();

// Routes
app.use("/api", router);
app.use("/payment", paymentRoutes);

app.listen(PORT, () => {
  console.log(`🎉 Server is running on port ${PORT}`);
});
