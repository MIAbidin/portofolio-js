import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Skill from '@/models/Skill';

/**
 * GET /api/skills
 * Fetch all skills with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // 'hard' or 'soft'
    const subcategory = searchParams.get('subcategory');
    const featured = searchParams.get('featured'); // 'true' or 'false'
    const sortBy = searchParams.get('sortBy') || 'order';
    const order = searchParams.get('order') === 'desc' ? -1 : 1;
    const limit = parseInt(searchParams.get('limit') || '0');
    
    // Build query
    let query: any = {};
    
    if (category && (category === 'hard' || category === 'soft')) {
      query.category = category;
    }
    
    if (subcategory) {
      query.subcategory = subcategory;
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    let skillsQuery = Skill.find(query)
      .sort({ [sortBy]: order });
    
    if (limit > 0) {
      skillsQuery = skillsQuery.limit(limit);
    }
    
    const skills = await skillsQuery.lean();
    
    // Group by subcategory if requested
    const groupBy = searchParams.get('groupBy');
    if (groupBy === 'subcategory') {
      const grouped = skills.reduce((acc: any, skill: any) => {
        const sub = skill.subcategory || 'Other';
        if (!acc[sub]) {
          acc[sub] = [];
        }
        acc[sub].push(skill);
        return acc;
      }, {});
      
      return NextResponse.json({ 
        success: true, 
        count: skills.length,
        data: grouped,
        grouped: true
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      count: skills.length,
      data: skills 
    });
  } catch (error: any) {
    console.error('GET /api/skills error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch skills', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/skills
 * Create a new skill
 */
export async function POST(request: NextRequest) {
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
    
    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Skill name is required' },
        { status: 400 }
      );
    }

    if (!category || !['hard', 'soft'].includes(category)) {
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

    if (yearsExperience !== undefined) {
      const years = parseInt(yearsExperience);
      if (isNaN(years) || years < 0) {
        return NextResponse.json(
          { success: false, error: 'Years of experience must be a positive number' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate skill name
    const existingSkill = await Skill.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    
    if (existingSkill) {
      return NextResponse.json(
        { success: false, error: 'Skill with this name already exists' },
        { status: 409 }
      );
    }
    
    const skill = await Skill.create({
      name: name.trim(),
      category,
      subcategory: subcategory?.trim() || null,
      proficiency: proficiency || 50,
      icon: icon?.trim() || null,
      iconPath: iconPath?.trim() || null,
      color: color?.trim() || null,
      yearsExperience: yearsExperience || null,
      order: order || 0,
      isFeatured: isFeatured || false,
    });
    
    return NextResponse.json(
      { success: true, data: skill },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/skills error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create skill', message: error.message },
      { status: 500 }
    );
  }
}
