import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Category from '@/models/Category'; // ← PENTING!
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Debug: Cek apakah Category ter-load
    console.log('📦 Category model loaded?', !!mongoose.models.Category);
    
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const featured   = searchParams.get('featured');
    const limit      = parseInt(searchParams.get('limit') ?? '0');

    const query: Record<string, unknown> = {};
    
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      query.categoryId = categoryId;
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }

    let q = Project.find(query)
      .populate('categoryId')
      .sort({ createdAt: -1 });

    if (limit > 0) {
      q = q.limit(limit);
    }

    const projects = await q;
    
    console.log(`✅ Found ${projects.length} projects`);

    return NextResponse.json({ success: true, data: projects });
    
  } catch (error) {
    console.error('❌ API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch projects',
        ...(process.env.NODE_ENV === 'development' && {
          debug: error instanceof Error ? error.message : String(error)
        })
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const project = await Project.create(body);
    
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating project:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}