import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Setting from '@/models/Setting';

// GET /api/settings
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      const setting = await Setting.findOne({ key }).lean();
      if (!setting) return NextResponse.json({ success: false, error: 'Setting not found' }, { status: 404 });
      return NextResponse.json({ success: true, data: setting });
    }

    const settings = await Setting.find().sort({ key: 1 }).lean();
    return NextResponse.json({ success: true, count: settings.length, data: settings });

  } catch (error: any) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/settings — upsert by key
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { key, value, value_id, type } = body;

    if (!key?.trim())
      return NextResponse.json({ success: false, error: 'Key is required' }, { status: 400 });
    if (value === undefined || value === null)
      return NextResponse.json({ success: false, error: 'Value is required' }, { status: 400 });

    const validTypes  = ['text', 'textarea', 'url', 'file'];
    const settingType = type || 'text';
    if (!validTypes.includes(settingType))
      return NextResponse.json({ success: false, error: `Type must be one of: ${validTypes.join(', ')}` }, { status: 400 });

    const setting = await Setting.findOneAndUpdate(
      { key: key.trim() },
      {
        value:    typeof value    === 'string' ? value.trim()    : value,
        value_id: typeof value_id === 'string' ? value_id.trim() : (value_id ?? ''),
        type:     settingType,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: setting });

  } catch (error: any) {
    console.error('PUT /api/settings error:', error);
    if (error.name === 'ValidationError')
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Failed to update setting' }, { status: 500 });
  }
}

// POST /api/settings — create new key
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { key, value, value_id, type } = body;

    if (!key?.trim())
      return NextResponse.json({ success: false, error: 'Key is required' }, { status: 400 });
    if (value === undefined || value === null)
      return NextResponse.json({ success: false, error: 'Value is required' }, { status: 400 });

    const existing = await Setting.findOne({ key: key.trim() });
    if (existing)
      return NextResponse.json({ success: false, error: 'Key already exists. Use PUT to update.' }, { status: 409 });

    const validTypes  = ['text', 'textarea', 'url', 'file'];
    const settingType = type || 'text';
    if (!validTypes.includes(settingType))
      return NextResponse.json({ success: false, error: `Type must be one of: ${validTypes.join(', ')}` }, { status: 400 });

    const setting = await Setting.create({
      key:      key.trim(),
      value:    typeof value    === 'string' ? value.trim()    : value,
      value_id: typeof value_id === 'string' ? value_id.trim() : '',
      type:     settingType,
    });

    return NextResponse.json({ success: true, data: setting }, { status: 201 });

  } catch (error: any) {
    console.error('POST /api/settings error:', error);
    if (error.name === 'ValidationError')
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Failed to create setting' }, { status: 500 });
  }
}