import mongoose, { Document, Schema, Model } from "mongoose";

// Definisikan interface untuk Event
export interface IEvent extends Document {
  // organizerId: string;
  categoryId: string;
  title: string;
  quota: number;
  price: number;
  startTime: string;
  finishTime: string;
  picture?: string;
  date: Date;
  address: string;
  description: string;
  status: string;
  organizer: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
}

// Buat skema menggunakan interface
const eventSchema: Schema<IEvent> = new Schema({
  organizer: { type: Schema.Types.ObjectId, ref: "Organizer", required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  address: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true },
  quota: { type: Number, required: true },
  price: { type: Number, required: false },
  startTime: { type: String, required: true },
  finishTime: { type: String, required: true },
  picture: { type: String, required: true },
});

// Ekspor model
const Event: Model<IEvent> = mongoose.model<IEvent>("Event", eventSchema);
export default Event;
