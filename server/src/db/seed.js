import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

async function seed() {
  console.log('[SEED] Starting database seeding with realistic demonstration data...');
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Clean tables in reverse dependency order
    console.log('[SEED] Cleaning existing records...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = [
      'audit_logs', 'notifications', 'recommendations', 'application_status_history',
      'applications', 'job_skills', 'eligibility_criteria', 'drive_allowed_institutions',
      'opportunity_sources', 'placement_drives', 'job_roles', 'companies',
      'student_skills', 'skills', 'resumes', 'student_preferences', 'student_profiles',
      'users', 'institutions'
    ];
    for (const t of tables) {
      await conn.query(`TRUNCATE TABLE ${t}`);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    // 1. INSTITUTIONS
    console.log('[SEED] Seeding institutions...');
    const [instAmity] = await conn.query(`
      INSERT INTO institutions (name, university_name, code, location, institution_type, website)
      VALUES ('Amity University Kolkata', 'Amity University', 'AUK', 'Kolkata, West Bengal', 'UNIVERSITY', 'https://kolkata.amity.edu')
    `);
    const [instApex] = await conn.query(`
      INSERT INTO institutions (name, university_name, code, location, institution_type, website)
      VALUES ('Apex Institute of Engineering & Technology', 'State Technological University', 'AIET', 'Bangalore, Karnataka', 'AUTONOMOUS_INSTITUTE', 'https://apex-tech.edu.in')
    `);
    const [instMetro] = await conn.query(`
      INSERT INTO institutions (name, university_name, code, location, institution_type, website)
      VALUES ('Metro Institute of Technology', 'Metro State University', 'MIT-PUNE', 'Pune, Maharashtra', 'AFFILIATED_COLLEGE', 'https://metro-tech.edu.in')
    `);

    const aukId = instAmity.insertId;
    const aietId = instApex.insertId;
    const metroId = instMetro.insertId;

    // Default password hash for demo accounts: "Demo@1234"
    const passwordHash = await bcrypt.hash('Demo@1234', 10);

    // 2. USERS
    console.log('[SEED] Seeding users...');
    // Platform Admin
    const [platAdmin] = await conn.query(`
      INSERT INTO users (institution_id, email, password_hash, role, first_name, last_name, phone)
      VALUES (NULL, 'admin@placewise.io', ?, 'PLATFORM_ADMIN', 'Platform', 'Administrator', '+91 9876543200')
    `, [passwordHash]);

    // Placement Admins
    const [placeAdminAuk] = await conn.query(`
      INSERT INTO users (institution_id, email, password_hash, role, first_name, last_name, phone)
      VALUES (?, 'placement@auk.placewise.io', ?, 'PLACEMENT_ADMIN', 'Dr. Sourav', 'Mukherjee', '+91 9876543201')
    `, [aukId, passwordHash]);

    const [placeAdminApex] = await conn.query(`
      INSERT INTO users (institution_id, email, password_hash, role, first_name, last_name, phone)
      VALUES (?, 'placement@apex.placewise.io', ?, 'PLACEMENT_ADMIN', 'Prof. Priya', 'Nair', '+91 9876543202')
    `, [aietId, passwordHash]);

    // Students with various backgrounds and preference modes
    // S1: Rohan Sen (AUK, CSE, 8.8 CGPA, 0 backlogs, 2026 grad) -> Preference: TECHNICAL
    const [s1] = await conn.query(`
      INSERT INTO users (institution_id, email, password_hash, role, first_name, last_name, phone)
      VALUES (?, 'rohan.cse@auk.edu', ?, 'STUDENT', 'Rohan', 'Sen', '+91 9830112233')
    `, [aukId, passwordHash]);

    // S2: Ananya Roy (AUK, ECE, 7.6 CGPA, 0 backlogs, 2026 grad) -> Preference: BOTH
    const [s2] = await conn.query(`
      INSERT INTO users (institution_id, email, password_hash, role, first_name, last_name, phone)
      VALUES (?, 'ananya.ece@auk.edu', ?, 'STUDENT', 'Ananya', 'Roy', '+91 9830223344')
    `, [aukId, passwordHash]);

    // S3: Vikram Das (AUK, Mechanical, 7.1 CGPA, 1 active backlog, 2026 grad) -> Preference: NON_TECHNICAL
    const [s3] = await conn.query(`
      INSERT INTO users (institution_id, email, password_hash, role, first_name, last_name, phone)
      VALUES (?, 'vikram.me@auk.edu', ?, 'STUDENT', 'Vikram', 'Das', '+91 9830334455')
    `, [aukId, passwordHash]);

    // S4: Sneha Sharma (Apex, IT, 8.4 CGPA, 0 backlogs, 2026 grad) -> Preference: OPEN_TO_ALL
    const [s4] = await conn.query(`
      INSERT INTO users (institution_id, email, password_hash, role, first_name, last_name, phone)
      VALUES (?, 'sneha.it@apex.edu', ?, 'STUDENT', 'Sneha', 'Sharma', '+91 9830445566')
    `, [aietId, passwordHash]);

    // S5: Arpan Mukherjee (AUK, Civil, missing academic details / incomplete for testing NEEDS_VERIFICATION)
    const [s5] = await conn.query(`
      INSERT INTO users (institution_id, email, password_hash, role, first_name, last_name, phone)
      VALUES (?, 'arpan.unverified@auk.edu', ?, 'STUDENT', 'Arpan', 'Mukherjee', '+91 9830556677')
    `, [aukId, passwordHash]);

    // 3. STUDENT PROFILES
    console.log('[SEED] Seeding student profiles...');
    const [sp1] = await conn.query(`
      INSERT INTO student_profiles (user_id, student_id_code, degree, branch, graduation_year, cgpa, active_backlogs, historical_backlogs, preferred_locations, preferred_work_mode, bio)
      VALUES (?, 'AUK-2022-CSE-042', 'B.Tech', 'CSE', 2026, 8.80, 0, 0, '["Bangalore", "Kolkata", "Remote"]', 'HYBRID', 'Passionate full-stack developer with hands-on Node.js and React experience.')
    `, [s1.insertId]);

    const [sp2] = await conn.query(`
      INSERT INTO student_profiles (user_id, student_id_code, degree, branch, graduation_year, cgpa, active_backlogs, historical_backlogs, preferred_locations, preferred_work_mode, bio)
      VALUES (?, 'AUK-2022-ECE-018', 'B.Tech', 'ECE', 2026, 7.60, 0, 0, '["Bangalore", "Pune", "Kolkata"]', 'OPEN', 'ECE student interested in both embedded systems and technical analytics.')
    `, [s2.insertId]);

    const [sp3] = await conn.query(`
      INSERT INTO student_profiles (user_id, student_id_code, degree, branch, graduation_year, cgpa, active_backlogs, historical_backlogs, preferred_locations, preferred_work_mode, bio)
      VALUES (?, 'AUK-2022-ME-055', 'B.Tech', 'ME', 2026, 7.10, 1, 1, '["Kolkata", "Delhi NCR", "Mumbai"]', 'IN_OFFICE', 'Mechanical engineering student with an inclination towards operations and management consulting.')
    `, [s3.insertId]);

    const [sp4] = await conn.query(`
      INSERT INTO student_profiles (user_id, student_id_code, degree, branch, graduation_year, cgpa, active_backlogs, historical_backlogs, preferred_locations, preferred_work_mode, bio)
      VALUES (?, 'AIET-2022-IT-009', 'B.Tech', 'IT', 2026, 8.40, 0, 0, '["Bangalore", "Hyderabad"]', 'HYBRID', 'IT student exploring diverse avenues from software engineering to product management.')
    `, [s4.insertId]);

    // S5 intentionally has zero cgpa / incomplete to trigger NEEDS_VERIFICATION in tests
    const [sp5] = await conn.query(`
      INSERT INTO student_profiles (user_id, student_id_code, degree, branch, graduation_year, cgpa, active_backlogs, historical_backlogs, preferred_locations, preferred_work_mode, bio)
      VALUES (?, 'AUK-2022-CE-099', 'B.Tech', 'CE', 2026, 0.00, 0, 0, '[]', 'OPEN', 'Civil engineering student completing verification.')
    `, [s5.insertId]);

    // 4. STUDENT PREFERENCES
    console.log('[SEED] Seeding student preferences...');
    await conn.query(`INSERT INTO student_preferences (user_id, preference_mode) VALUES (?, 'TECHNICAL')`, [s1.insertId]);
    await conn.query(`INSERT INTO student_preferences (user_id, preference_mode) VALUES (?, 'BOTH')`, [s2.insertId]);
    await conn.query(`INSERT INTO student_preferences (user_id, preference_mode) VALUES (?, 'NON_TECHNICAL')`, [s3.insertId]);
    await conn.query(`INSERT INTO student_preferences (user_id, preference_mode) VALUES (?, 'OPEN_TO_ALL')`, [s4.insertId]);
    await conn.query(`INSERT INTO student_preferences (user_id, preference_mode) VALUES (?, 'OPEN_TO_ALL')`, [s5.insertId]);

    // 5. SKILLS
    console.log('[SEED] Seeding skills directory...');
    const skillList = [
      ['JavaScript', 'PROGRAMMING'],
      ['TypeScript', 'PROGRAMMING'],
      ['Python', 'PROGRAMMING'],
      ['Java', 'PROGRAMMING'],
      ['C++', 'PROGRAMMING'],
      ['React', 'FRAMEWORK'],
      ['Node.js', 'FRAMEWORK'],
      ['Django', 'FRAMEWORK'],
      ['Spring Boot', 'FRAMEWORK'],
      ['SQL', 'DATABASE'],
      ['MongoDB', 'DATABASE'],
      ['Docker', 'FRAMEWORK'],
      ['AWS', 'FRAMEWORK'],
      ['Data Structures & Algorithms', 'PROGRAMMING'],
      ['Excel & Advanced Modelling', 'BUSINESS'],
      ['Power BI', 'ANALYTICS'],
      ['Tableau', 'ANALYTICS'],
      ['Business Analysis', 'BUSINESS'],
      ['Financial Modeling', 'BUSINESS'],
      ['Project Management', 'BUSINESS'],
      ['Agile Scrum', 'BUSINESS'],
      ['Market Research', 'BUSINESS'],
      ['AutoCAD', 'CORE_ENG'],
      ['MATLAB', 'CORE_ENG'],
      ['Embedded C', 'CORE_ENG'],
      ['Digital Marketing', 'BUSINESS']
    ];

    const skillIdMap = {};
    for (const [sName, sCat] of skillList) {
      const [res] = await conn.query(`INSERT INTO skills (name, category) VALUES (?, ?)`, [sName, sCat]);
      skillIdMap[sName] = res.insertId;
    }

    // Assign skills to students
    // Rohan (CSE): JS, React, Node.js, SQL, DSA, Docker
    const rohanSkills = ['JavaScript', 'React', 'Node.js', 'SQL', 'Data Structures & Algorithms', 'Docker'];
    for (const s of rohanSkills) {
      await conn.query(`INSERT INTO student_skills (student_profile_id, skill_id, proficiency) VALUES (?, ?, 'ADVANCED')`, [sp1.insertId, skillIdMap[s]]);
    }

    // Ananya (ECE): Python, C++, Embedded C, MATLAB, SQL, Excel & Advanced Modelling
    const ananyaSkills = ['Python', 'C++', 'Embedded C', 'MATLAB', 'SQL', 'Excel & Advanced Modelling'];
    for (const s of ananyaSkills) {
      await conn.query(`INSERT INTO student_skills (student_profile_id, skill_id, proficiency) VALUES (?, ?, 'INTERMEDIATE')`, [sp2.insertId, skillIdMap[s]]);
    }

    // Vikram (ME): Excel & Advanced Modelling, Project Management, Market Research, Business Analysis
    const vikramSkills = ['Excel & Advanced Modelling', 'Project Management', 'Market Research', 'Business Analysis'];
    for (const s of vikramSkills) {
      await conn.query(`INSERT INTO student_skills (student_profile_id, skill_id, proficiency) VALUES (?, ?, 'INTERMEDIATE')`, [sp3.insertId, skillIdMap[s]]);
    }

    // Sneha (IT): Java, Python, SQL, React, Spring Boot, Power BI
    const snehaSkills = ['Java', 'Python', 'SQL', 'React', 'Spring Boot', 'Power BI'];
    for (const s of snehaSkills) {
      await conn.query(`INSERT INTO student_skills (student_profile_id, skill_id, proficiency) VALUES (?, ?, 'ADVANCED')`, [sp4.insertId, skillIdMap[s]]);
    }

    // 6. COMPANIES (Fictional Demonstration Companies)
    console.log('[SEED] Seeding fictional companies...');
    const companiesData = [
      ['Novasphere Tech Labs', 'https://novasphere-labs.demo', 'Enterprise Software & Cloud', 'Fictional enterprise SaaS provider specializing in distributed platforms.', true],
      ['Vanguard Financial Analytics', 'https://vanguard-analytics.demo', 'Financial Services', 'Fictional quantitative intelligence and risk management firm.', true],
      ['Apex Core Engineering', 'https://apex-core.demo', 'Industrial Automation & Robotics', 'Fictional mechatronics and manufacturing systems specialist.', true],
      ['QuantumScale Cloud', 'https://quantumscale.demo', 'Cloud Infrastructure & DevOps', 'Fictional high-performance cloud acceleration provider.', true],
      ['Synergy Consulting Group', 'https://synergy-consulting.demo', 'Management Consulting', 'Fictional boutique advisory and operations transformation group.', true],
      ['Nexarise Health Tech', 'https://nexarise-health.demo', 'Healthcare Intelligence', 'Fictional diagnostic software and biomedical platform builder.', true]
    ];

    const companyIdMap = {};
    for (const [cName, cWeb, cInd, cDesc, isDemo] of companiesData) {
      const [res] = await conn.query(`
        INSERT INTO companies (name, website, industry, description, is_demo_data)
        VALUES (?, ?, ?, ?, ?)
      `, [cName, cWeb, cInd, cDesc, isDemo]);
      companyIdMap[cName] = res.insertId;
    }

    // 7. JOB ROLES & DRIVES
    console.log('[SEED] Seeding job roles, drives, criteria and skills...');

    // Helper to create complete role + drive + source + criteria + skills
    async function createOpportunity(data) {
      // 1. Role
      const [roleRes] = await conn.query(`
        INSERT INTO job_roles (company_id, title, description, responsibilities, career_domain, preference_group, coding_intensity, compensation_min, compensation_max, compensation_currency)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.companyId, data.title, data.description, data.responsibilities,
        data.careerDomain, data.preferenceGroup, data.codingIntensity,
        data.compMin, data.compMax, 'INR'
      ]);
      const roleId = roleRes.insertId;

      // 2. Drive
      const [driveRes] = await conn.query(`
        INSERT INTO placement_drives (institution_id, role_id, drive_code, title, employment_type, work_mode, location, status, application_deadline, selection_rounds, required_documents, created_by_user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.institutionId || null, roleId, data.driveCode, data.driveTitle,
        data.employmentType, data.workMode, data.location, data.status || 'PUBLISHED',
        data.deadline, JSON.stringify(data.selectionRounds || ['Online Assessment', 'Technical Interview', 'HR Interview']),
        JSON.stringify(data.requiredDocs || ['Resume', 'College ID', 'Semester Grade Sheet']),
        data.createdById || null
      ]);
      const driveId = driveRes.insertId;

      // 3. Opportunity Source
      await conn.query(`
        INSERT INTO opportunity_sources (drive_id, source_type, college_scope, official_url, listing_source, verification_status, verified_by_user_id, last_verified_date, source_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        driveId, data.sourceType, data.collegeScope, data.officialUrl || null,
        data.listingSource, data.verificationStatus || 'VERIFIED',
        data.verifiedById || null, data.lastVerifiedDate || '2026-10-15',
        data.sourceNotes || 'Demonstration data record'
      ]);

      // Whitelist specific institutions if SELECTED_COLLEGES
      if (data.allowedInstitutions && data.allowedInstitutions.length > 0) {
        for (const instId of data.allowedInstitutions) {
          await conn.query(`INSERT INTO drive_allowed_institutions (drive_id, institution_id) VALUES (?, ?)`, [driveId, instId]);
        }
      }

      // 4. Criteria
      for (const crit of data.criteria) {
        await conn.query(`
          INSERT INTO eligibility_criteria (drive_id, criterion_type, operator, expected_value, is_mandatory)
          VALUES (?, ?, ?, ?, ?)
        `, [driveId, crit.type, crit.operator, crit.value, crit.mandatory ?? true]);
      }

      // 5. Skills (Mandatory vs Desirable)
      for (const sk of data.skills) {
        await conn.query(`
          INSERT INTO job_skills (role_id, skill_id, is_mandatory)
          VALUES (?, ?, ?)
        `, [roleId, skillIdMap[sk.name], sk.mandatory ?? false]);
      }

      return driveId;
    }

    // Drive 1: CAMPUS - Novasphere Graduate Software Engineer (Amity University Kolkata)
    // Preference: TECHNICAL. Min CGPA 7.5, max backlogs 0, CSE/IT, Grad 2026.
    const d1 = await createOpportunity({
      companyId: companyIdMap['Novasphere Tech Labs'],
      title: 'Graduate Software Engineer (Full Stack)',
      description: 'Build robust enterprise microservices and modern frontend architectures for global clients.',
      responsibilities: 'Design RESTful APIs, develop reactive interfaces in React, optimize database queries.',
      careerDomain: 'Full Stack Development',
      preferenceGroup: 'TECHNICAL',
      codingIntensity: 'HIGH',
      compMin: 900000, compMax: 1200000,
      institutionId: aukId,
      driveCode: 'AUK-2026-NOVA-FSD',
      driveTitle: 'Novasphere Campus Recruitment Drive 2026',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      location: 'Kolkata, West Bengal',
      deadline: '2026-11-20 23:59:59',
      sourceType: 'CAMPUS',
      collegeScope: 'COLLEGE_RESTRICTED',
      listingSource: 'Amity Placement Cell',
      verificationStatus: 'VERIFIED',
      createdById: placeAdminAuk.insertId,
      criteria: [
        { type: 'MIN_CGPA', operator: 'GTE', value: '7.50' },
        { type: 'MAX_ACTIVE_BACKLOGS', operator: 'LTE', value: '0' },
        { type: 'ALLOWED_BRANCHES', operator: 'IN', value: '["CSE","IT"]' },
        { type: 'GRADUATION_YEAR', operator: 'EQ', value: '2026' }
      ],
      skills: [
        { name: 'JavaScript', mandatory: true },
        { name: 'React', mandatory: false },
        { name: 'Node.js', mandatory: true },
        { name: 'SQL', mandatory: false },
        { name: 'Docker', mandatory: false } // Desirable skill for skill-gap
      ]
    });

    // Drive 2: CAMPUS - Synergy Management Trainee (Amity University Kolkata)
    // Preference: NON_TECHNICAL. Open to all branches! Min CGPA 6.5, max backlogs 1.
    const d2 = await createOpportunity({
      companyId: companyIdMap['Synergy Consulting Group'],
      title: 'Management Associate - Business Operations',
      description: 'Streamline client operational workflows, prepare client deliverables, and conduct market analysis.',
      responsibilities: 'Collaborate with cross-functional leadership, synthesize KPIs, lead client workshops.',
      careerDomain: 'Management Trainee',
      preferenceGroup: 'NON_TECHNICAL',
      codingIntensity: 'NONE',
      compMin: 700000, compMax: 900000,
      institutionId: aukId,
      driveCode: 'AUK-2026-SYN-MGMT',
      driveTitle: 'Synergy Consulting On-Campus Operations Hiring',
      employmentType: 'FULL_TIME',
      workMode: 'IN_OFFICE',
      location: 'Kolkata, West Bengal',
      deadline: '2026-11-25 18:00:00',
      sourceType: 'CAMPUS',
      collegeScope: 'COLLEGE_RESTRICTED',
      listingSource: 'Amity Placement Cell',
      verificationStatus: 'VERIFIED',
      createdById: placeAdminAuk.insertId,
      criteria: [
        { type: 'MIN_CGPA', operator: 'GTE', value: '6.50' },
        { type: 'MAX_ACTIVE_BACKLOGS', operator: 'LTE', value: '1' },
        { type: 'ALLOWED_BRANCHES', operator: 'IN', value: '["CSE","IT","ECE","EE","ME","CE"]' },
        { type: 'GRADUATION_YEAR', operator: 'EQ', value: '2026' }
      ],
      skills: [
        { name: 'Excel & Advanced Modelling', mandatory: true },
        { name: 'Business Analysis', mandatory: false },
        { name: 'Project Management', mandatory: false },
        { name: 'Power BI', mandatory: false } // Desirable skill for skill-gap
      ]
    });

    // Drive 3: CAMPUS - Apex Core Mechatronics & Systems Engineer (Amity University Kolkata)
    // Preference: TECHNICAL. Core Engineering role. ECE, EE, ME. Min CGPA 7.0.
    const d3 = await createOpportunity({
      companyId: companyIdMap['Apex Core Engineering'],
      title: 'Embedded Systems & Automation Engineer',
      description: 'Develop low-level firmware and interface industrial automation actuators with PLC systems.',
      responsibilities: 'Hardware-in-the-loop validation, micro-controller firmware programming in C.',
      careerDomain: 'Embedded Systems',
      preferenceGroup: 'TECHNICAL',
      codingIntensity: 'MEDIUM',
      compMin: 800000, compMax: 1050000,
      institutionId: aukId,
      driveCode: 'AUK-2026-APEX-EMB',
      driveTitle: 'Apex Core Campus Engineering Drive',
      employmentType: 'FULL_TIME',
      workMode: 'IN_OFFICE',
      location: 'Bangalore, Karnataka',
      deadline: '2026-12-05 23:59:59',
      sourceType: 'CAMPUS',
      collegeScope: 'COLLEGE_RESTRICTED',
      listingSource: 'Amity Placement Cell',
      verificationStatus: 'VERIFIED',
      createdById: placeAdminAuk.insertId,
      criteria: [
        { type: 'MIN_CGPA', operator: 'GTE', value: '7.00' },
        { type: 'MAX_ACTIVE_BACKLOGS', operator: 'LTE', value: '0' },
        { type: 'ALLOWED_BRANCHES', operator: 'IN', value: '["ECE","EE","ME"]' },
        { type: 'GRADUATION_YEAR', operator: 'EQ', value: '2026' }
      ],
      skills: [
        { name: 'Embedded C', mandatory: true },
        { name: 'C++', mandatory: false },
        { name: 'MATLAB', mandatory: false },
        { name: 'Python', mandatory: false } // Desirable skill
      ]
    });

    // Drive 4: EXTERNAL - Vanguard Quantitative Analyst (OPEN_TO_ALL_COLLEGES, VERIFIED)
    // Technology-Adjacent. PreferenceGroup: NON_TECHNICAL (Business & Quantitative).
    const d4 = await createOpportunity({
      companyId: companyIdMap['Vanguard Financial Analytics'],
      title: 'Quantitative Research Analyst',
      description: 'Perform predictive risk modeling, portfolio optimization and backtesting on algorithmic trading signals.',
      responsibilities: 'Translate economic hypotheses into statistical models, build financial dashboards.',
      careerDomain: 'Data Analyst',
      preferenceGroup: 'NON_TECHNICAL',
      codingIntensity: 'MEDIUM',
      compMin: 1100000, compMax: 1500000,
      institutionId: null, // External
      driveCode: 'EXT-2026-VANG-QUANT',
      driveTitle: 'Vanguard National Off-Campus Quantitative Fellowship',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      location: 'Mumbai, Maharashtra',
      deadline: '2026-12-15 23:59:59',
      sourceType: 'EXTERNAL',
      collegeScope: 'OPEN_TO_ALL_COLLEGES',
      officialUrl: 'https://vanguard-analytics.demo/careers/quant-analyst-2026',
      listingSource: 'Company Careers Portal',
      verificationStatus: 'VERIFIED',
      verifiedById: platAdmin.insertId,
      criteria: [
        { type: 'MIN_CGPA', operator: 'GTE', value: '7.50' },
        { type: 'MAX_ACTIVE_BACKLOGS', operator: 'LTE', value: '0' },
        { type: 'GRADUATION_YEAR', operator: 'EQ', value: '2026' }
      ],
      skills: [
        { name: 'Python', mandatory: true },
        { name: 'SQL', mandatory: true },
        { name: 'Financial Modeling', mandatory: false },
        { name: 'Power BI', mandatory: false }, // Desirable skill for skill-gap
        { name: 'Tableau', mandatory: false }
      ]
    });

    // Drive 5: EXTERNAL - QuantumScale Cloud Operations Associate (SELECTED_COLLEGES: Amity + Apex, VERIFIED)
    // Preference: TECHNICAL.
    const d5 = await createOpportunity({
      companyId: companyIdMap['QuantumScale Cloud'],
      title: 'Cloud & Infrastructure Engineer (DevOps)',
      description: 'Automate multi-region AWS and Kubernetes clusters, implement CI/CD observability pipelines.',
      responsibilities: 'Maintain infrastructure-as-code scripts, monitor system latency and resilience.',
      careerDomain: 'Cloud Engineering',
      preferenceGroup: 'TECHNICAL',
      codingIntensity: 'HIGH',
      compMin: 1000000, compMax: 1400000,
      institutionId: null,
      driveCode: 'EXT-2026-QS-CLOUD',
      driveTitle: 'QuantumScale Regional Campus Trainee Initiative',
      employmentType: 'FULL_TIME',
      workMode: 'REMOTE',
      location: 'Bangalore, Karnataka',
      deadline: '2026-11-30 23:59:59',
      sourceType: 'EXTERNAL',
      collegeScope: 'SELECTED_COLLEGES',
      allowedInstitutions: [aukId, aietId],
      officialUrl: 'https://quantumscale.demo/early-careers/cloud-trainee',
      listingSource: 'Authorized University Network',
      verificationStatus: 'VERIFIED',
      verifiedById: platAdmin.insertId,
      criteria: [
        { type: 'MIN_CGPA', operator: 'GTE', value: '7.00' },
        { type: 'MAX_ACTIVE_BACKLOGS', operator: 'LTE', value: '0' },
        { type: 'ALLOWED_BRANCHES', operator: 'IN', value: '["CSE","IT","ECE"]' },
        { type: 'GRADUATION_YEAR', operator: 'EQ', value: '2026' }
      ],
      skills: [
        { name: 'Python', mandatory: true },
        { name: 'Docker', mandatory: true },
        { name: 'AWS', mandatory: false }, // Desirable skill for skill-gap
        { name: 'SQL', mandatory: false }
      ]
    });

    // Drive 6: EXTERNAL - Nexarise Health Tech Frontend Intern (PENDING_VERIFICATION, for Moderation test)
    const d6 = await createOpportunity({
      companyId: companyIdMap['Nexarise Health Tech'],
      title: 'Frontend Engineering Intern',
      description: 'Assist in building patient management dashboards using React and TypeScript.',
      responsibilities: 'Translate Figma UI designs to clean React components.',
      careerDomain: 'Software Development',
      preferenceGroup: 'TECHNICAL',
      codingIntensity: 'HIGH',
      compMin: 35000, compMax: 50000, // Monthly stipend
      institutionId: null,
      driveCode: 'EXT-2026-NEX-INTERN',
      driveTitle: 'Nexarise Spring 2026 Engineering Internship',
      employmentType: 'INTERNSHIP',
      workMode: 'REMOTE',
      location: 'Remote',
      deadline: '2026-11-18 23:59:59',
      sourceType: 'EXTERNAL',
      collegeScope: 'OPEN_TO_ALL_COLLEGES',
      officialUrl: 'https://nexarise-health.demo/internships/frontend',
      listingSource: 'Student Community Submission',
      verificationStatus: 'PENDING_VERIFICATION',
      criteria: [
        { type: 'MIN_CGPA', operator: 'GTE', value: '6.50' },
        { type: 'GRADUATION_YEAR', operator: 'EQ', value: '2026' }
      ],
      skills: [
        { name: 'React', mandatory: true },
        { name: 'JavaScript', mandatory: true },
        { name: 'TypeScript', mandatory: false }
      ]
    });

    // Drive 7: EXTERNAL - Apex Core College-Restricted to AIET only (to test college restriction)
    const d7 = await createOpportunity({
      companyId: companyIdMap['Apex Core Engineering'],
      title: 'Robotics Software Trainee',
      description: 'Autonomous rover testing and algorithm validation.',
      responsibilities: 'Sensor calibration and ROS integration.',
      careerDomain: 'AI and Machine Learning',
      preferenceGroup: 'TECHNICAL',
      codingIntensity: 'HIGH',
      compMin: 950000, compMax: 1200000,
      institutionId: null,
      driveCode: 'EXT-2026-APEX-ROBOTICS',
      driveTitle: 'Apex Core AIET-Exclusive Trainee Program',
      employmentType: 'FULL_TIME',
      workMode: 'IN_OFFICE',
      location: 'Bangalore, Karnataka',
      deadline: '2026-12-10 23:59:59',
      sourceType: 'EXTERNAL',
      collegeScope: 'COLLEGE_RESTRICTED',
      allowedInstitutions: [aietId], // AIET only! AUK students must be NOT_ELIGIBLE
      officialUrl: 'https://apex-core.demo/careers/robotics-aiet',
      listingSource: 'Institutional Partnership',
      verificationStatus: 'VERIFIED',
      verifiedById: platAdmin.insertId,
      criteria: [
        { type: 'MIN_CGPA', operator: 'GTE', value: '7.50' },
        { type: 'GRADUATION_YEAR', operator: 'EQ', value: '2026' }
      ],
      skills: [
        { name: 'Python', mandatory: true },
        { name: 'C++', mandatory: true },
        { name: 'Docker', mandatory: false }
      ]
    });

    // 8. APPLICATIONS & APPLICATION STATUS HISTORY
    console.log('[SEED] Seeding applications and history...');
    // Rohan applied to Novasphere and QuantumScale
    const [app1] = await conn.query(`
      INSERT INTO applications (student_id, drive_id, status, notes)
      VALUES (?, ?, 'ASSESSMENT', 'Cleared initial resume screening. Online Assessment link sent.')
    `, [s1.insertId, d1]);

    await conn.query(`
      INSERT INTO application_status_history (application_id, old_status, new_status, changed_by_user_id, reason)
      VALUES (?, NULL, 'APPLIED', ?, 'Initial application submitted by student.')
    `, [app1.insertId, s1.insertId]);

    await conn.query(`
      INSERT INTO application_status_history (application_id, old_status, new_status, changed_by_user_id, reason)
      VALUES (?, 'APPLIED', 'ASSESSMENT', ?, 'Shortlisted for online coding round by placement admin.')
    `, [app1.insertId, placeAdminAuk.insertId]);

    const [app2] = await conn.query(`
      INSERT INTO applications (student_id, drive_id, status, notes)
      VALUES (?, ?, 'INTERESTED', 'Bookmarked for direct application on company portal.')
    `, [s1.insertId, d5]);

    await conn.query(`
      INSERT INTO application_status_history (application_id, old_status, new_status, changed_by_user_id, reason)
      VALUES (?, NULL, 'INTERESTED', ?, 'Marked as interested in application tracker.')
    `, [app2.insertId, s1.insertId]);

    // Vikram applied to Synergy Management Trainee
    const [app3] = await conn.query(`
      INSERT INTO applications (student_id, drive_id, status, notes)
      VALUES (?, ?, 'INTERVIEW', 'Selected for first round panel interview with client partners.')
    `, [s3.insertId, d2]);

    await conn.query(`
      INSERT INTO application_status_history (application_id, old_status, new_status, changed_by_user_id, reason)
      VALUES (?, NULL, 'APPLIED', ?, 'Application submitted.')
    `, [app3.insertId, s3.insertId]);

    await conn.query(`
      INSERT INTO application_status_history (application_id, old_status, new_status, changed_by_user_id, reason)
      VALUES (?, 'APPLIED', 'ASSESSMENT', ?, 'Cleared case study screening.')
    `, [app3.insertId, placeAdminAuk.insertId]);

    await conn.query(`
      INSERT INTO application_status_history (application_id, old_status, new_status, changed_by_user_id, reason)
      VALUES (?, 'ASSESSMENT', 'INTERVIEW', ?, 'Invited to Round 1 Interview.')
    `, [app3.insertId, placeAdminAuk.insertId]);

    // 9. NOTIFICATIONS
    console.log('[SEED] Seeding real in-app notifications...');
    const notifs = [
      [s1.insertId, 'Campus Drive Announced: Novasphere Tech Labs', 'Novasphere Tech Labs has published its campus drive for B.Tech CSE/IT 2026. Application deadline is Nov 20.', 'CAMPUS_DRIVE', 'placement_drives', d1],
      [s1.insertId, 'Matching External Listing: QuantumScale Cloud', 'A verified external opportunity for Cloud & Infrastructure Engineer matching your profile has been listed.', 'OPPORTUNITY_MATCH', 'placement_drives', d5],
      [s1.insertId, 'Application Update: Assessment Shortlist', 'You have been shortlisted for the Online Coding Round of Novasphere Graduate Software Engineer.', 'APPLICATION_UPDATE', 'applications', app1.insertId],
      [s2.insertId, 'New Core Engineering Drive: Apex Core', 'Apex Core Engineering is visiting for Embedded Systems & Automation roles. Eligible branches: ECE, EE, ME.', 'CAMPUS_DRIVE', 'placement_drives', d3],
      [s3.insertId, 'Interview Scheduled: Synergy Consulting', 'Congratulations! Your Round 1 Case Interview has been scheduled. Check your email for venue details.', 'APPLICATION_UPDATE', 'applications', app3.insertId]
    ];

    for (const [uid, title, msg, type, relType, relId] of notifs) {
      await conn.query(`
        INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [uid, title, msg, type, relType, relId]);
    }

    // 10. AUDIT LOGS
    console.log('[SEED] Seeding audit records...');
    await conn.query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details_json)
      VALUES (?, 'DRIVE_PUBLISH', 'placement_drives', ?, '{"title": "Novasphere Campus Recruitment Drive 2026", "status": "PUBLISHED"}')
    `, [placeAdminAuk.insertId, d1]);

    await conn.query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details_json)
      VALUES (?, 'EXTERNAL_LISTING_VERIFY', 'opportunity_sources', ?, '{"status": "VERIFIED", "verified_by": "admin@placewise.io"}')
    `, [platAdmin.insertId, d4]);

    await conn.commit();
    console.log('[SEED] Database seeding completed successfully!');
    console.log('--- DEMO ACCOUNTS CREATED ---');
    console.log('1. Platform Admin:  admin@placewise.io        | Password: Demo@1234');
    console.log('2. Placement Admin: placement@auk.placewise.io  | Password: Demo@1234 (Amity Kolkata)');
    console.log('3. Student 1 (Tech): rohan.cse@auk.edu          | Password: Demo@1234 (B.Tech CSE, 8.8 CGPA)');
    console.log('4. Student 2 (Both): ananya.ece@auk.edu         | Password: Demo@1234 (B.Tech ECE, 7.6 CGPA)');
    console.log('5. Student 3 (Non):  vikram.me@auk.edu          | Password: Demo@1234 (B.Tech ME, 7.1 CGPA)');
    console.log('6. Student 4 (Open): sneha.it@apex.edu          | Password: Demo@1234 (Apex Institute, IT)');
    console.log('7. Student 5 (Unv):  arpan.unverified@auk.edu   | Password: Demo@1234 (Unverified / Incomplete)');
  } catch (err) {
    await conn.rollback();
    console.error('[SEED] Seeding failed:', err);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

seed();

