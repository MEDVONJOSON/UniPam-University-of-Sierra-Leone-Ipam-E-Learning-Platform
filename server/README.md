# IDW Backend (Phase 1 Foundation)

This backend is the first implementation slice for IDW Phase 1. It provides:
- Express server scaffold
- API route skeletons under `/api/v1`
- PostgreSQL migration files for core entities

## Prerequisites
- Node.js 20+
- PostgreSQL 14+

## Setup
1. Copy env template:
   - `cp .env.example .env` (or create `.env` manually on Windows)
2. Fill required env values:
   - `DATABASE_URL`
   - `JWT_SECRET`
3. Install dependencies:
   - `npm install`
4. Run server:
   - `npm run dev`

## API Base URL
- `http://localhost:4000/api/v1`

## Quick Endpoints
- `GET /` service info
- `GET /api/v1/health` service + DB health check
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/courses`
- `POST /api/v1/courses` (admin only)
- `POST /api/v1/enrollments`
- `GET /api/v1/enrollments`
- `PATCH /api/v1/enrollments/:enrollmentId/progress`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/recommendations`
- `GET /api/v1/certificates`
- `POST /api/v1/certificates` (multipart: `certificateFile`)
- `PATCH /api/v1/certificates/:certificateId/visibility`
Core auth, courses, enrollments, dashboard, and certificate wallet endpoints are DB-backed.

## Database Migration
Run SQL files in order:
1. `db/migrations/001_init_phase1.sql`
2. `db/migrations/002_seed_providers.sql`
3. `db/migrations/003_seed_courses.sql`

Example:
```sql
\i db/migrations/001_init_phase1.sql
\i db/migrations/002_seed_providers.sql
\i db/migrations/003_seed_courses.sql
```
