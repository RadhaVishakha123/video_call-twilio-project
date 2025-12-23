import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '../interfaces/user-interface';

/* ================= USER SCHEMA ================= */
const userSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= USER MODEL ================= */
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
