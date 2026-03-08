import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';

/**
 * GET /api/messages
 * Fetch all messages with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const isRead = searchParams.get('isRead'); // 'true' or 'false'
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 1 : -1;
    const limit = parseInt(searchParams.get('limit') || '0');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Build query
    let query: any = {};
    
    if (isRead === 'true') {
      query.isRead = true;
    } else if (isRead === 'false') {
      query.isRead = false;
    }
    
    // Count total documents for pagination
    const totalCount = await Message.countDocuments(query);
    
    let messagesQuery = Message.find(query)
      .sort({ [sortBy]: order });
    
    // Pagination
    if (limit > 0) {
      const skip = (page - 1) * limit;
      messagesQuery = messagesQuery.skip(skip).limit(limit);
    }
    
    const messages = await messagesQuery.lean();
    
    // Get unread count
    const unreadCount = await Message.countDocuments({ isRead: false });
    
    return NextResponse.json({ 
      success: true, 
      count: messages.length,
      totalCount,
      unreadCount,
      page: limit > 0 ? page : 1,
      totalPages: limit > 0 ? Math.ceil(totalCount / limit) : 1,
      data: messages 
    });
  } catch (error: any) {
    console.error('GET /api/messages error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages
 * Create a new message (contact form submission)
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { senderName, senderEmail, subject, message } = body;
    
    // Validation
    if (!senderName || senderName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!senderEmail || senderEmail.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Message must be at least 10 characters long' },
        { status: 400 }
      );
    }
    
    const newMessage = await Message.create({
      senderName: senderName.trim(),
      senderEmail: senderEmail.trim().toLowerCase(),
      subject: subject?.trim() || null,
      message: message.trim(),
      isRead: false,
    });
    
    // Optional: Send email notification to admin
    // await sendEmailNotification(newMessage);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Message sent successfully',
        data: newMessage 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/messages error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to send message', message: error.message },
      { status: 500 }
    );
  }
}
