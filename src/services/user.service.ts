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

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        email,
        password: hashedPassword,
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
        { expiresIn: "30m" }
      );
      console.log(fullUrl);
      const verificationLink = `${fullUrl}/api/auth/verify-email?token=${verificationToken}`;
      await this.sendVerificationEmail(email, verificationLink, firstName);
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
          expiresIn: "1h",
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
      // Invalidate the token (e.g., by adding it to a blacklist)
      // This is a placeholder; implement your own logic for token invalidation
      console.log(`Token invalidated: ${token}`);
    } catch (error) {
      throw new Error("Error logging out");
    }
  }

  async sendVerificationEmail(
    email: string,
    link: string,
    firstName?: string
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
      html: `<p>Hello ${firstName}. Please verify your email by clicking the link below:</p>
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
        expiresIn: "30m",
      });

      const verificationLink = `${fullUrl}/api/auth/verify-email?token=${token}`;

      // Reuse the sendVerificationEmail method
      await this.sendVerificationEmail(
        user.email,
        verificationLink,
        user.firstName
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
      // Implement password reset logic here (e.g., send reset link)
      const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "30m",
      });
      const resetLink = `${fullUrl}/api/auth/reset-password?token=${resetToken}`;
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
        subject: "Reset your password",
        html: `<p>Please reset your password by clicking the link below:</p>
                       <a href="${resetLink}">Reset Password</a>`,
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
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
    } catch (error) {
      throw new Error(`Error resetting password: ${error}`);
    }
  }
}

export default new UserService();
