import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Project from '@/models/Project';

/**
 * GET /api/categories/[id]
 * Fetch a single category by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const category = await Category.findById(id).lean();
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    const projectCount = await Project.countDocuments({ categoryId: id });
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...category,
        projectCount
      }
    });
  } catch (error: any) {
    console.error('GET /api/categories/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/categories/[id]
 * Update a category
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const body = await request.json();
    const { name, icon } = body;
    
    const existingCategory = await Category.findById(id);
    
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    let slug = existingCategory.slug;
    if (name && name !== existingCategory.name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      const duplicateSlug = await Category.findOne({ 
        slug, 
        _id: { $ne: id } 
      });
      
      if (duplicateSlug) {
        return NextResponse.json(
          { success: false, error: 'Category with this name already exists' },
          { status: 409 }
        );
      }
    }
    
    const category = await Category.findByIdAndUpdate(
      id,
      { 
        name: name?.trim() || existingCategory.name,
        slug,
        icon: icon !== undefined ? icon : existingCategory.icon,
      },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    console.error('PUT /api/categories/[id] error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update category', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 * Delete a category
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const projectCount = await Project.countDocuments({ categoryId: id });
    
    if (projectCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete category with ${projectCount} project(s). Please reassign or delete projects first.` 
        },
        { status: 409 }
      );
    }
    
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Category deleted successfully',
      data: category
    });
  } catch (error: any) {
    console.error('DELETE /api/categories/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category', message: error.message },
      { status: 500 }
    );
  }
}