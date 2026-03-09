import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Skill from '@/models/Skill';

// GET /api/skills/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const skill = await Skill.findById(id).lean();
    if (!skill) return NextResponse.json({ success: false, error: 'Skill not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: skill });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch skill' }, { status: 500 });
  }
}

// PUT /api/skills/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { name, category, subcategory, proficiency, icon, iconPath, color, yearsExperience, order, isFeatured } = body;

    const existing = await Skill.findById(id);
    if (!existing) return NextResponse.json({ success: false, error: 'Skill not found' }, { status: 404 });

    if (category && !['hard', 'soft'].includes(category))
      return NextResponse.json({ success: false, error: 'Category must be "hard" or "soft"' }, { status: 400 });

    if (proficiency !== undefined) {
      const p = parseInt(proficiency);
      if (isNaN(p) || p < 1 || p > 100)
        return NextResponse.json({ success: false, error: 'Proficiency must be 1–100' }, { status: 400 });
    }

    // Check duplicate name (excluding self)
    if (name && name !== existing.name) {
      const dup = await Skill.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }, _id: { $ne: id } });
      if (dup) return NextResponse.json({ success: false, error: 'Skill name already exists' }, { status: 409 });
    }

    const updateData: any = {};
    if (name            !== undefined) updateData.name            = name.trim();
    if (category        !== undefined) updateData.category        = category;
    if (subcategory     !== undefined) updateData.subcategory     = subcategory?.trim() || null;
    if (proficiency     !== undefined) updateData.proficiency     = parseInt(proficiency);
    if (icon            !== undefined) updateData.icon            = icon?.trim() || null;
    if (iconPath        !== undefined) updateData.iconPath        = iconPath?.trim() || null;
    if (color           !== undefined) updateData.color           = color?.trim() || null;
    if (yearsExperience !== undefined) updateData.yearsExperience = yearsExperience ? parseInt(yearsExperience) : null;
    if (order           !== undefined) updateData.order           = parseInt(order);
    if (isFeatured      !== undefined) updateData.isFeatured      = isFeatured;

    const skill = await Skill.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    return NextResponse.json({ success: true, data: skill });

  } catch (error: any) {
    console.error('PUT /api/skills/[id] error:', error);
    if (error.name === 'ValidationError')
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Failed to update skill' }, { status: 500 });
  }
}

// DELETE /api/skills/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const skill = await Skill.findByIdAndDelete(id);
    if (!skill) return NextResponse.json({ success: false, error: 'Skill not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: skill });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to delete skill' }, { status: 500 });
  }
}