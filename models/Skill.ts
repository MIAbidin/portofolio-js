import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: 'hard' | 'soft';
  subcategory?: string;
  proficiency: number;
  icon?: string;
  iconPath?: string;
  color?: string;
  yearsExperience?: number;
  order: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, maxlength: 100 },
    category: { type: String, enum: ['hard', 'soft'], required: true },
    subcategory: { type: String, maxlength: 100 }, // e.g., 'Programming', 'Network'
    proficiency: { type: Number, min: 1, max: 100, default: 50 },
    icon: { type: String }, // lucide icon name or icon class
    iconPath: { type: String }, // custom icon path
    color: { type: String, maxlength: 20 }, // badge color
    yearsExperience: { type: Number }, // years of experience
    order: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
SkillSchema.index({ category: 1 });
SkillSchema.index({ subcategory: 1 });
SkillSchema.index({ isFeatured: 1 });
SkillSchema.index({ order: 1 });

export default mongoose.models.Skill || mongoose.model<ISkill>('Skill', SkillSchema);