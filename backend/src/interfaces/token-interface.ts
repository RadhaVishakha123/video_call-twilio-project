import  { Document, Types } from 'mongoose';
/* ================= INTERFACE ================= */
export interface IRefreshToken extends Document {
    userId: Types.ObjectId;
    token: string;
    expiresAt: Date;
  }
  