import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { CLIENT_URL, JWT_SECRET } from "../utils/env";
import userService from "../services/user.service";

class AuthController {
  async register(req: Request, res: Response) {
    const { email, password, firstName, lastName, phone, role } = req.body;
    const fullUrl = req.protocol + "://" + req.get("host");
    try {
      const user = await userService.createUser(
        email,
        password,
        firstName,
        lastName,
        phone,
        role,
        fullUrl
      );
      if (!user) {
        return res.status(400).json({
          message: "User already exists",
        });
      }
      const verificationToken = jwt.sign(
        { _id: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );

      return res.status(201).json({
        message: "User created successfully",
        user: user,
      });
    } catch (error: any) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const token = await userService.loginUser(email, password);
      return res.status(200).json({
        message: "Login successful",
        token: token,
      });
    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }

  async logout(req: Request, res: Response) {
    // supposed to implement the logout functionality, but in this case, we will just clear the token from the client side.
    // In a real-world application, you might want to invalidate the token on the server side as well.
    return res.status(200).json({
      message: "Logout successful",
    });
  }

  // async refreshToken(req: Request, res: Response) {
  //   const token = req.header("Authorization")?.replace("Bearer", "").trim();
  //   if (!token) {
  //     return res.status(401).json({
  //       message: "Access denied, token is missing",
  //     });
  //   }

  //   try {
  //     const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
  //     const newToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, {
  //       expiresIn: "1h",
  //     });
  //     return res.status(200).json({
  //       message: "Token refreshed successfully",
  //       token: newToken,
  //     });
  //   } catch (error) {
  //     return res.status(401).json({
  //       message: "Invalid token",
  //     });
  //   }
  // }

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    const fullUrl = req.protocol + "://" + req.get("host");
    try {
      await userService.forgotPassword(email, fullUrl);
      return res.status(200).json({
        message: "Password reset link sent to your email",
      });
    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;
    try {
      await userService.resetPassword(token, newPassword);
      return res.status(200).json({
        message: "Password reset successfully",
      });
    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }

  async resendVerificationEmail(req: Request, res: Response) {
    const { email } = req.body;
    const fullUrl = req.protocol + "://" + req.get("host");
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.verified) {
        return res.status(400).json({ message: "User already verified" });
      }
      const verificationToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "30m",
      });
      const verificationLink = `${fullUrl}/api/auth/verify-email?token=${verificationToken}`;
      await userService.sendVerificationEmail(
        email,
        verificationLink,
        user.firstName,
        "Urgent 2kay",
        fullUrl
      );
      return res.status(200).json({
        message: "Verification email resent successfully",
      });
    } catch (error: any) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  async verifyEmail(req: Request, res: Response) {
    if (!req.query.token) {
      return res.status(400).json({ message: "Token is required" });
    }
    const token = req.query.token as string;

    try {
      await userService.verifyEmail(token);

      return res.status(200).json({ message: "Email successfully verified!" });
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
  }
}

export default new AuthController();
