import mongoose, { Schema, Document } from 'mongoose';

// Represents one item in the IoT solution library (hardware, protocol, cloud service, etc.)
export interface IIoTLibraryItem extends Document {
  category: string;       // top-level group: 'hardware', 'protocols', 'cloud', 'software'
  name: string;           // display name of the item (e.g. "ESP32", "MQTT")
  icon?: string;          // emoji or icon string for the UI
  description?: string;   // short description shown in the library
  difficulty?: string;    // difficulty level: 'Beginner', 'Intermediate', 'Advanced'
  data: any;              // all extra fields (specs, pros, cons, use cases, etc.)
}

// category is indexed for fast filtering by tab in the UI
const IoTLibraryItemSchema: Schema = new Schema({
  category: { type: String, required: true, index: true },
  name: { type: String, required: true },
  icon: { type: String },
  description: { type: String },
  difficulty: { type: String },
  // flexible storage for all other item-specific properties
  data: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

export default mongoose.model<IIoTLibraryItem>('IoTLibraryItem', IoTLibraryItemSchema);
