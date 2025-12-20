import { Document } from "mongoose";

/* ================= USER INTERFACE ================= */
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
}
