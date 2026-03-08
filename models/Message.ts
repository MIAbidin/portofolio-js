import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  senderName: string;
  senderEmail: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderName: { type: String, required: true, maxlength: 100 },
    senderEmail: { type: String, required: true, maxlength: 100 },
    subject: { type: String, maxlength: 200 },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);