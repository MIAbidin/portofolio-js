import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  categoryId:       mongoose.Types.ObjectId;
  title:            string;   // language-neutral
  slug:             string;
  imagePath:        string;
  techStack:        string[]; // language-neutral
  githubUrl?:       string;
  demoUrl?:         string;
  isFeatured:       boolean;
  order:            number;
  completedAt?:     Date;

  // ── Primary content (English) ── public pages + CV EN
  description:      string;
  shortDescription: string;

  // ── Indonesian translation ── CV ID + CV Preview only
  description_id:      string;
  shortDescription_id: string;

  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    categoryId:  { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    title:       { type: String, required: true },
    slug:        { type: String, required: true, unique: true },
    imagePath:   { type: String, default: '' },
    techStack:   { type: [String], default: [] },
    githubUrl:   { type: String },
    demoUrl:     { type: String },
    isFeatured:  { type: Boolean, default: false },
    order:       { type: Number, default: 0 },
    completedAt: { type: Date },

    // English (primary)
    description:      { type: String, default: '' },
    shortDescription: { type: String, default: '' },

    // Indonesian
    description_id:      { type: String, default: '' },
    shortDescription_id: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Project ||
  mongoose.model<IProject>('Project', ProjectSchema);