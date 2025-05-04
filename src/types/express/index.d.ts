import { IAuth } from '../../interfaces/auth.interface';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: IAuth; // or whatever the actual type is
    }
  }
}
