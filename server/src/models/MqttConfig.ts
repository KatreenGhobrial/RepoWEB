import mongoose, { Document, Schema } from 'mongoose';

export interface IMqttConfig extends Document {
  url: string;
  username?: string;
  password?: string;
  topic: string;
  isActive: boolean;
  name: string; // User-friendly name
  createdAt: Date;
}

const MqttConfigSchema: Schema = new Schema({
  url: { type: String, required: true },
  username: { type: String, default: '' },
  password: { type: String, default: '' },
  topic: { type: String, default: '#' },
  isActive: { type: Boolean, default: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IMqttConfig>('MqttConfig', MqttConfigSchema);
