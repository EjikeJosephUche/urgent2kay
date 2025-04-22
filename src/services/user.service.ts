import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import IUser from "../interfaces/user.interface";
import User from "../models/user.model";
import dotenv from "dotenv";
import {
  JWT_SECRET,
  CLIENT_URL,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
} from "../utils/env";
dotenv.config();

class UserService {
  async createUser(email: string, password: string): Promise<IUser> {
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("email already exist");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        email,
        password: hashedPassword,
      });

      const savedUser = await newUser.save();

      const verificationToken = jwt.sign(
        {
          userId: savedUser._id,
        },
        JWT_SECRET,
        { expiresIn: "30m" }
      );

      const verificationLink = `${CLIENT_URL}/api/auth/verify-email?token=${verificationToken}`;
      await this.sendVerificationEmail(email, verificationLink);
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

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid email or password");
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      return token;
    } catch (error) {
      throw new Error("Error logging in");
    }
  }

  private async sendVerificationEmail(
    email: string,
    link: string
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
      subject: "Verify your email",
      html: `<p>Please verify your email by clicking the link below:</p>
           <a href="${link}">Verify Email</a>`,
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
}
export default new UserService();
