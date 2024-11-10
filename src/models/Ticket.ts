  import mongoose, { Document, Schema, Model } from 'mongoose';

  export interface ITicket extends Document {
    seatNumber: string;
    event: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    purchasedDate: Date;
  }

  const ticketSchema: Schema<ITicket> = new Schema({
    seatNumber: { type: String, required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    purchasedDate: { type: Date, required: true },
  });

  const Ticket: Model<ITicket> = mongoose.model<ITicket>('Ticket', ticketSchema);
  export default Ticket;
