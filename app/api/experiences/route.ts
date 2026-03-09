import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Experience from '@/models/Experience';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const type   = searchParams.get('type');
    const sortBy = searchParams.get('sortBy') || 'order';
    const order  = searchParams.get('order') === 'desc' ? -1 : 1;
    const limit  = parseInt(searchParams.get('limit') || '0');

    const query: any = {};
    if (type && (type === 'work' || type === 'education')) query.type = type;

    let q = Experience.find(query).sort({ [sortBy]: order, startDate: -1 });
    if (limit > 0) q = q.limit(limit);

    const experiences = await q.lean();
    return NextResponse.json({ success: true, count: experiences.length, data: experiences });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch experiences', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const {
      type, title, company, location, startDate, endDate,
      description, achievements,
      description_id, achievements_id,
      order,
    } = body;

    if (!type || !['work', 'education'].includes(type))
      return NextResponse.json({ success: false, error: 'Type must be "work" or "education"' }, { status: 400 });
    if (!title?.trim())
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    if (!company?.trim())
      return NextResponse.json({ success: false, error: 'Company/Institution is required' }, { status: 400 });
    if (!startDate)
      return NextResponse.json({ success: false, error: 'Start date is required' }, { status: 400 });
    if (!description?.trim())
      return NextResponse.json({ success: false, error: 'Description (English) is required' }, { status: 400 });

    const start = new Date(startDate);
    if (isNaN(start.getTime()))
      return NextResponse.json({ success: false, error: 'Invalid start date' }, { status: 400 });
    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime()))
        return NextResponse.json({ success: false, error: 'Invalid end date' }, { status: 400 });
      if (end < start)
        return NextResponse.json({ success: false, error: 'End date cannot be before start date' }, { status: 400 });
    }

    const experience = await Experience.create({
      type,
      title:       title.trim(),
      company:     company.trim(),
      location:    location?.trim() || null,
      startDate:   start,
      endDate:     endDate ? new Date(endDate) : null,
      description: description.trim(),
      achievements:    Array.isArray(achievements)    ? achievements.map((a: string) => a.trim()).filter(Boolean)    : [],
      description_id:  description_id?.trim()  || '',
      achievements_id: Array.isArray(achievements_id) ? achievements_id.map((a: string) => a.trim()).filter(Boolean) : [],
      order: order || 0,
    });

    return NextResponse.json({ success: true, data: experience }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ValidationError')
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Failed to create experience', message: error.message }, { status: 500 });
  }
}