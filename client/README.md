This folder contains the React frontend for UniPam — University of Sierra Leone eLearning.

## Current Status
- Implemented working React pages:
  - Home
  - About
  - Service
  - Training
  - Team
  - Testimonial
  - Contact
  - Feature
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

## Run
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:5173`

## Backend Integration
Vite proxy is configured for `/api` to `http://localhost:4000`.

## Next Tasks
1. Add admin partner management and reporting pages.
2. Implement profile editing endpoint and UI updates.
3. Tighten auth flows (refresh token flow, stricter admin provisioning).
