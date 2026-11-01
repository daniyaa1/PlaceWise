-- PlaceWise Normalized Relational Schema
-- Supports Multi-College, Multi-Domain Career Intelligence Architecture

-- 1. INSTITUTIONS
CREATE TABLE IF NOT EXISTS institutions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  university_name VARCHAR(255) NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  location VARCHAR(255) NOT NULL,
  institution_type ENUM('UNIVERSITY', 'AFFILIATED_COLLEGE', 'AUTONOMOUS_INSTITUTE') DEFAULT 'AUTONOMOUS_INSTITUTE',
  website VARCHAR(255) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  institution_id INT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('STUDENT', 'PLACEMENT_ADMIN', 'PLATFORM_ADMIN') NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. STUDENT PROFILES
CREATE TABLE IF NOT EXISTS student_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  student_id_code VARCHAR(100) NOT NULL,
  degree VARCHAR(100) NOT NULL DEFAULT 'B.Tech',
  branch VARCHAR(100) NOT NULL, -- e.g. CSE, IT, ECE, EE, ME, CE
  graduation_year INT NOT NULL,
  cgpa DECIMAL(4, 2) NOT NULL,
  active_backlogs INT NOT NULL DEFAULT 0,
  historical_backlogs INT NOT NULL DEFAULT 0,
  preferred_locations JSON NULL, -- e.g. ["Bangalore", "Kolkata", "Remote"]
  preferred_work_mode ENUM('IN_OFFICE', 'HYBRID', 'REMOTE', 'OPEN') DEFAULT 'OPEN',
  bio TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. STUDENT PREFERENCES (4 Modes Required by Spec)
CREATE TABLE IF NOT EXISTS student_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  preference_mode ENUM('TECHNICAL', 'NON_TECHNICAL', 'BOTH', 'OPEN_TO_ALL') NOT NULL DEFAULT 'OPEN_TO_ALL',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. RESUMES
CREATE TABLE IF NOT EXISTS resumes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  parsed_data JSON NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. SKILLS
CREATE TABLE IF NOT EXISTS skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category ENUM('PROGRAMMING', 'FRAMEWORK', 'DATABASE', 'BUSINESS', 'CORE_ENG', 'ANALYTICS', 'SOFT_SKILL') NOT NULL
) ENGINE=InnoDB;

-- 7. STUDENT SKILLS
CREATE TABLE IF NOT EXISTS student_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_profile_id INT NOT NULL,
  skill_id INT NOT NULL,
  proficiency ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'INTERMEDIATE',
  UNIQUE KEY unique_student_skill (student_profile_id, skill_id),
  FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. COMPANIES
CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  website VARCHAR(255) NULL,
  industry VARCHAR(150) NOT NULL,
  description TEXT NULL,
  is_demo_data BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 9. JOB ROLES
CREATE TABLE IF NOT EXISTS job_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  responsibilities TEXT NULL,
  career_domain VARCHAR(100) NOT NULL, -- e.g. Software Development, Data Analyst, Management Trainee
  preference_group ENUM('TECHNICAL', 'NON_TECHNICAL') NOT NULL,
  coding_intensity ENUM('HIGH', 'MEDIUM', 'LOW', 'NONE') DEFAULT 'MEDIUM',
  compensation_min INT NULL,
  compensation_max INT NULL,
  compensation_currency VARCHAR(10) DEFAULT 'INR',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. PLACEMENT DRIVES / OPPORTUNITIES
CREATE TABLE IF NOT EXISTS placement_drives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  institution_id INT NULL, -- NULL indicates external opportunity or platform-wide
  role_id INT NOT NULL,
  drive_code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  employment_type ENUM('FULL_TIME', 'INTERNSHIP', 'PPO') NOT NULL DEFAULT 'FULL_TIME',
  work_mode ENUM('IN_OFFICE', 'HYBRID', 'REMOTE') NOT NULL DEFAULT 'IN_OFFICE',
  location VARCHAR(255) NOT NULL,
  status ENUM('DRAFT', 'PUBLISHED', 'CANCELLED', 'ARCHIVED', 'EXPIRED') DEFAULT 'PUBLISHED',
  application_deadline DATETIME NOT NULL,
  selection_rounds JSON NULL, -- e.g. ["Online Assessment", "Technical Interview", "HR Round"]
  required_documents JSON NULL, -- e.g. ["Resume", "Grade Cards", "Govt ID"]
  created_by_user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES job_roles(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 11. OPPORTUNITY SOURCES (Campus vs External)
CREATE TABLE IF NOT EXISTS opportunity_sources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  drive_id INT NOT NULL UNIQUE,
  source_type ENUM('CAMPUS', 'EXTERNAL') NOT NULL,
  college_scope ENUM('OPEN_TO_ALL_COLLEGES', 'SELECTED_COLLEGES', 'COLLEGE_RESTRICTED', 'NOT_SPECIFIED') NOT NULL DEFAULT 'NOT_SPECIFIED',
  official_url VARCHAR(500) NULL,
  listing_source VARCHAR(150) NULL, -- e.g. "Campus Placement Cell", "Company Careers Portal"
  verification_status ENUM('VERIFIED', 'PENDING_VERIFICATION', 'UNVERIFIED', 'EXPIRED') NOT NULL DEFAULT 'VERIFIED',
  verified_by_user_id INT NULL,
  last_verified_date DATE NULL,
  source_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 12. DRIVE ALLOWED INSTITUTIONS (For external with SELECTED_COLLEGES)
CREATE TABLE IF NOT EXISTS drive_allowed_institutions (
  drive_id INT NOT NULL,
  institution_id INT NOT NULL,
  PRIMARY KEY (drive_id, institution_id),
  FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE,
  FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. ELIGIBILITY CRITERIA (Mandatory Criteria Engine)
CREATE TABLE IF NOT EXISTS eligibility_criteria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  drive_id INT NOT NULL,
  criterion_type ENUM('MIN_CGPA', 'MAX_ACTIVE_BACKLOGS', 'MAX_HISTORICAL_BACKLOGS', 'ALLOWED_BRANCHES', 'ALLOWED_DEGREES', 'GRADUATION_YEAR') NOT NULL,
  operator ENUM('GTE', 'LTE', 'EQ', 'IN') NOT NULL,
  expected_value VARCHAR(255) NOT NULL, -- e.g. "7.5", "0", "[\"CSE\",\"IT\"]", "2026"
  is_mandatory BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. JOB SKILLS (Mandatory vs Desirable distinction)
CREATE TABLE IF NOT EXISTS job_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  skill_id INT NOT NULL,
  is_mandatory BOOLEAN DEFAULT FALSE,
  UNIQUE KEY unique_role_skill (role_id, skill_id),
  FOREIGN KEY (role_id) REFERENCES job_roles(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 15. APPLICATIONS
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL, -- refers to users.id (role STUDENT)
  drive_id INT NOT NULL,
  status ENUM('INTERESTED', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN') NOT NULL DEFAULT 'APPLIED',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT NULL,
  UNIQUE KEY unique_student_drive_app (student_id, drive_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 16. APPLICATION STATUS HISTORY
CREATE TABLE IF NOT EXISTS application_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  old_status VARCHAR(50) NULL,
  new_status VARCHAR(50) NOT NULL,
  changed_by_user_id INT NULL,
  reason VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 17. RECOMMENDATIONS (Cached calculation snapshot)
CREATE TABLE IF NOT EXISTS recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  drive_id INT NOT NULL,
  score DECIMAL(5, 2) NOT NULL,
  preference_score DECIMAL(5, 2) NOT NULL,
  skill_score DECIMAL(5, 2) NOT NULL,
  work_mode_score DECIMAL(5, 2) NOT NULL,
  location_score DECIMAL(5, 2) NOT NULL,
  explanation TEXT NOT NULL,
  computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_drive_rec (user_id, drive_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 18. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('OPPORTUNITY_MATCH', 'CAMPUS_DRIVE', 'EXTERNAL_LISTING', 'DEADLINE_ALERT', 'APPLICATION_UPDATE', 'SYSTEM') NOT NULL,
  related_entity_type VARCHAR(50) NULL,
  related_entity_id INT NULL,
  read_at TIMESTAMP NULL,
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 19. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INT NULL,
  details_json JSON NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
