import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
  key:  string;
  type: string;

  // ── Primary (English) ── public pages + CV EN
  value: string;

  // ── Indonesian translation ── CV ID + CV Preview only
  value_id?: string;
}

const SettingSchema = new Schema<ISetting>(
  {
    key:      { type: String, required: true, unique: true },
    type:     { type: String, default: 'text' },
    value:    { type: String, required: true },
    value_id: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Setting ||
  mongoose.model<ISetting>('Setting', SettingSchema);