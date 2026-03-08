import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { senderName, senderEmail, subject, message } = body;
    
    // Save to database
    const newMessage = await Message.create({
      senderName,
      senderEmail,
      subject,
      message,
    });
    
    // Send email notification (optional)
    const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'your-email@example.com',
      subject: `New Contact: ${subject}`,
      text: `From: ${senderName} (${senderEmail})\n\n${message}`,
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      data: newMessage 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}