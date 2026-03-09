import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Experience from '@/models/Experience';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const experience = await Experience.findById(id).lean();
    if (!experience)
      return NextResponse.json({ success: false, error: 'Experience not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: experience });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch experience', message: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const {
      type, title, company, location, startDate, endDate,
      description, achievements,
      description_id, achievements_id,
      order,
    } = body;

    const existing = await Experience.findById(id);
    if (!existing)
      return NextResponse.json({ success: false, error: 'Experience not found' }, { status: 404 });

    if (type && !['work', 'education'].includes(type))
      return NextResponse.json({ success: false, error: 'Type must be "work" or "education"' }, { status: 400 });

    if (startDate && endDate) {
      const s = new Date(startDate), e = new Date(endDate);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e < s)
        return NextResponse.json({ success: false, error: 'End date cannot be before start date' }, { status: 400 });
    }

    const u: any = {};
    if (type        !== undefined) u.type        = type;
    if (title       !== undefined) u.title       = title.trim();
    if (company     !== undefined) u.company     = company.trim();
    if (location    !== undefined) u.location    = location?.trim() || null;
    if (startDate   !== undefined) u.startDate   = new Date(startDate);
    if (endDate     !== undefined) u.endDate     = endDate ? new Date(endDate) : null;
    if (description !== undefined) u.description = description.trim();
    if (order       !== undefined) u.order       = order;
    if (achievements    !== undefined) u.achievements    = Array.isArray(achievements)    ? achievements.map((a: string) => a.trim()).filter(Boolean)    : [];
    if (description_id  !== undefined) u.description_id  = description_id?.trim()  || '';
    if (achievements_id !== undefined) u.achievements_id = Array.isArray(achievements_id) ? achievements_id.map((a: string) => a.trim()).filter(Boolean) : [];

    const experience = await Experience.findByIdAndUpdate(id, u, { new: true, runValidators: true });
    return NextResponse.json({ success: true, data: experience });
  } catch (error: any) {
    if (error.name === 'ValidationError')
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Failed to update experience', message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const experience = await Experience.findByIdAndDelete(id);
    if (!experience)
      return NextResponse.json({ success: false, error: 'Experience not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Experience deleted successfully', data: experience });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to delete experience', message: error.message }, { status: 500 });
  }
}