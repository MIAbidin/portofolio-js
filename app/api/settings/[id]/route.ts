import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Setting from '@/models/Setting';

/**
 * GET /api/settings/[id]
 * Fetch a single setting by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const setting = await Setting.findById(params.id).lean();
    
    if (!setting) {
      return NextResponse.json(
        { success: false, error: 'Setting not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: setting });
  } catch (error: any) {
    console.error('GET /api/settings/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch setting', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings/[id]
 * Update a setting by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { key, value, type } = body;
    
    // Find existing setting
    const existingSetting = await Setting.findById(params.id);
    
    if (!existingSetting) {
      return NextResponse.json(
        { success: false, error: 'Setting not found' },
        { status: 404 }
      );
    }

    // Validation
    if (type !== undefined) {
      const validTypes = ['text', 'textarea', 'url', 'file'];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { success: false, error: `Type must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // URL validation if type is 'url'
    if ((type === 'url' || existingSetting.type === 'url') && value) {
      try {
        new URL(value);
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }

    // Check if new key already exists (if key is being changed)
    if (key && key !== existingSetting.key) {
      const duplicateKey = await Setting.findOne({ 
        key: key.trim(), 
        _id: { $ne: params.id } 
      });
      
      if (duplicateKey) {
        return NextResponse.json(
          { success: false, error: 'Setting with this key already exists' },
          { status: 409 }
        );
      }
    }

    // Build update object
    const updateData: any = {};
    if (key !== undefined) updateData.key = key.trim();
    if (value !== undefined) updateData.value = typeof value === 'string' ? value.trim() : value;
    if (type !== undefined) updateData.type = type;
    
    const setting = await Setting.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ success: true, data: setting });
  } catch (error: any) {
    console.error('PUT /api/settings/[id] error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update setting', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/settings/[id]
 * Delete a setting
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const setting = await Setting.findByIdAndDelete(params.id);
    
    if (!setting) {
      return NextResponse.json(
        { success: false, error: 'Setting not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Setting deleted successfully',
      data: setting
    });
  } catch (error: any) {
    console.error('DELETE /api/settings/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete setting', message: error.message },
      { status: 500 }
    );
  }
}
