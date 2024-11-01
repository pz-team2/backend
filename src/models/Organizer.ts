import mongoose, { Document, Schema } from "mongoose";

export interface IOrganizer extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  organizerName: string;
  phoneNumber: bigint;
  createdAt: Date;
  updatedAt: Date;
}

const organizerSchema = new Schema<IOrganizer>(
  {
    username: {
      type: String,
      required: [true, "Name is required"],
      unique: true,
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    organizerName: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrganizer>("Organizer", organizerSchema);
