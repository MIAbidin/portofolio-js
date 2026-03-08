// ── Shared TypeScript types used across the app ──────────────────────

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Project {
  _id: string;
  categoryId: string;
  category?: Category;
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
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  _id: string;
  type: 'work' | 'education';
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  order: number;
}

export interface Skill {
  _id: string;
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
}

export interface Message {
  _id: string;
  senderName: string;
  senderEmail: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Setting {
  _id: string;
  key: string;
  value: string;
  type: 'text' | 'textarea' | 'url' | 'file';
}

// Settings map for easy key-value access
export type SettingsMap = Record<string, string>;

export interface Service {
  _id: string;
  title: string;
  slug: string;
  description: string;
  icon?: string;
  features: string[];
  order: number;
  isActive: boolean;
}

export interface Certification {
  _id: string;
  title: string;
  issuer: string;
  credentialId?: string;
  credentialUrl?: string;
  issuedDate: string;
  expiryDate?: string;
  imagePath?: string;
  order: number;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
}