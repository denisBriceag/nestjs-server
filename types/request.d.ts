import { Request } from 'express';

declare namespace Express {
  export interface Request {
    user: any;
  }
}
