import mongoose, { Schema, Document } from 'mongoose';

export interface IExperience extends Document {
  type:        'work' | 'education';
  title:       string;       // language-neutral (same in both)
  company:     string;       // language-neutral
  location?:   string;       // language-neutral
  startDate:   Date;
  endDate?:    Date | null;

  // ── Primary content (English) ── used by public pages + CV EN
  description:  string;
  achievements: string[];

  // ── Indonesian translation ── used only by CV ID + CV Preview switcher
  description_id:  string;
  achievements_id: string[];

  order:     number;
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    type:     { type: String, enum: ['work', 'education'], required: true },
    title:    { type: String, required: true, maxlength: 200 },
    company:  { type: String, required: true, maxlength: 200 },
    location: { type: String, maxlength: 100 },
    startDate:{ type: Date, required: true },
    endDate:  { type: Date, default: null },

    // English (primary — required)
    description:  { type: String, required: true },
    achievements: { type: [String], default: [] },

    // Indonesian (optional translation)
    description_id:  { type: String, default: '' },
    achievements_id: { type: [String], default: [] },

    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Experience ||
  mongoose.model<IExperience>('Experience', ExperienceSchema);