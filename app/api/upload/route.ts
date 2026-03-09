import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const ALLOWED_FOLDERS = ['projects', 'icons'] as const;
type Folder = typeof ALLOWED_FOLDERS[number];

const MAX_SIZE: Record<Folder, number> = {
  projects: 5 * 1024 * 1024, // 5MB
  icons:    2 * 1024 * 1024, // 2MB
};

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = (searchParams.get('folder') || 'projects') as Folder;

    if (!ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json({ error: `Invalid folder. Must be one of: ${ALLOWED_FOLDERS.join(', ')}` }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Validate type
    const isImage = file.type.startsWith('image/');
    const isSvg   = file.name.toLowerCase().endsWith('.svg');
    if (!isImage && !isSvg) {
      return NextResponse.json({ error: 'File must be an image (PNG, JPG, SVG, WebP, etc.)' }, { status: 400 });
    }

    // Validate size per folder
    if (file.size > MAX_SIZE[folder]) {
      const mb = MAX_SIZE[folder] / 1024 / 1024;
      return NextResponse.json({ error: `Max file size for ${folder} is ${mb}MB.` }, { status: 400 });
    }

    // Build path: folder/timestamp-safename.ext
    const ext      = file.name.split('.').pop()?.toLowerCase() || 'png';
    const safeName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()
      .slice(0, 40);
    const filename = `${folder}/${Date.now()}-${safeName}.${ext}`;

    const blob = await put(filename, file, {
      access:      'public',
      contentType: isSvg ? 'image/svg+xml' : file.type,
    });

    return NextResponse.json({ success: true, url: blob.url, folder });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}