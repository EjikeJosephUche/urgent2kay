//used for emailing bundle link to sponsor
//handlebars installed

import nodemailer from "nodemailer";
import { compile } from "handlebars";
import { readFileSync } from "fs";
import path from "path";

const templatePath = path.join(__dirname, "../../templates/bundleLink.hbs");
const templateHtml = readFileSync(templatePath, "utf8");
const templateText = compile(
  readFileSync(templatePath.replace(".hbs", ".txt"), "utf8")
);

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface SendBundleLinkEmailParams {
  to: string;
  bundleName: string;
  link: string;
  expiresAt?: Date;
  sponsorName?: string;
} // watch here ⚠️⚠️⚠️

export const sendBundleLinkEmail = async (
  params: SendBundleLinkEmailParams
) => {
  const html = compile(templateHtml)(params);
  const text = templateText(params);

  await transporter.sendMail({
    from: `"Urgent2kay Bill Bundler" <${process.env.EMAIL_FROM}>`,
    to: params.to,
    subject: `You've been invited to sponsor: ${params.bundleName}`,
    html,
    text,
  });
};
