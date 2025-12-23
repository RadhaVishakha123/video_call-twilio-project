import mongoose, { Schema, Model } from 'mongoose';
import {IRefreshToken} from '..//interfaces/token-interface'
/* ================= SCHEMA ================= */
const refreshTokenSchema: Schema<IRefreshToken> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= MODEL ================= */
const RefreshToken: Model<IRefreshToken> =
  mongoose.models.RefreshToken ||
  mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);

export default RefreshToken;
