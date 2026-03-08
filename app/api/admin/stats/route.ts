import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project    from '@/models/Project';
import Message    from '@/models/Message';
import Skill      from '@/models/Skill';
import Experience from '@/models/Experience';

export async function GET() {
  try {
    await dbConnect();

    const [
      total_projects,
      featured_projects,
      total_messages,
      unread_messages,
      total_skills,
      total_experiences,
    ] = await Promise.all([
      Project.countDocuments({}),
      Project.countDocuments({ isFeatured: true }),
      Message.countDocuments({}),
      Message.countDocuments({ isRead: false }),
      Skill.countDocuments({}),
      Experience.countDocuments({}),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total_projects,
        featured_projects,
        total_messages,
        unread_messages,
        total_skills,
        total_experiences,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}