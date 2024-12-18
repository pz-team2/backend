import mongoose, { Document, Schema, Model } from "mongoose";

export interface ITicket extends Document {
  name: string;
  code: string;
  payment: mongoose.Types.ObjectId;
  qrcode: String;
  status: string;
}

const ticketSchema: Schema<ITicket> = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    payment: { type: Schema.Types.ObjectId, ref: "Payment", required: true },
    qrcode: { type: String, required: true },
    status: { type: String, required: true },
  },
  { timestamps: true }
);

const Ticket: Model<ITicket> = mongoose.model<ITicket>("Ticket", ticketSchema);
export default Ticket;
