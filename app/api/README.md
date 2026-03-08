# Portfolio Next.js API Routes - Complete Package

## 📦 Package Contents

Lengkap dengan semua API routes yang siap pakai untuk Portfolio Next.js + MongoDB.

### 📁 Folder Structure

```
api-routes/
├── categories/
│   ├── route.ts                    # GET, POST /api/categories
│   └── [id]/
│       └── route.ts                # GET, PUT, DELETE /api/categories/:id
│
├── experiences/
│   ├── route.ts                    # GET, POST /api/experiences
│   └── [id]/
│       └── route.ts                # GET, PUT, DELETE /api/experiences/:id
│
├── skills/
│   ├── route.ts                    # GET, POST /api/skills
│   └── [id]/
│       └── route.ts                # GET, PUT, DELETE /api/skills/:id
│
├── messages/
│   ├── route.ts                    # GET, POST /api/messages
│   ├── [id]/
│   │   └── route.ts                # GET, PATCH, DELETE /api/messages/:id
│   └── bulk/
│       └── route.ts                # PATCH, DELETE /api/messages/bulk
│
├── settings/
│   ├── route.ts                    # GET, POST, PUT /api/settings
│   └── [id]/
│       └── route.ts                # GET, PUT, DELETE /api/settings/:id
│
└── API_DOCUMENTATION.md            # Complete API documentation
```

---

## 🚀 Installation Guide

### Step 1: Copy Files to Your Next.js Project

Copy semua folder `api-routes` ke dalam project Next.js Anda:

```bash
# Di root project Next.js Anda
cp -r api-routes/* app/api/
```

Struktur akhir di project Anda akan menjadi:

```
your-nextjs-project/
├── app/
│   ├── api/
│   │   ├── categories/
│   │   ├── experiences/
│   │   ├── skills/
│   │   ├── messages/
│   │   └── settings/
│   ├── layout.tsx
│   └── page.tsx
├── models/
│   ├── Category.ts
│   ├── Experience.ts
│   ├── Skill.ts
│   ├── Message.ts
│   └── Setting.ts
└── lib/
    └── mongodb.ts
```

### Step 2: Install Required Dependencies

Pastikan Anda sudah install dependencies yang diperlukan:

```bash
npm install mongoose
```

### Step 3: Setup MongoDB Connection

Pastikan file `lib/mongodb.ts` sudah dibuat (lihat dokumentasi utama).

### Step 4: Create Mongoose Models

Buat semua model yang diperlukan di folder `models/`:
- `Category.ts`
- `Experience.ts`
- `Skill.ts`
- `Message.ts`
- `Setting.ts`
- `Project.ts` (sudah ada di dokumentasi utama)
- `User.ts` (sudah ada di dokumentasi utama)

Lihat file `portfolio-nextjs-spec.md` untuk detail schema lengkap.

### Step 5: Setup Environment Variables

Tambahkan di `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/portfolio_db
# atau MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio_db
```

### Step 6: Test API Routes

Jalankan development server:

```bash
npm run dev
```

Test endpoints menggunakan browser atau Postman:

```
GET  http://localhost:3000/api/categories
GET  http://localhost:3000/api/skills?category=hard
GET  http://localhost:3000/api/experiences?type=work
GET  http://localhost:3000/api/messages?isRead=false
GET  http://localhost:3000/api/settings
```

---

## 🎯 Features

### ✅ Categories API
- Full CRUD operations
- Auto slug generation
- Prevent deletion if has projects
- Project count on GET by ID

### ✅ Experiences API
- Filter by type (work/education)
- Date validation
- Sorting by order or date
- Ongoing experience support (null endDate)

### ✅ Skills API
- Advanced filtering (category, subcategory, featured)
- Group by subcategory
- Proficiency validation (1-100)
- Years of experience tracking
- Duplicate name prevention

### ✅ Messages API
- Pagination support
- Unread count
- Email validation
- Bulk operations (mark as read, delete)
- Read/unread status

### ✅ Settings API
- Key-value storage
- Type validation (text, textarea, url, file)
- Upsert operation
- URL validation for 'url' type

---

## 📊 API Response Format

Semua endpoint menggunakan format response yang konsisten:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 10,          // untuk list endpoints
  "message": "..."      // untuk operations
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed description"
}
```

---

## 🔐 Security Recommendations

### 1. Add Authentication Middleware

Tambahkan middleware untuk protect admin routes:

```typescript
// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Protect admin API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Skip public endpoints
    const publicEndpoints = ['/api/messages']; // POST only
    
    if (request.method !== 'POST' || !publicEndpoints.some(ep => request.nextUrl.pathname === ep)) {
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      });

      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### 2. Add Rate Limiting

Install rate limiter:

```bash
npm install express-rate-limit
```

### 3. Input Sanitization

Install validator:

```bash
npm install validator
```

Gunakan untuk validate & sanitize input.

### 4. CORS Configuration

Jika API akan diakses dari domain lain, tambahkan CORS headers.

---

## 🧪 Testing

### Manual Testing dengan cURL

```bash
# Create category
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Web Development","icon":"Globe"}'

# Get all skills grouped by subcategory
curl "http://localhost:3000/api/skills?category=hard&groupBy=subcategory"

# Submit contact message
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "senderName":"John Doe",
    "senderEmail":"john@example.com",
    "message":"Test message content here"
  }'

# Update setting
curl -X PUT http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "key":"hero_title",
    "value":"Full Stack Developer",
    "type":"text"
  }'
```

### Automated Testing (Optional)

Install testing library:

```bash
npm install --save-dev jest @testing-library/react supertest
```

---

## 📝 Usage Examples

### React Component - Fetch Skills

```tsx
'use client';

import { useState, useEffect } from 'react';

export default function SkillsSection() {
  const [skills, setSkills] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/skills?category=hard&groupBy=subcategory')
      .then(res => res.json())
      .then(data => {
        setSkills(data.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {Object.entries(skills).map(([category, items]: [string, any]) => (
        <div key={category}>
          <h2>{category}</h2>
          <div className="grid grid-cols-3 gap-4">
            {items.map((skill: any) => (
              <div key={skill._id} className="skill-card">
                <h3>{skill.name}</h3>
                <div className="proficiency-bar">
                  <div style={{ width: `${skill.proficiency}%` }} />
                </div>
                <span>{skill.proficiency}%</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Admin Component - Create Experience

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function AddExperienceForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      type: formData.get('type'),
      title: formData.get('title'),
      company: formData.get('company'),
      location: formData.get('location'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate') || null,
      description: formData.get('description'),
      order: parseInt(formData.get('order') as string) || 0,
    };

    try {
      const res = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Experience added successfully!');
        router.push('/admin/experiences');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Experience'}
      </button>
    </form>
  );
}
```

---

## 🔄 Migration from Laravel

Jika Anda migrate dari Laravel, berikut mapping endpoint:

| Laravel Route | Next.js API Route |
|--------------|-------------------|
| `GET /api/categories` | `GET /api/categories` |
| `POST /api/categories` | `POST /api/categories` |
| `GET /api/categories/{id}` | `GET /api/categories/[id]` |
| `PUT /api/categories/{id}` | `PUT /api/categories/[id]` |
| `DELETE /api/categories/{id}` | `DELETE /api/categories/[id]` |

Semua endpoint mengikuti pola yang sama.

---

## 📚 Documentation

Baca `API_DOCUMENTATION.md` untuk dokumentasi lengkap setiap endpoint, termasuk:
- Request/Response examples
- Query parameters
- Validation rules
- Error handling
- Usage examples

---

## 🎉 Ready to Use!

Semua API routes sudah production-ready dengan:
- ✅ Error handling
- ✅ Input validation
- ✅ Consistent response format
- ✅ TypeScript support
- ✅ MongoDB connection management
- ✅ Detailed documentation

**Happy Coding! 🚀**

---

**Questions or Issues?**

Refer to:
1. `API_DOCUMENTATION.md` - Complete API docs
2. `portfolio-nextjs-spec.md` - Full project specification
3. Model schemas in `models/` folder
