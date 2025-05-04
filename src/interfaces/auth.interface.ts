import { Request } from "express";
interface IAuth extends Request {
  _id: string;
  email: string;
  password: string;
}

export default IAuth;
