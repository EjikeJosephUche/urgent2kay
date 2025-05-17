import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import IUser from "../interfaces/user.interface";
import User from "../models/user.model";
import dotenv from "dotenv";
import path from "path";

import {
  JWT_SECRET,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
} from "../utils/env";
dotenv.config();

const logoFilePath = path.join(__dirname, "../utils/logo.png");
class UserService {
  async createUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
    role: string,
    fullUrl: string
  ): Promise<IUser> {
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("email already exist");
      }

      // const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        email,
        password,
        firstName,
        lastName,
        phone,
        role,
      });

      const savedUser = await newUser.save();

      const verificationToken = jwt.sign(
        {
          userId: savedUser._id,
        },
        JWT_SECRET,
        { expiresIn: "3d" }
      );
      console.log(fullUrl);
      const verificationLink = `${fullUrl}/api/auth/verify-email?token=${verificationToken}`;
      await this.sendVerificationEmail(
        email,
        verificationLink,
        firstName,
        "Urgent 2Kay",
        fullUrl,
        logoFilePath
      );
      return savedUser;
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
    }
  }

  async loginUser(email: string, password: string): Promise<string> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("Invalid email or password");
      }

      const verifiedUser = await User.findOne({ email, verified: true });
      if (!verifiedUser) {
        throw new Error("Please verify your email before logging in");
      }
      // Check if the user is verified
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid email or password");
      }
      if (!user.verified) {
        throw new Error("Please verify your email before logging in");
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        {
          expiresIn: "3d",
        }
      );
      return token;
    } catch (error) {
      console.error("Login error:", error);

      throw new Error(`${error}`);
    }
  }

  async logoutUser(token: string): Promise<void> {
    try {
      console.log(`Token invalidated: ${token}`);
    } catch (error) {
      throw new Error("Error logging out");
    }
  }

  async sendVerificationEmail(
    email: string,
    link: string,
    firstName: string,
    companyName: string = "Urgent 2Kay",
    fullurl: string,
    logoUrl: string = logoFilePath
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT),
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    //  verify connection configuration
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Account Activation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; color: #333333; background-color: #e7d8fa; font-size: 16px;">
    <!-- Main Container -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#e4daf0">
        <tr>
            <td align="center" valign="top">
                <!-- Email Content -->
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="margin: 20px auto; background-color:#e4daf0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                    <!-- Logo Header -->
                    <tr>
                        <td style="padding: 25px 30px 15px 30px;" align="center">
                          <!-- Inline SVG logo -->
                      <h1 style="color: #6216be; font-size: 35px; margin: 0 0 20px 0;">URGENT2KAY</h1>
                    </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <h2 style="color: #2c3e50; font-size: 24px; margin: 0 0 20px 0;">Account Activation</h2>
                            <p style="margin: 0 0 10px 0;">Dear ${firstName},</p>
                            <p style="margin: 0;">Thanks for getting started with our <strong style="color: #1B0B2E">${companyName}</strong> Finance App. You're almost ready to start enjoying our services. Simply click the verify button below to verify your email address.</p>
                        </td>
                    </tr>
                    
                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 30px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="border-top: 1px solid #eaeaea; padding: 25px 0;"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Verify Button -->
                    <tr>
                        <td style="padding: 0 30px 15px 30px;" align="center">
                            <table border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center" bgcolor="rgb(98, 22, 190)" style="border-radius: 4px;">
                                        <a href="${link}" target="_blank" style="display: inline-block; padding: 12px 25px; font-weight: bold; color: #ffffff; text-decoration: none; font-family: Arial, sans-serif;">VERIFY ACCOUNT</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

`,
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error sending email: ", error);
      } else {
        console.log("Email sent: " + info.response);
        return info.response;
      }
    });
  }

  async resendVerificationEmail(email: string, fullUrl: string): Promise<void> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      if (user.verified) {
        throw new Error("User is already verified");
      }

      // Generate new verification token
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "3d",
      });

      const verificationLink = `${fullUrl}/api/auth/verify-email?token=${token}`;

      await this.sendVerificationEmail(
        user.email,
        verificationLink,
        user.firstName,
        "Urgent 2Kay",
        fullUrl,
        logoFilePath
      );
    } catch (error) {
      throw new Error(`Could not resend verification email: ${error}`);
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await User.findById(decoded.userId);
      console.log("user:", user);
      if (!user) {
        throw new Error("Invalid token or user not found");
      }

      if (user.verified) {
        throw new Error("User is already verified");
      }

      user.verified = true;
      await user.save();
    } catch (error) {
      throw new Error(`Error verifying email: ${error}`);
    }
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      throw new Error(`Error finding user: ${error}`);
    }
  }

  async forgotPassword(email: string, fullUrl: string): Promise<void> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }
      const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "3d",
      });
      const resetLink = `${fullUrl}/api/auth/reset-password?token=${resetToken}`;
      const firstName = user.firstName;
      const companyName = "Urgent 2Kay";
      const logoUrl = logoFilePath;
      const transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: Number(EMAIL_PORT),
        secure: true,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      });
      const mailOptions = {
        from: EMAIL_USER,
        to: email,
        subject: "Reset Your Password",
        html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; color: #333333; background-color:#e7d8fa; font-size: 16px;">
    <!-- Main Container -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#e4daf0">
        <tr>
            <td align="center" valign="top">
                <!-- Email Content -->
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="margin: 20px auto; background-color: #d2b7f3; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                    <!-- Logo Header -->
                    <tr>
                        <td style="padding: 25px 30px 15px 30px;" align="center">
                          <!-- Inline SVG logo -->
                      <h1 style="color: #6216be; font-size: 35px; margin: 0 0 20px 0;">URGENT2KAY</h1>
                    </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <h2 style="color: #2c3e50; font-size: 24px; margin: 0 0 20px 0;">Password Reset</h2>
                            <p style="margin: 0 0 10px 0;">Dear ${firstName},</p>
                            <p style="margin: 0;">Thanks for using <strong style="color: #1B0B2E">${companyName}</strong> Finance App. To reset your password, Simply click the Reset Password button below to Reset your email password.</p>
                        </td>
                    </tr>
                    
                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 30px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="border-top: 1px solid #eaeaea; padding: 25px 0;"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Verify Button -->
                    <tr>
                        <td style="padding: 0 30px 15px 30px;" align="center">
                            <table border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center" bgcolor="rgb(98, 22, 190)" style="border-radius: 4px;">
                                        <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 12px 25px; font-weight: bold; color: #ffffff; text-decoration: none; font-family: Arial, sans-serif;">Reset Password</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

`,

        // `<p>Please reset your password by clicking the link below:</p>
        //                <a href="${resetLink}">Reset Password</a>`,
      };
      await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("Error sending email: ", error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    } catch (error) {
      throw new Error(`Error sending reset password email: ${error}`);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error("Invalid token or user not found");
      }
      // const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = newPassword;
      await user.save();
    } catch (error) {
      throw new Error(`Error resetting password: ${error}`);
    }
  }
}

export default new UserService();
