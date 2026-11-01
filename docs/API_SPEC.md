# PlaceWise REST API Documentation

Base URL: `http://localhost:5005/api`

---

## 1. Authentication Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Registers a new student or placement administrator |
| `POST` | `/api/auth/login` | Public | Authenticates user credentials and returns JWT |
| `GET` | `/api/auth/me` | Bearer Token | Retrieves current session profile and completion stats |

---

## 2. Student Profile & Preferences

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/students/profile` | Student | Retrieves full verified academic background and skills |
| `PUT` | `/api/students/profile` | Student | Updates degree, branch, CGPA, backlogs, and locations |
| `GET` | `/api/students/preferences` | Student | Retrieves current active career preference mode |
| `PUT` | `/api/students/preferences` | Student | Updates preference mode (`TECHNICAL`, `NON_TECHNICAL`, `BOTH`, `OPEN_TO_ALL`) |
| `GET` | `/api/students/skills-catalog` | Student | Retrieves global directory of categorized skills |
| `POST` | `/api/students/skills` | Student | Tags a skill and proficiency to student profile |
| `DELETE` | `/api/students/skills/:skillId` | Student | Removes a skill from profile |

---

## 3. Resume Vault

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/resumes/upload` | Student | Uploads PDF/DOCX (max 5MB) into secure private storage |
| `GET` | `/api/resumes` | Student | Lists uploaded resumes and active status |
| `GET` | `/api/resumes/:id/download` | Owner / Admin | Authenticated streaming download |
| `DELETE` | `/api/resumes/:id` | Student | Permanently removes document and DB record |

---

## 4. Opportunity Discovery & CPIE

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/opportunities` | Public / Student | Lists drives with multi-facet filters, sorting, and pagination |
| `GET` | `/api/opportunities/:id` | Public / Student | Returns full role dossier with real-time student eligibility |
| `GET` | `/api/opportunities/:id/eligibility` | Student | Runs on-demand criterion-by-criterion CPIE audit |
| `GET` | `/api/opportunities/recommendations` | Student | Returns feed split into `Recommended` and `Explore Other` |
| `GET` | `/api/opportunities/skill-gaps` | Student | Computes aggregated missing desirable skills across eligible drives |

---

## 5. Application Tracking

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/applications` | Student | Retrieves student's application pipeline with audit logs |
| `POST` | `/api/applications` | Student | Creates application record with duplicate prevention |
| `PUT` | `/api/applications/:id` | Student / Admin | Stage transition (`INTERVIEW`, `SELECTED`, `WITHDRAWN`, etc.) |

---

## 6. Notifications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Authenticated | Retrieves in-app notifications and unread badge count |
| `PUT` | `/api/notifications/:id/read` | Authenticated | Marks individual notification as read |
| `PUT` | `/api/notifications/read-all` | Authenticated | Marks all user notifications as read |
| `DELETE` | `/api/notifications/:id` | Authenticated | Dismisses notification |

---

## 7. Placement Administrator Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/drives` | Placement Admin | Lists drives hosted by admin's institution |
| `POST` | `/api/admin/drives` | Placement Admin | Creates drive with criteria and mandatory/desirable skills |
| `POST` | `/api/admin/drives/:id/publish` | Placement Admin | Publishes drive and notifies institution students |
| `POST` | `/api/admin/drives/:id/cancel` | Placement Admin | Cancels drive with reason |
| `GET` | `/api/admin/drives/:id/applicants` | Placement Admin | Retrieves authorized student applicant list with resumes |
| `GET` | `/api/admin/companies` | Placement Admin | Lists recruiting partner companies |
| `POST` | `/api/admin/companies` | Placement Admin | Adds recruiting partner company |

---

## 8. Platform Administrator Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/platform/institutions` | Platform Admin | Provisions a new college/university |
| `PUT` | `/api/platform/institutions/:id` | Platform Admin | Updates institution details |
| `GET` | `/api/platform/external-opportunities` | Platform Admin | Moderation queue for external listings |
| `POST` | `/api/platform/external-opportunities/:id/verify` | Platform Admin | Verifies external listing and stamps provenance |
| `POST` | `/api/platform/external-opportunities/:id/reject` | Platform Admin | Rejects or marks external listing expired |
| `GET` | `/api/platform/audit-logs` | Platform Admin | System-wide audit log trail |
