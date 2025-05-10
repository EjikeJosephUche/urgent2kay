import { Request } from "express";
interface IAuth extends Request {
  _id: string;
  email: string;
  password: string;
  role: string;
}

export default IAuth;
