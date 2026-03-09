import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';

// GET /api/messages/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const message = await Message.findById(id).lean();
    if (!message) return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: message });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch message' }, { status: 500 });
  }
}

// PATCH /api/messages/[id] — mark read/unread
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id }  = await params;
    const { isRead } = await request.json();

    const message = await Message.findById(id);
    if (!message) return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });

    if (isRead !== undefined) {
      message.isRead = isRead;
      await message.save();
    }

    return NextResponse.json({ success: true, data: message });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to update message' }, { status: 500 });
  }
}

// DELETE /api/messages/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const message = await Message.findByIdAndDelete(id);
    if (!message) return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: message });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to delete message' }, { status: 500 });
  }
}