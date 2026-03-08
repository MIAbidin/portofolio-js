import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  categoryId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  imagePath: string;
  gallery?: string[];
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  isFeatured: boolean;
  order: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    title: { type: String, required: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String }, // Brief summary for card display
    imagePath: { type: String, required: true },
    gallery: [{ type: String }], // Additional project images
    techStack: [{ type: String }],
    githubUrl: { type: String },
    demoUrl: { type: String },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    completedAt: { type: Date }, // Project completion date
  },
  { timestamps: true }
);

// Indexes for better query performance
ProjectSchema.index({ categoryId: 1 });
ProjectSchema.index({ isFeatured: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ order: 1 });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);