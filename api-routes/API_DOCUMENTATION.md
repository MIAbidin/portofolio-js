# Portfolio API Routes Documentation

Complete API documentation for Next.js 14 Portfolio Backend.

## 📋 Table of Contents
- [Categories API](#categories-api)
- [Experiences API](#experiences-api)
- [Skills API](#skills-api)
- [Messages API](#messages-api)
- [Settings API](#settings-api)

---

## 🏷️ Categories API

Base URL: `/api/categories`

### GET /api/categories
Fetch all categories with optional sorting.

**Query Parameters:**
- `sortBy` (optional): Field to sort by (default: `createdAt`)
- `order` (optional): Sort order `asc` or `desc` (default: `desc`)

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Web Development",
      "slug": "web-development",
      "icon": "Globe",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /api/categories
Create a new category.

**Request Body:**
```json
{
  "name": "Mobile App",
  "icon": "Smartphone"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Mobile App",
    "slug": "mobile-app",
    "icon": "Smartphone"
  }
}
```

### GET /api/categories/:id
Fetch a single category with project count.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Web Development",
    "slug": "web-development",
    "icon": "Globe",
    "projectCount": 5
  }
}
```

### PUT /api/categories/:id
Update a category.

**Request Body:**
```json
{
  "name": "Full Stack Development",
  "icon": "Code"
}
```

### DELETE /api/categories/:id
Delete a category (fails if category has projects).

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## 💼 Experiences API

Base URL: `/api/experiences`

### GET /api/experiences
Fetch all experiences with optional filtering.

**Query Parameters:**
- `type` (optional): Filter by type (`work` or `education`)
- `sortBy` (optional): Field to sort by (default: `order`)
- `order` (optional): Sort order `asc` or `desc` (default: `asc`)
- `limit` (optional): Limit number of results

**Example:**
```
GET /api/experiences?type=work&limit=5
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "work",
      "title": "Senior Developer",
      "company": "Tech Corp",
      "location": "Jakarta, Indonesia",
      "startDate": "2022-01-15T00:00:00Z",
      "endDate": null,
      "description": "Led development team...",
      "order": 1
    }
  ]
}
```

### POST /api/experiences
Create a new experience.

**Request Body:**
```json
{
  "type": "work",
  "title": "Full Stack Developer",
  "company": "Startup Inc",
  "location": "Remote",
  "startDate": "2023-01-01",
  "endDate": null,
  "description": "Developing web applications using Next.js and MongoDB",
  "order": 1
}
```

**Validation:**
- `type`: Required, must be `work` or `education`
- `title`: Required, max 200 characters
- `company`: Required, max 200 characters
- `startDate`: Required, valid date
- `endDate`: Optional, must be after startDate if provided
- `description`: Required

### GET /api/experiences/:id
Fetch a single experience.

### PUT /api/experiences/:id
Update an experience.

**Request Body:**
```json
{
  "title": "Lead Developer",
  "endDate": "2024-01-01"
}
```

### DELETE /api/experiences/:id
Delete an experience.

---

## 🎯 Skills API

Base URL: `/api/skills`

### GET /api/skills
Fetch all skills with advanced filtering and grouping.

**Query Parameters:**
- `category` (optional): Filter by category (`hard` or `soft`)
- `subcategory` (optional): Filter by subcategory (e.g., `Programming`, `Network`)
- `featured` (optional): Filter featured skills (`true` or `false`)
- `sortBy` (optional): Field to sort by (default: `order`)
- `order` (optional): Sort order `asc` or `desc`
- `limit` (optional): Limit number of results
- `groupBy` (optional): Group results by field (e.g., `subcategory`)

**Example with Grouping:**
```
GET /api/skills?category=hard&groupBy=subcategory
```

**Response (Grouped):**
```json
{
  "success": true,
  "count": 10,
  "grouped": true,
  "data": {
    "Programming": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "JavaScript",
        "category": "hard",
        "subcategory": "Programming",
        "proficiency": 90,
        "icon": "Code",
        "color": "#f7df1e",
        "yearsExperience": 5,
        "order": 1,
        "isFeatured": true
      }
    ],
    "Network": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "TCP/IP",
        "category": "hard",
        "subcategory": "Network",
        "proficiency": 85,
        "yearsExperience": 3
      }
    ]
  }
}
```

### POST /api/skills
Create a new skill.

**Request Body:**
```json
{
  "name": "React.js",
  "category": "hard",
  "subcategory": "Programming",
  "proficiency": 85,
  "icon": "Code",
  "iconPath": null,
  "color": "#61dafb",
  "yearsExperience": 4,
  "order": 2,
  "isFeatured": true
}
```

**Validation:**
- `name`: Required, max 100 characters, must be unique (case-insensitive)
- `category`: Required, must be `hard` or `soft`
- `proficiency`: Must be between 1 and 100
- `yearsExperience`: Must be a positive number

### GET /api/skills/:id
Fetch a single skill.

### PUT /api/skills/:id
Update a skill.

**Request Body:**
```json
{
  "proficiency": 95,
  "yearsExperience": 5
}
```

### DELETE /api/skills/:id
Delete a skill.

---

## 📧 Messages API

Base URL: `/api/messages`

### GET /api/messages
Fetch all messages with pagination and filtering.

**Query Parameters:**
- `isRead` (optional): Filter by read status (`true` or `false`)
- `sortBy` (optional): Field to sort by (default: `createdAt`)
- `order` (optional): Sort order `asc` or `desc` (default: `desc`)
- `limit` (optional): Results per page
- `page` (optional): Page number (default: 1)

**Example:**
```
GET /api/messages?isRead=false&limit=10&page=1
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "totalCount": 45,
  "unreadCount": 12,
  "page": 1,
  "totalPages": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "senderName": "John Doe",
      "senderEmail": "john@example.com",
      "subject": "Project Inquiry",
      "message": "I would like to discuss a potential project...",
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /api/messages
Submit a contact form message.

**Request Body:**
```json
{
  "senderName": "Jane Smith",
  "senderEmail": "jane@example.com",
  "subject": "Collaboration Opportunity",
  "message": "I'm interested in collaborating on a project..."
}
```

**Validation:**
- `senderName`: Required
- `senderEmail`: Required, must be valid email
- `message`: Required, min 10 characters
- `subject`: Optional

### GET /api/messages/:id
Fetch a single message.

### PATCH /api/messages/:id
Mark a message as read/unread.

**Request Body:**
```json
{
  "isRead": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message marked as read",
  "data": { ... }
}
```

### DELETE /api/messages/:id
Delete a message.

### PATCH /api/messages/bulk
Mark multiple messages as read/unread.

**Request Body:**
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "isRead": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 message(s) marked as read",
  "modifiedCount": 2
}
```

### DELETE /api/messages/bulk
Delete multiple messages.

**Request Body:**
```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

---

## ⚙️ Settings API

Base URL: `/api/settings`

### GET /api/settings
Fetch all settings or specific setting by key.

**Query Parameters:**
- `key` (optional): Fetch specific setting by key

**Example:**
```
GET /api/settings?key=hero_title
```

**Response (All Settings):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "key": "hero_title",
      "value": "Full Stack Developer",
      "type": "text"
    }
  ],
  "settings": {
    "hero_title": {
      "value": "Full Stack Developer",
      "type": "text",
      "_id": "507f1f77bcf86cd799439011"
    },
    "hero_subtitle": {
      "value": "Building digital experiences",
      "type": "text",
      "_id": "507f1f77bcf86cd799439012"
    }
  }
}
```

### PUT /api/settings
Update or create a setting (upsert).

**Request Body:**
```json
{
  "key": "hero_title",
  "value": "Senior Full Stack Developer",
  "type": "text"
}
```

**Types:**
- `text`: Short text input
- `textarea`: Long text input
- `url`: URL (validated)
- `file`: File path/URL

**Response:**
```json
{
  "success": true,
  "message": "Setting updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "key": "hero_title",
    "value": "Senior Full Stack Developer",
    "type": "text"
  }
}
```

### POST /api/settings
Create a new setting (fails if key exists).

**Request Body:**
```json
{
  "key": "social_github",
  "value": "https://github.com/username",
  "type": "url"
}
```

### GET /api/settings/:id
Fetch a single setting by ID.

### PUT /api/settings/:id
Update a setting by ID.

### DELETE /api/settings/:id
Delete a setting.

---

## 🔒 Error Handling

All endpoints return consistent error responses:

**Error Response Format:**
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description (in development)"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `404`: Not Found
- `409`: Conflict (duplicate)
- `500`: Internal Server Error

---

## 📝 Usage Examples

### JavaScript/TypeScript (Fetch API)

```typescript
// Fetch all projects
const response = await fetch('/api/projects');
const { data } = await response.json();

// Create new skill
const newSkill = await fetch('/api/skills', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Next.js',
    category: 'hard',
    proficiency: 90
  })
});

// Mark message as read
await fetch('/api/messages/507f1f77bcf86cd799439011', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ isRead: true })
});
```

### React Component Example

```tsx
'use client';

import { useState, useEffect } from 'react';

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetch('/api/skills?category=hard&groupBy=subcategory')
      .then(res => res.json())
      .then(data => setSkills(data.data));
  }, []);

  return (
    <div>
      {Object.entries(skills).map(([category, items]) => (
        <div key={category}>
          <h2>{category}</h2>
          {items.map(skill => (
            <div key={skill._id}>{skill.name}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

## 🚀 Next Steps

1. **Authentication**: Add middleware to protect admin routes
2. **Rate Limiting**: Implement rate limiting for public endpoints
3. **Caching**: Add Redis/SWR for frequently accessed data
4. **Validation**: Consider using Zod for request validation
5. **Testing**: Write unit tests for each endpoint

---

**Created for Next.js 14 Portfolio Project**
