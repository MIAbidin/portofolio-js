import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Setting from '@/models/Setting';

/**
 * GET /api/settings
 * Fetch all settings or specific setting by key
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (key) {
      // Fetch specific setting by key
      const setting = await Setting.findOne({ key }).lean();
      
      if (!setting) {
        return NextResponse.json(
          { success: false, error: 'Setting not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        data: setting 
      });
    }
    
    // Fetch all settings
    const settings = await Setting.find().sort({ key: 1 }).lean();
    
    // Convert to key-value object for easier access
    const settingsObject = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = {
        value: setting.value,
        type: setting.type,
        _id: setting._id,
      };
      return acc;
    }, {});
    
    return NextResponse.json({ 
      success: true, 
      count: settings.length,
      data: settings,
      settings: settingsObject // Flattened version
    });
  } catch (error: any) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 * Update or create a setting
 */
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { key, value, type } = body;
    
    // Validation
    if (!key || key.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Setting key is required' },
        { status: 400 }
      );
    }

    if (value === undefined || value === null) {
      return NextResponse.json(
        { success: false, error: 'Setting value is required' },
        { status: 400 }
      );
    }

    const validTypes = ['text', 'textarea', 'url', 'file'];
    const settingType = type || 'text';
    
    if (!validTypes.includes(settingType)) {
      return NextResponse.json(
        { success: false, error: `Type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // URL validation if type is 'url'
    if (settingType === 'url' && value) {
      try {
        new URL(value);
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }
    
    // Upsert setting (update if exists, create if not)
    const setting = await Setting.findOneAndUpdate(
      { key: key.trim() },
      { 
        value: typeof value === 'string' ? value.trim() : value,
        type: settingType
      },
      { 
        new: true, 
        upsert: true, 
        runValidators: true 
      }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Setting updated successfully',
      data: setting 
    });
  } catch (error: any) {
    console.error('PUT /api/settings error:', error);
    
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
 * POST /api/settings
 * Create a new setting (alternative to PUT for explicit creation)
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { key, value, type } = body;
    
    // Validation
    if (!key || key.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Setting key is required' },
        { status: 400 }
      );
    }

    if (value === undefined || value === null) {
      return NextResponse.json(
        { success: false, error: 'Setting value is required' },
        { status: 400 }
      );
    }

    // Check if setting already exists
    const existingSetting = await Setting.findOne({ key: key.trim() });
    if (existingSetting) {
      return NextResponse.json(
        { success: false, error: 'Setting with this key already exists. Use PUT to update.' },
        { status: 409 }
      );
    }

    const validTypes = ['text', 'textarea', 'url', 'file'];
    const settingType = type || 'text';
    
    if (!validTypes.includes(settingType)) {
      return NextResponse.json(
        { success: false, error: `Type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }
    
    const setting = await Setting.create({
      key: key.trim(),
      value: typeof value === 'string' ? value.trim() : value,
      type: settingType,
    });
    
    return NextResponse.json(
      { success: true, data: setting },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/settings error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create setting', message: error.message },
      { status: 500 }
    );
  }
}
