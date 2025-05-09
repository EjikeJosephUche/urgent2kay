import dotenv from "dotenv";

dotenv.config();

interface Config {
  PORT: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string; //loginUser in auth service has error on 'sign' ⚠️
  BASE_URL: string;
  //paystack goes here
  PAYSTACK_SECRET_KEY: string;
  PAYSTACK_PUBLIC_KEY: string;
  PAYSTACK_BASE_URL: string;
  PAYSTACK_CALLBACK_URL: string;
  //twilio here too
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_WHATSAPP_NUMBER: string;
  //nodemailer
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  EMAIL_FROM: string;
}

const config: Config = {
  PORT: process.env.PORT || "5000",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/2kay",
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "30d",
  BASE_URL: process.env.BASE_URL || "http://localhost:5000",
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY as string,
  PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY as string,
  PAYSTACK_BASE_URL: process.env.PAYSTACK_BASE_URL || "https://api.paystack.co",
  PAYSTACK_CALLBACK_URL: process.env.PAYSTACK_CALLBACK_URL as string,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID as string,
  TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER as string,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN as string,
  EMAIL_USER: process.env.EMAIL_USER as string,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD as string,
  EMAIL_FROM: process.env.EMAIL_FROM as string,
};

export default config;
