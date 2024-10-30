import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPayment extends Document {
  amount: number;
  date: Date;
  method: string;
  user: mongoose.Types.ObjectId;
}

const paymentSchema: Schema<IPayment> = new Schema({
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  method: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);
export default Payment;
