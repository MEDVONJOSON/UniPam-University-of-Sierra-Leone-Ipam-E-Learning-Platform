# UniPam — University of Sierra Leone eLearning Platform

> **Bridging the gap between our historic academic legacy and the future of digital education.**
> UniPam is the official University of Sierra Leone (USL) eLearning & IPAM Academic Portal, designed for academic excellence, digital learning, and institutional management.

---

## 🏛️ Project Overview

UniPam provides a smart hybrid e-learning platform with multi-role support for **Students**, **Lecturers**, and **University Administrators**:

1. **Academic Catalog & IPAM Portal**:
   - 5 Faculties: *Accounting & Finance*, *Information Systems & Technology*, *Business Administration & Entrepreneurship*, *Leadership & Governance*, *Extra-Mural Studies*.
   - 39 Official Academic Programmes with entry requirements, durations, and career pathways.
   - Comprehensive Learning Materials Repository with search, semester filtering, and lecture note indexing.

2. **Student LMS Experience**:
   - Course discovery, instant enrollment, interactive learning players, and progress tracking.
   - Assessment Taking & Results System with real-time scoring.
   - Certificate Wallet for digital verified achievements.
   - Messaging & Communication Hub with course lecturers.

3. **Lecturer Teaching Suite**:
   - Course creation and curriculum authoring.
   - Course Materials Manager with file uploads, lecture notes, and week assignments.
   - Assessment & Quiz Builder with multiple-choice questions and automated grading.
   - Assessment Results & student submission reviews.

4. **Institutional Administrator Dashboard**:
   - **Main Dashboard**: Live key metrics (Total Users, Active Students, Active Lecturers, Total Courses, Total Materials, Messages Today) and Recent Activity feed.
   - **User Management**: Centralized account administration (search, filter by role, create lecturer/student accounts, edit profile data, activate/deactivate accounts).
   - **System Reports**: Real-time monitoring cards (User Growth, Database Response Time, Security Audit & TLS encryption, Storage Utilization) and 24-hour System Activity Log.
   - **Settings & Preferences**: Platform configurations, session timeouts, password policies, and maintenance toggles.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v20 or higher)
- npm

### 1. Start the Backend API Server
```bash
cd server
npm install
npm run dev
```
*Backend server runs on `http://localhost:4000`*

### 2. Start the Frontend React Client
```bash
cd client
npm install
npm run dev
```
*Frontend client runs on `http://localhost:5173`*

---

## 🔑 Default Credentials

| Portal | URL | Email / ID | Password | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Portal** | `/admin-login` | `admin@usl.edu.sl` | `adminpassword123` | Administrator |
| **Lecturer Portal** | `/login` | `lecturer@usl.edu.sl` | `lecturer123` | Lecturer |
| **Student Registration** | `/register` | *Register with your Student ID* | *Self-assigned* | Student / Learner |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 5, React Router v6, Tailwind CSS, Lucide Icons, PWA (Vite PWA plugin)
- **Backend**: Node.js, Express, JWT Authentication, Multer file upload handling, Helmet security
- **Data Layer**: Mock Database with JSON state persistence + PostgreSQL migration scripts

---

## 📜 License
University of Sierra Leone (USL) — All rights reserved.
