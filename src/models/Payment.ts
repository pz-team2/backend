
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPayment extends Document {
  amount: number;
  method: string;
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  paymentStatus: string;
  quantity: number;
  order_id: string;
  // price: number;
}

const paymentSchema: Schema<IPayment> = new Schema({
  amount: { type: Number, required: true },
  method: { type: String, required: false },
  paymentStatus: { type: String, required: true },
  quantity: { type: Number, required: true },
  order_id: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
}, {timestamps: true});

const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);
export default Payment;
