
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPayment extends Document {
  amount: number;
  date: Date;
  method: string;
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  paymentStatus: string;
  quantity: number;
}

const paymentSchema: Schema<IPayment> = new Schema({
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  method: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  quantity: { type: Number, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
}, {timestamps: true});

const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);
export default Payment;
