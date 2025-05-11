import cron from "node-cron";
import { BillBundle } from "../models/billBundle.model";

// this should run everyday at midnight
cron.schedule("0 0 * * *", async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  await BillBundle.updateMany(
    {
      status: { $in: ["pending", "partially-paid"] },
      createdAt: { $lt: thirtyDaysAgo },
    },
    { status: "expired" }
  );
  console.log("Expired old bundles.");
});
