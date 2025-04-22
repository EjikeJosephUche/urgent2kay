import express from "express";
import { PORT } from "./utils/env";
import connectDB from "./config/db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
