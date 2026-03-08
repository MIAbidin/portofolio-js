import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';

/**
 * GET /api/messages/[id]
 * Fetch a single message by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const message = await Message.findById(params.id).lean();
    
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: message });
  } catch (error: any) {
    console.error('GET /api/messages/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch message', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/messages/[id]
 * Update message (primarily for marking as read/unread)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { isRead } = body;
    
    // Find existing message
    const existingMessage = await Message.findById(params.id);
    
    if (!existingMessage) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    // Update only isRead field
    if (isRead !== undefined) {
      existingMessage.isRead = isRead;
      await existingMessage.save();
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Message marked as ${isRead ? 'read' : 'unread'}`,
      data: existingMessage 
    });
  } catch (error: any) {
    console.error('PATCH /api/messages/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update message', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/messages/[id]
 * Delete a message
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const message = await Message.findByIdAndDelete(params.id);
    
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Message deleted successfully',
      data: message
    });
  } catch (error: any) {
    console.error('DELETE /api/messages/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete message', message: error.message },
      { status: 500 }
    );
  }
}
