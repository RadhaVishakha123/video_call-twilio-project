import { Request } from "express";

export interface JwtPayload {
    id: string;
    email: string;
    username:string;
  }
  // export interface JwtPayloadCustom {
  //   id: string;
  //   email: string;
  //   username: string;
  //   iat?: number;
  //   exp?: number;
  // }
  export interface AuthRequest extends Request {
    user?: JwtPayload;
  }
  