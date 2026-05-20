# Intellect Digital World (IDW) App Requirements

## 1. Project Overview

### 1.1 Purpose
Intellect Digital World (IDW) is a hybrid e-learning platform that aggregates, manages, and progressively hosts online courses from global providers, universities, and IDW itself. The primary user value is a single learning hub for quality education access, with a focus on Africa and emerging markets.

### 1.2 Vision
Empower individuals through technology education by unifying global learning resources, local institutions, and AI-driven learning management in one accessible platform.

## 2. Business Model

### 2.1 Core Strategy
- Phase 1: Aggregator + redirect
- Phase 2: Hybrid hosting + institution portal
- Phase 3: IDW-owned content and certification

### 2.2 Revenue Streams
- Affiliate commissions
- University partnerships
- Corporate training contracts
- IDW premium subscriptions
- IDW-owned course sales
- Certificate verification fees (future)

## 3. User Types
- Learners
- Instructors and institutions
- University partners
- IDW admins
- Corporate organization accounts (future)

## 4. Functional Requirements

### 4.1 Authentication and Accounts
- Email/password registration and login
- Social auth (Google, Apple)
- Optional phone number
- Role selection: Learner, Instructor/Institution
- Profile fields: personal details, education background, skills/interests, goals, country/language, profile photo

### 4.2 Course Aggregation (Phase 1 MVP)
- Sources: Coursera, IBM SkillsBuild, Udemy, UniAthena, and other open providers
- Listing fields:
  - Title
  - Provider
  - Skill level
  - Duration
  - Certificate availability
  - Cost (free/paid)
  - External provider URL
  - Category
- Enrollment flow:
  - User clicks enroll on IDW
  - IDW records enrollment event
  - User is redirected to provider
  - Learning occurs externally

### 4.3 LMS Lite (Phase 1)
- Dashboard: enrolled courses, progress, streaks, recommendations
- Progress tracking:
  - Manual sync
  - API sync where available
  - Self-mark completion
  - Completion status
- Career roadmaps:
  - Software Development
  - AI and Data
  - Cybersecurity
  - Entrepreneurship
- Milestones and skill-gap awareness

### 4.4 Certificate Management
- Certificate wallet:
  - Upload PDF/image
  - External verification links
  - Course-certificate mapping
  - Auto-verification (future)
- Certificate display:
  - Public/private controls
  - Shareable links
  - Downloadable IDW certificates (when IDW-hosted courses exist)

### 4.5 University and Institution Integration (Phase 2)
- Partner portal:
  - Institution profiles
  - Course upload/management
  - Student enrollment views
  - Analytics
- Hosted learning features:
  - Video lectures
  - Materials
  - Assignments and quizzes
  - Exams
  - Completion rules
- Priority segment: African universities, professional institutes, public training programs

### 4.6 IDW-Owned Courses (Phase 3)
- Authoring tools:
  - Video upload
  - Module builder
  - Quiz/exam builder
  - Certificate generation
- Categories: Technology, AI/Automation, Cybersecurity, Software Development, Digital Entrepreneurship
- IDW certificates:
  - Branded output
  - Unique certificate ID
  - Verification portal

### 4.7 AI Features
- Assistant:
  - Course recommendations
  - Study planning
  - Career guidance
  - Skill suggestions
- Progress insights:
  - Dropout risk
  - Personalized learning path
  - Performance feedback
- Premium subscription:
  - Monthly pricing
  - Advanced analytics
  - Coaching-style personalization

### 4.8 Admin and Management
- Roles:
  - Super Admin
  - Content Admin
  - Partner Manager
  - Support Admin
- Capabilities:
  - Course approval
  - Partnership management
  - User management
  - Analytics/reporting
  - Revenue tracking

## 5. Non-Functional Requirements
- Performance: page loads under 3 seconds, scalable architecture, CDN-ready media
- Security: encryption, secure auth, RBAC, certificate integrity controls
- Compliance: GDPR, partner platform terms, affiliate agreement compliance

## 6. Suggested Stack
- Frontend: React/Next.js (web), Flutter/React Native (mobile)
- Backend: Node.js or Django with REST/GraphQL APIs
- Data: PostgreSQL + MongoDB for content metadata
- Cloud: object storage + AI service integration

## 7. MVP Scope (Phase 1 Must-Have)
- User accounts
- Course aggregation
- Redirect enrollment
- Learning dashboard
- Certificate wallet
- Basic AI recommendations

## 8. Future Enhancements
- Offline mode
- Mobile-first AI tutor
- Corporate learning plans
- Blockchain verification
- Job matching integration

## 9. Success Metrics
- Monthly active users
- Course completion rates
- Certificate uploads
- Partner institutions onboarded
- Subscription conversion
