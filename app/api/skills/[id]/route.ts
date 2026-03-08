import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Skill from '@/models/Skill';

/**
 * GET /api/skills/[id]
 * Fetch a single skill by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const skill = await Skill.findById(params.id).lean();
    
    if (!skill) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: skill });
  } catch (error: any) {
    console.error('GET /api/skills/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch skill', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/skills/[id]
 * Update a skill
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { 
      name, 
      category, 
      subcategory,
      proficiency, 
      icon,
      iconPath,
      color,
      yearsExperience,
      order,
      isFeatured
    } = body;
    
    // Find existing skill
    const existingSkill = await Skill.findById(params.id);
    
    if (!existingSkill) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Validation
    if (category && !['hard', 'soft'].includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Category must be either "hard" or "soft"' },
        { status: 400 }
      );
    }

    if (proficiency !== undefined) {
      const prof = parseInt(proficiency);
      if (isNaN(prof) || prof < 1 || prof > 100) {
        return NextResponse.json(
          { success: false, error: 'Proficiency must be between 1 and 100' },
          { status: 400 }
        );
      }
    }

    if (yearsExperience !== undefined && yearsExperience !== null) {
      const years = parseInt(yearsExperience);
      if (isNaN(years) || years < 0) {
        return NextResponse.json(
          { success: false, error: 'Years of experience must be a positive number' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate skill name (excluding current skill)
    if (name && name !== existingSkill.name) {
      const duplicateSkill = await Skill.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: params.id }
      });
      
      if (duplicateSkill) {
        return NextResponse.json(
          { success: false, error: 'Skill with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (category !== undefined) updateData.category = category;
    if (subcategory !== undefined) updateData.subcategory = subcategory?.trim() || null;
    if (proficiency !== undefined) updateData.proficiency = parseInt(proficiency);
    if (icon !== undefined) updateData.icon = icon?.trim() || null;
    if (iconPath !== undefined) updateData.iconPath = iconPath?.trim() || null;
    if (color !== undefined) updateData.color = color?.trim() || null;
    if (yearsExperience !== undefined) updateData.yearsExperience = yearsExperience !== null ? parseInt(yearsExperience) : null;
    if (order !== undefined) updateData.order = parseInt(order);
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    
    const skill = await Skill.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ success: true, data: skill });
  } catch (error: any) {
    console.error('PUT /api/skills/[id] error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update skill', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/skills/[id]
 * Delete a skill
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const skill = await Skill.findByIdAndDelete(params.id);
    
    if (!skill) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Skill deleted successfully',
      data: skill
    });
  } catch (error: any) {
    console.error('DELETE /api/skills/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete skill', message: error.message },
      { status: 500 }
    );
  }
}
