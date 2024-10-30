import mongoose, { Document, Schema, Model } from 'mongoose';

// Definisikan interface untuk Category
export interface ICategory extends Document {
  name: string;
}

// Buat skema menggunakan interface
const categorySchema: Schema<ICategory> = new Schema({
  name: { type: String, required: true },
});

// Ekspor model
const Category: Model<ICategory> = mongoose.model<ICategory>('Category', categorySchema);
export default Category;
