import mongoose, { Document, Schema, Model } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fullName: string;
  gender: string;
  phoneNumber: string;
  city: string;
  emailToken?: string,
  isVerified: boolean,
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: false },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: false,
    },
    phoneNumber: { type: String, required: false },
    city: { type: String, required: false },
    isVerified: {type: Boolean, required: true},
    emailToken: {type: String, required: false},
  },
  {
    timestamps: true, // Mengaktifkan createdAt dan updatedAt secara otomatis
  }
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
