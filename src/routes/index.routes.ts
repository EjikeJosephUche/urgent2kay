import * as express from "express";
import billRouter from "./bill.routes";

const router = express.Router();

//add other routes here
router.use("/bills", billRouter);

export default router;
