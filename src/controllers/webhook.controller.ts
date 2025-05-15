import { Request, Response } from "express";
import { processPaystackEvent } from "../services/webhook.service";
import crypto from "crypto";

export const handlePaystackWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY!;
    const signature = req.headers["x-paystack-signature"] as string;

    // ✅ req.body must be a Buffer (from express.raw)
    const hash = crypto
      .createHmac("sha512", secret)
      .update(req.body)
      .digest("hex");

    if (hash !== signature) {
      console.log("Invalid Paystack signature");
      res.status(400).send("Invalid signature");
      return;
    }

    const event = JSON.parse(req.body.toString("utf-8"));

    await processPaystackEvent(event);
    res.sendStatus(200);
    console.log(
      "Webhook event processed successfully:",
      JSON.stringify(event, null, 2)
    );
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Webhook processing failed");
  }
};
