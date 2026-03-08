import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Experience from '@/models/Experience';

/**
 * GET /api/experiences/[id]
 * Fetch a single experience by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const experience = await Experience.findById(params.id).lean();
    
    if (!experience) {
      return NextResponse.json(
        { success: false, error: 'Experience not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: experience });
  } catch (error: any) {
    console.error('GET /api/experiences/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch experience', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/experiences/[id]
 * Update an experience
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { 
      type, 
      title, 
      company, 
      location, 
      startDate, 
      endDate, 
      description, 
      order 
    } = body;
    
    // Find existing experience
    const existingExperience = await Experience.findById(params.id);
    
    if (!existingExperience) {
      return NextResponse.json(
        { success: false, error: 'Experience not found' },
        { status: 404 }
      );
    }

    // Validation
    if (type && !['work', 'education'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be either "work" or "education"' },
        { status: 400 }
      );
    }

    // Validate dates if provided
    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid start date' },
          { status: 400 }
        );
      }

      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return NextResponse.json(
            { success: false, error: 'Invalid end date' },
            { status: 400 }
          );
        }
        if (end < start) {
          return NextResponse.json(
            { success: false, error: 'End date cannot be before start date' },
            { status: 400 }
          );
        }
      }
    }

    // Build update object
    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (title !== undefined) updateData.title = title.trim();
    if (company !== undefined) updateData.company = company.trim();
    if (location !== undefined) updateData.location = location?.trim() || null;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (description !== undefined) updateData.description = description.trim();
    if (order !== undefined) updateData.order = order;
    
    const experience = await Experience.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ success: true, data: experience });
  } catch (error: any) {
    console.error('PUT /api/experiences/[id] error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update experience', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/experiences/[id]
 * Delete an experience
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const experience = await Experience.findByIdAndDelete(params.id);
    
    if (!experience) {
      return NextResponse.json(
        { success: false, error: 'Experience not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Experience deleted successfully',
      data: experience
    });
  } catch (error: any) {
    console.error('DELETE /api/experiences/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete experience', message: error.message },
      { status: 500 }
    );
  }
}
