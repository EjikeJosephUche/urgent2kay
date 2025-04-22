import { HydratedDocument } from "mongoose";
import IUser from "../interfaces/user.interface";

export type IUserDocument = HydratedDocument<IUser>;
