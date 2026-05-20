# IDW Frontend (React Migration)

This folder contains the React migration app for Intellect Digital World.

## Current Migration Status
- Migrated to React routes and app shell.
- Implemented working React pages:
  - Home
  - About
  - Service
  - Training
  - Team
  - Testimonial
  - Contact
  - Feature
  - Price
  - Detail
  - Quote
  - Applications
  - User Login
  - User Register
  - Admin Login
  - Admin Dashboard
  - Course Catalog
  - User Dashboard
  - Profile
  - Course Player
  - Certificate Wallet
- Integrated these pages with backend APIs (`/auth`, `/courses`, `/enrollments`, `/dashboard`).
- Migrated all previously placeholder legacy routes into concrete React pages.

## Run
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:5173`

## Backend Integration
Vite proxy is configured for `/api` to `http://localhost:4000`.

## Next Migration Tasks
1. Add admin partner management and reporting pages.
2. Implement profile editing endpoint and UI updates.
3. Tighten auth flows (refresh token flow, stricter admin provisioning).
