import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';

/**
 * PATCH /api/messages/bulk
 * Bulk update messages (mark multiple as read/unread)
 */
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { ids, isRead } = body;
    
    // Validation
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message IDs array is required' },
        { status: 400 }
      );
    }

    if (typeof isRead !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isRead must be a boolean value' },
        { status: 400 }
      );
    }
    
    // Update multiple messages
    const result = await Message.updateMany(
      { _id: { $in: ids } },
      { $set: { isRead } }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: `${result.modifiedCount} message(s) marked as ${isRead ? 'read' : 'unread'}`,
      modifiedCount: result.modifiedCount
    });
  } catch (error: any) {
    console.error('PATCH /api/messages/bulk error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update messages', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/messages/bulk
 * Bulk delete messages
 */
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { ids } = body;
    
    // Validation
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message IDs array is required' },
        { status: 400 }
      );
    }
    
    // Delete multiple messages
    const result = await Message.deleteMany({ _id: { $in: ids } });
    
    return NextResponse.json({ 
      success: true, 
      message: `${result.deletedCount} message(s) deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error: any) {
    console.error('DELETE /api/messages/bulk error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete messages', message: error.message },
      { status: 500 }
    );
  }
}
