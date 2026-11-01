# PlaceWise — Multi-College Career & Placement Intelligence Platform

[![Node Version](https://img.shields.io/badge/Node-v20%2B-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2F9.0-blue.svg)](https://www.mysql.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-blueviolet.svg)](https://react.dev/)
[![Tests](https://img.shields.io/badge/Tests-27%20Passed-emerald.svg)](server/tests)

PlaceWise is a full-stack career and placement intelligence platform built for engineering students across all disciplines. It unifies **on-campus recruitment drives** with **verified off-campus opportunities**, audits real-time academic eligibility, and provides transparent, explainable recommendations without stereotyping students by their engineering branch.

---

## 1. Product Vision & Problem Statement

### The Problem
Traditional college placement management systems suffer from three critical flaws:
1. **Siloed Campus Visibility:** Students only see companies visiting their campus, missing out on off-campus opportunities, graduate engineering trainee programmes, and national hiring drives.
2. **Branch Stereotyping:** Systems infer career interests from academic branches (e.g., assuming Mechanical students only want core factory roles, or Computer Science students only want frontend coding).
3. **Opaque Ineligibility & Ghosting:** Students rarely understand *why* they failed an eligibility cut-off or which missing skills would have made them competitive.

### The PlaceWise Solution
- **Dual Opportunity Sourcing:** Seamlessly classifies and displays both **Campus Drives** and **External Opportunities** with verified provenance.
- **Four Explicit Preference Modes:** `TECHNICAL`, `NON_TECHNICAL`, `BOTH`, and `OPEN_TO_ALL`. Preference never changes academic eligibility.
- **Career Path Intelligence Engine (CPIE):**
  - **Eligibility Engine:** Evaluates mandatory requirements with deterministic outputs: `ELIGIBLE`, `NOT_ELIGIBLE`, and `NEEDS_VERIFICATION`. Confirmed failures always trump unverified fields.
  - **Explainable Ranking:** Configurable scoring formula: $\text{Score} = 0.40P + 0.35K + 0.15W + 0.10L$.
  - **Skill-Gap Impact Analysis:** Highlights the market frequency of missing desirable skills across all currently eligible openings.
  - **Feed Partitioning:** Partitions discovery into *Recommended For You* and *Explore Other Opportunities*. An eligible role is never hidden.
- **Multi-College Relational Architecture:** Built to support multiple institutions (Amity University Kolkata, Apex Institute, Metro Tech) with strict data isolation.

---

## 2. System Architecture

```mermaid
graph TD
    Client["Client Tier<br/>(React 19, Vite, Tailwind CSS 4, React Router 7)"]
    API["API & Service Tier<br/>(Node.js, Express, JWT, Bcrypt, Multer)"]
    CPIE["Career Path Intelligence Engine (CPIE)<br/>Eligibility • Preference • Skills • Scoring • Skill-Gap"]
    DB[("Persistence Tier<br/>(MySQL Relational Schema)")]
    Vault["Secure Local Resume Storage<br/>(Private Disk Path)"]

    Client -->|HTTPS REST / JSON| API
    API --> CPIE
    CPIE -->|Query Pool| DB
    API -->|Connection Pool| DB
    API -->|Encrypted FS Stream| Vault
```

---

## 3. Database Entity-Relationship Diagram

```mermaid
erDiagram
    INSTITUTIONS ||--o{ USERS : "employs / enrolls"
    USERS ||--o| STUDENT_PROFILES : "has"
    USERS ||--o| STUDENT_PREFERENCES : "declares"
    USERS ||--o{ RESUMES : "owns"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ AUDIT_LOGS : "triggers"
    STUDENT_PROFILES ||--o{ STUDENT_SKILLS : "possesses"
    SKILLS ||--o{ STUDENT_SKILLS : "tagged in"
    
    COMPANIES ||--o{ JOB_ROLES : "offers"
    JOB_ROLES ||--o{ PLACEMENT_DRIVES : "manifests as"
    JOB_ROLES ||--o{ JOB_SKILLS : "requires"
    SKILLS ||--o{ JOB_SKILLS : "demanded by"
    
    INSTITUTIONS ||--o{ PLACEMENT_DRIVES : "hosts (campus)"
    PLACEMENT_DRIVES ||--o| OPPORTUNITY_SOURCES : "classified under"
    PLACEMENT_DRIVES ||--o{ ELIGIBILITY_CRITERIA : "governed by"
    PLACEMENT_DRIVES ||--o{ DRIVE_ALLOWED_INSTITUTIONS : "whitelists"
    INSTITUTIONS ||--o{ DRIVE_ALLOWED_INSTITUTIONS : "allowed for"
    
    USERS ||--o{ APPLICATIONS : "submits"
    PLACEMENT_DRIVES ||--o{ APPLICATIONS : "receives"
    APPLICATIONS ||--o{ APPLICATION_STATUS_HISTORY : "tracks"
```

---

## 4. CPIE Eligibility Resolution Flowchart

```mermaid
flowchart TD
    Start["Student Evaluates Opportunity"] --> ScopeCheck{"Is Opportunity Campus or External?"}
    
    ScopeCheck -- CAMPUS --> InstCheck{"Student College == Host College?"}
    InstCheck -- NO --> NotEligible["Outcome: NOT_ELIGIBLE<br/>(Campus College Mismatch)"]
    InstCheck -- YES --> CriteriaCheck["Evaluate Mandatory Academic Criteria"]
    
    ScopeCheck -- EXTERNAL --> ScopeType{"External College Scope"}
    ScopeType -- OPEN_TO_ALL / NOT_SPECIFIED --> CriteriaCheck
    ScopeType -- SELECTED_COLLEGES --> WhiteCheck{"Student College in Partner Whitelist?"}
    WhiteCheck -- NO --> NotEligible
    WhiteCheck -- YES --> CriteriaCheck
    ScopeType -- COLLEGE_RESTRICTED --> WhiteCheck

    CriteriaCheck --> FailCheck{"Any mandatory criterion confirmed failed?<br/>(CGPA &lt; Min, Backlogs &gt; Max, Branch unaccepted)"}
    FailCheck -- YES --> NotEligible
    FailCheck -- NO --> MissingCheck{"Any mandatory criterion missing or unverified?<br/>(CGPA missing, Grad year unverified)"}
    
    MissingCheck -- YES --> NeedsVerification["Outcome: NEEDS_VERIFICATION<br/>(Ambiguous Info)"]
    MissingCheck -- NO --> Eligible["Outcome: ELIGIBLE<br/>(All Criteria Confirmed)"]

    style Eligible fill:#dcfce7,stroke:#16a34a,stroke-width:2px;
    style NotEligible fill:#ffe4e6,stroke:#e11d48,stroke-width:2px;
    style NeedsVerification fill:#fef3c7,stroke:#d97706,stroke-width:2px;
```

---

## 5. Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, React Router 7, Lucide Icons.
- **Backend:** Node.js, Express, JWT, bcryptjs, Multer, connection pooling (`mysql2/promise`).
- **Database:** MySQL (normalized relational schema, migration scripts, demo seed data).
- **Testing:** Node.js native test runner (`node:test`), Supertest / Fetch integration test suites.
- **Storage:** Secure local development storage outside static web roots.

---

## 6. Directory Structure

```
PlaceWise/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, OpportunityCard, Badges, Modals)
│   │   ├── context/            # AuthContext, NotificationContext
│   │   ├── pages/              # 19 required views
│   │   │   ├── public/         # LandingPage, LoginPage, RegisterPage
│   │   │   ├── onboarding/     # OnboardingPage (Preference & Academic Setup)
│   │   │   ├── student/        # Dashboard, Profile, Preferences, Resumes, Opportunities, Applications, Settings
│   │   │   ├── admin/          # PlacementDashboard, CompanyManagement, DriveManagement
│   │   │   └── platform/       # ModerationQueue, InstitutionManagement
│   │   ├── services/           # API client module
│   │   ├── App.jsx             # Route definitions & RBAC guards
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/                     # Backend API & Intelligence Engine
│   ├── src/
│   │   ├── config/             # DB connection pool (127.0.0.1:3307 / 3306)
│   │   ├── controllers/        # auth, student, opportunity, application, admin, platform
│   │   ├── middleware/         # authGuard, requireRoles, institutionGuard, errorHandler
│   │   ├── services/
│   │   │   ├── cpie/           # Career Path Intelligence Engine
│   │   │   │   ├── eligibilityEngine.js
│   │   │   │   ├── preferenceMatcher.js
│   │   │   │   ├── skillCompatibility.js
│   │   │   │   ├── recommendationEngine.js
│   │   │   │   └── skillGapAnalyzer.js
│   │   │   ├── notificationService.js
│   │   │   └── storageService.js
│   │   ├── db/
│   │   │   ├── migrations/     # 001_initial_schema.sql
│   │   │   ├── seeds/
│   │   │   ├── migrate.js
│   │   │   └── seed.js
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/                  # Automated test suites (CPIE + REST APIs)
│   ├── uploads/resumes/        # Private resume vault
│   ├── .env.example
│   └── package.json
├── docs/                       # Technical Specifications & ERD
└── README.md
```

---

## 7. Demonstration Accounts

All demonstration accounts use the password: `Demo@1234`

| Role | Email | Profile Details & Context |
|---|---|---|
| **Platform Admin** | `admin@placewise.io` | PlaceWise Platform HQ, moderation of external listings & colleges |
| **Placement Admin** | `placement@auk.placewise.io` | Amity University Kolkata Placement Cell Administrator |
| **Student (Technical)** | `rohan.cse@auk.edu` | Amity Kolkata, B.Tech CSE (2026), 8.80 CGPA, Mode: `TECHNICAL` |
| **Student (Both Domains)** | `ananya.ece@auk.edu` | Amity Kolkata, B.Tech ECE (2026), 7.60 CGPA, Mode: `BOTH` |
| **Student (Non-Technical)** | `vikram.me@auk.edu` | Amity Kolkata, B.Tech ME (2026), 7.10 CGPA, 1 Backlog, Mode: `NON_TECHNICAL` |
| **Student (Open to All)** | `sneha.it@apex.edu` | Apex Institute, B.Tech IT (2026), 8.40 CGPA, Mode: `OPEN_TO_ALL` |
| **Student (Unverified)** | `arpan.unverified@auk.edu` | Amity Kolkata, Civil Eng, incomplete CGPA (Tests `NEEDS_VERIFICATION`) |

---

## 8. Installation & Local Run Instructions

### Prerequisites
- Node.js v20+ and npm v10+
- MySQL Server (Homebrew or standard MySQL 8/9)

### 1. Database Setup
Ensure MySQL is running on port `3307` (or edit `server/.env` for `3306`):
```bash
# In server directory:
cd server
cp .env.example .env

# Run migrations and seed data
npm run db:setup
```

### 2. Run Backend Server
```bash
cd server
npm start
# Server listens on http://localhost:5005
```

### 3. Run Frontend Application
```bash
cd client
npm run dev
# Vite runs on http://localhost:3000 (proxies /api to http://localhost:5005)
```

### 4. Running the Automated Test Suite
```bash
cd server
npm test
```

### Verification Output:
```
✔ PlaceWise REST API & End-to-End Integration Tests (298ms)
✔ PlaceWise CPIE — Eligibility Engine Tests (2.6ms)
✔ PlaceWise CPIE — Career Preferences & Skill Compatibility Tests (1.9ms)
ℹ tests 27
ℹ suites 3
ℹ pass 27
ℹ fail 0
```

---

## 9. Known MVP Boundaries

1. **Password Reset:** Self-service email OTP verification is designed to hook into institutional SMTP services; for this MVP, credential updates are mediated by college placement administrators.
2. **Resume Parsing:** Automatic resume text extraction requires manual student confirmation before modifying profile fields, preventing unverified rejection.
3. **External Opportunity Feeds:** External listings are added and verified through admin moderation workflows rather than public web scraping.

---

## 10. License
PlaceWise is developed under the ISC License.

