# IDW Phase 1 Gap Analysis and Roadmap

## Current Baseline (as of March 9, 2026)
- Frontend is static HTML/CSS/JS pages.
- Auth, profile, enrollment, and dashboard behavior are localStorage-based.
- No server-side API, database, or external provider integrations are active.

## Requirement Coverage Matrix (Phase 1)

| Requirement | Status | Notes |
| --- | --- | --- |
| User accounts | Partial | Demo auth exists in browser storage only; no secure backend auth or social login. |
| Course aggregation | Partial | Static/default courses exist; no automated ingestion from Coursera/Udemy/IBM/UniAthena. |
| Redirect enrollment | Partial | Enrollment recording exists locally, but no provider redirect audit trail in backend. |
| Learning dashboard | Partial | Dashboard UI exists with local progress data; no durable cross-device sync. |
| Certificate wallet | Partial | Basic certificate generation/download behavior exists; no real upload/verification storage. |
| Basic AI recommendations | Missing | No AI recommendation engine currently implemented. |

## Phase 1 Delivery Plan

## Slice 1: Foundation API and Data
- Build backend service (Node.js/Express or Django).
- Add PostgreSQL schema for:
  - users
  - profiles
  - providers
  - courses
  - enrollments
  - certificate_assets
  - learning_events
- Introduce JWT auth and role model (learner, instructor, admin).

## Slice 2: Auth and Profile Migration
- Replace localStorage auth with backend auth API.
- Add secure password hashing and session/token refresh flow.
- Add profile CRUD endpoint and wire existing UI forms.
- Add social auth placeholders (Google/Apple) behind feature flags.

## Slice 3: Course Aggregation and Redirect Tracking
- Create provider adapter interface and seed connectors for first sources.
- Normalize aggregated fields into common course schema.
- Add tracked redirect endpoint:
  - Records click/enrollment event
  - Redirects user to provider URL
- Add provider/category filters and free/paid metadata.

## Slice 4: Dashboard and Progress
- Move enrollment and progress state to backend.
- Add APIs for:
  - enrolled courses
  - completion percentages
  - streak and activity summaries
- Keep manual progress sync in MVP.

## Slice 5: Certificate Wallet
- Add secure upload endpoint and object storage integration.
- Support PDF/image uploads with metadata and course mapping.
- Add visibility controls (public/private) and share links.

## Slice 6: Basic AI Recommendations
- Implement first-pass recommendation service:
  - Input: user profile + enrolled categories + goals
  - Output: ranked recommended courses
- Start with rules-based logic; keep LLM integration optional for MVP.

## Acceptance Criteria (Phase 1)
- User can register/login and keep data across devices.
- User can browse aggregated courses with provider metadata.
- Enrollment redirect events are recorded server-side.
- User dashboard shows persisted enrollments and progress.
- User uploads and manages certificate files.
- Recommendation widget returns at least 5 relevant courses per user profile.

## Immediate Next Build Tasks
1. Scaffold backend project and environment configs.
2. Add DB schema and migrations for core entities.
3. Switch login/register pages to API calls.
4. Implement course list API with normalized provider fields.
5. Wire redirect enrollment endpoint from catalog UI.
