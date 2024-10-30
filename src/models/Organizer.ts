
import mongoose, { Document, Schema } from 'mongoose';

export interface IOrganizer extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const organizerSchema = new Schema<IOrganizer>(
  {
    name: { 
      type: String, 
      required: [true, 'Name is required'],
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default mongoose.model<IOrganizer>('Organizer', organizerSchema);