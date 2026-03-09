import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Setting from '@/models/Setting';

// GET /api/settings/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const setting = await Setting.findById(id).lean();
    if (!setting) return NextResponse.json({ success: false, error: 'Setting not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: setting });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch setting' }, { status: 500 });
  }
}

// PUT /api/settings/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id }  = await params;
    const body     = await request.json();
    const { key, value, value_id, type } = body;

    const existing = await Setting.findById(id);
    if (!existing) return NextResponse.json({ success: false, error: 'Setting not found' }, { status: 404 });

    // Validate type if provided
    if (type !== undefined) {
      const validTypes = ['text', 'textarea', 'url', 'file'];
      if (!validTypes.includes(type))
        return NextResponse.json({ success: false, error: `Type must be one of: ${validTypes.join(', ')}` }, { status: 400 });
    }

    // Prevent duplicate key if key is being changed
    if (key && key !== existing.key) {
      const dup = await Setting.findOne({ key: key.trim(), _id: { $ne: id } });
      if (dup) return NextResponse.json({ success: false, error: 'Key already exists' }, { status: 409 });
    }

    const updateData: any = {};
    if (key      !== undefined) updateData.key      = key.trim();
    if (value    !== undefined) updateData.value    = typeof value    === 'string' ? value.trim()    : value;
    if (value_id !== undefined) updateData.value_id = typeof value_id === 'string' ? value_id.trim() : value_id;
    if (type     !== undefined) updateData.type     = type;

    const setting = await Setting.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    return NextResponse.json({ success: true, data: setting });

  } catch (error: any) {
    console.error('PUT /api/settings/[id] error:', error);
    if (error.name === 'ValidationError')
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Failed to update setting' }, { status: 500 });
  }
}

// DELETE /api/settings/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const setting = await Setting.findByIdAndDelete(id);
    if (!setting) return NextResponse.json({ success: false, error: 'Setting not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: setting });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to delete setting' }, { status: 500 });
  }
}