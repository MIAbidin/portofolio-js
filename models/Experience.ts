import mongoose, { Schema, Document } from 'mongoose';

export interface IExperience extends Document {
  type: 'work' | 'education';
  title: string;
  company: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  achievements: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    type:        { type: String, enum: ['work', 'education'], required: true },
    title:       { type: String, required: true, maxlength: 200 },
    company:     { type: String, required: true, maxlength: 200 },
    location:    { type: String, maxlength: 100 },
    startDate:   { type: Date, required: true },
    endDate:     { type: Date },
    description: { type: String, required: true },
    achievements:[{ type: String }],
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Experience || mongoose.model<IExperience>('Experience', ExperienceSchema);