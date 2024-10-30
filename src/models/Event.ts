import mongoose, { Document, Schema, Model } from 'mongoose';

// Definisikan interface untuk Event
export interface IEvent extends Document {
  title: string;
  date: Date;
  organizer: mongoose.Types.ObjectId;
}

// Buat skema menggunakan interface
const eventSchema: Schema<IEvent> = new Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  organizer: { type: Schema.Types.ObjectId, ref: 'Organizer', required: true },
});

// Ekspor model
const Event: Model<IEvent> = mongoose.model<IEvent>('Event', eventSchema);
export default Event;
      