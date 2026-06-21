import mongoose, { Schema, Document } from 'mongoose';

export interface IIoTLibraryItem extends Document {
  category: string;
  name: string;
  icon?: string;
  description?: string;
  difficulty?: string;
  data: any;
}

const IoTLibraryItemSchema: Schema = new Schema({
  category: { type: String, required: true, index: true },
  name: { type: String, required: true },
  icon: { type: String },
  description: { type: String },
  difficulty: { type: String },
  data: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

export default mongoose.model<IIoTLibraryItem>('IoTLibraryItem', IoTLibraryItemSchema);
