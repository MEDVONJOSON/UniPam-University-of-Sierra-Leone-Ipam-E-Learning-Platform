const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DB_FILE = path.join(__dirname, "db_mock.json");

// Default initial state for UniPam
function getInitialState() {
  const adminPasswordHash = bcrypt.hashSync("adminpassword123", 10);
  const lecturerPasswordHash = bcrypt.hashSync("lecturer123", 10);

  const providers = [
    { id: "1", name: "Coursera", slug: "coursera", is_active: true },
    { id: "2", name: "IBM SkillsBuild", slug: "ibm-skillsbuild", is_active: true },
    { id: "3", name: "Udemy", slug: "udemy", is_active: true },
    { id: "4", name: "UniAthena", slug: "uniathena", is_active: true },
    { id: "5", name: "UniPam", slug: "unipam", is_active: true }
  ];

  const courses = [
    {
      id: "c1",
      provider_id: "1",
      external_id: "COURSE-001",
      title: "Web Development Fundamentals",
      category: "Software Development",
      skill_level: "Beginner",
      duration_label: "12h",
      has_certificate: true,
      cost_type: "free",
      external_url: "https://www.coursera.org/",
      description: "Build practical web skills from HTML/CSS fundamentals to real React applications.",
      is_internal: false,
      is_active: true,
      thumbnail_url: null,
      created_at: new Date().toISOString()
    },
    {
      id: "c2",
      provider_id: "2",
      external_id: "COURSE-002",
      title: "AI and Data Essentials",
      category: "AI and Data",
      skill_level: "Intermediate",
      duration_label: "18h",
      has_certificate: true,
      cost_type: "free",
      external_url: "https://skillsbuild.org/",
      description: "Learn practical AI workflows, generative model basics, and core data structures.",
      is_internal: false,
      is_active: true,
      thumbnail_url: null,
      created_at: new Date().toISOString()
    },
    {
      id: "c3",
      provider_id: "3",
      external_id: "COURSE-003",
      title: "Cybersecurity Foundations",
      category: "Cybersecurity",
      skill_level: "Beginner",
      duration_label: "14h",
      has_certificate: true,
      cost_type: "paid",
      external_url: "https://www.uniathena.com/",
      description: "Understand core security threats, risk controls, and professional security operations.",
      is_internal: false,
      is_active: true,
      thumbnail_url: null,
      created_at: new Date().toISOString()
    },
    {
      id: "c4",
      provider_id: "4",
      external_id: "COURSE-004",
      title: "Modern React for Product Teams",
      category: "Software Development",
      skill_level: "Intermediate",
      duration_label: "16h",
      has_certificate: true,
      cost_type: "paid",
      external_url: "https://www.udemy.com/",
      description: "Build highly scalable, type-safe React applications using custom hook state-management.",
      is_internal: false,
      is_active: true,
      thumbnail_url: null,
      created_at: new Date().toISOString()
    },
    {
      id: "c5",
      provider_id: "5",
      external_id: "COURSE-005",
      title: "Digital Entrepreneurship Sprint",
      category: "Entrepreneurship",
      skill_level: "Beginner",
      duration_label: "10h",
      has_certificate: true,
      cost_type: "free",
      external_url: "https://unipam.edu.sl/",
      description: "Launch and validate digital products across emerging markets with lean startup execution methods.",
      is_internal: true,
      is_active: true,
      thumbnail_url: null,
      created_at: new Date().toISOString()
    }
  ];

  const users = [
    {
      id: "admin-uuid",
      email: "admin@usl.edu.sl",
      password_hash: adminPasswordHash,
      role: "admin",
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: "lecturer-uuid",
      email: "lecturer@usl.edu.sl",
      password_hash: lecturerPasswordHash,
      role: "lecturer",
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

  const profiles = [
    {
      user_id: "admin-uuid",
      full_name: "USL Registry Admin",
      phone_number: "+232 76 123456",
      country_code: "SL",
      preferred_language: "English",
      education_background: "Masters in Management",
      skills_interests: '["LMS Management", "Curriculum Design"]',
      learning_goals: "Optimize academic processes across USL campuses",
      designation: "Academic Registry Director",
      institution_name: "University of Sierra Leone",
      faculty: "Faculty of Pure & Applied Sciences",
      department: "Department of Computer Science",
      enrollment_year: "2024",
      academic_standing: "Excellent",
      created_at: new Date().toISOString()
    },
    {
      user_id: "lecturer-uuid",
      full_name: "Dr. Ernest Udeh, Ph.D.",
      phone_number: "+232 76 654321",
      country_code: "SL",
      preferred_language: "English",
      education_background: "Ph.D. in Information Systems",
      skills_interests: '["Database Systems", "Cloud Computing", "Software Engineering"]',
      learning_goals: "Advance research in distributed database systems",
      designation: "Senior Lecturer & Module Coordinator",
      institution_name: "University of Sierra Leone",
      faculty: "Faculty of Information Systems & Technology",
      department: "Department of Information Systems",
      enrollment_year: "2019",
      academic_standing: "Excellent",
      created_at: new Date().toISOString()
    }
  ];

  const ipam_faculties = [
    { id: "f1", name: "Accounting & Finance", slug: "accounting-finance", description: "Financial Accounting, Auditing, Taxation, Banking, Investment, Financial Services & Financial Economics.", programme_count: 8, dean: "Dr James Kollie" },
    { id: "f2", name: "Information Systems & Technology", slug: "info-systems-tech", description: "Database Systems, Software Engineering, Networks, Cybersecurity, Web/Mobile Development & Data Analytics.", programme_count: 3 },
    { id: "f3", name: "Business Administration & Entrepreneurship", slug: "business-admin-entrepreneurship", description: "Business Management, Entrepreneurship, Innovation, Human Resources, Procurement, Logistics, Marketing & Projects.", programme_count: 13, dean: "Dr Ernest Udeh" },
    { id: "f4", name: "Leadership & Governance", slug: "leadership-governance", description: "Public Sector Leadership, Policy Studies, Public Administration, Development Management & Governance.", programme_count: 7 },
    { id: "f5", name: "Extra-Mural Studies", slug: "extra-mural-studies", description: "Professional diploma and certificate education extending learning into provincial and local communities across Sierra Leone.", programme_count: 8 }
  ];

  const ipam_departments = [
    { id: "d1", faculty_id: "f1", name: "Department of Accountancy" },
    { id: "d2", faculty_id: "f1", name: "Department of Financial Services" },
    { id: "d3", faculty_id: "f1", name: "Department of Banking and Finance" },
    { id: "d4", faculty_id: "f2", name: "Department of Information Systems" },
    { id: "d5", faculty_id: "f2", name: "Department of Information Technology" },
    { id: "d6", faculty_id: "f3", name: "Business Administration", hod: "Joshua Wright" },
    { id: "d7", faculty_id: "f3", name: "Marketing and Sales" },
    { id: "d8", faculty_id: "f3", name: "Procurement, Logistics & Supply Chain" },
    { id: "d9", faculty_id: "f4", name: "Department of Public Administration" },
    { id: "d10", faculty_id: "f5", name: "Extra-Mural Studies Department" }
  ];

  const ipam_programmes = [
    // ── Faculty of Accounting & Finance (8) ──
    { id: "p1", faculty_id: "f1", department_id: "d2", name: "BSc (Hons) Financial Economics", level: "Degree", duration: "4 years", mode: "In person", status: "Active", description: "Combines economics and finance, developing analytical and quantitative skills for analysing financial markets, economic policy and financial decisions.", career_areas: ["Financial economist", "Economic analyst", "Investment/portfolio analyst", "Risk-management specialist", "Banking and finance officer", "Policy analyst", "Economic consultant", "Financial-planning/advisory roles"], entry_requirements: "Five GCE O-Level/WASSCE credits, including C6 or better in English, C5 or better in Mathematics, C5 or better in Cost Accounting, Financial Accounting or Economics. Not more than two sittings." },
    { id: "p2", faculty_id: "f1", department_id: "d1", name: "BSc Applied Accounting", level: "Degree", duration: "4 years", mode: "In person", status: "Active", description: "A practical accounting degree covering financial reporting, management accounting, audit, and tax applications in real-world business contexts.", career_areas: ["Accountant", "Audit trainee", "Financial controller", "Bookkeeper", "Tax associate"] },
    { id: "p3", faculty_id: "f1", department_id: "d1", name: "BSc Auditing, Taxation and Internal Controls", level: "Degree", duration: "4 years", mode: "In person", status: "Active", description: "Specialized training in auditing, taxation, internal controls, financial integrity and regulatory compliance.", career_areas: ["Internal/external auditor", "Tax officer/consultant", "Internal-control officer", "Compliance officer", "Risk-management officer", "Accounts/audit officer", "Public-sector financial inspector"], entry_requirements: "Five O-Level/WASSCE credits, including C6 English, C5 Mathematics and C5 in Cost Accounting, Financial Accounting or Economics, within two sittings." },
    { id: "p4", faculty_id: "f1", department_id: "d3", name: "BSc Banking and Finance", level: "Degree", duration: "4 years", mode: "In person", status: "Active", description: "Comprehensive education in banking operations, financial management, financial institutions and global/local financial markets.", career_areas: ["Banking officer", "Credit analyst", "Financial analyst", "Investment/portfolio assistant", "Risk officer", "Insurance officer", "Treasury/financial-services officer", "Central-bank/regulatory roles"], entry_requirements: "Five credits, including C6 English and Mathematics plus C6 in Cost Accounting, Financial Accounting or Economics, within two sittings." },
    { id: "p5", faculty_id: "f1", department_id: "d2", name: "BSc Financial Services", level: "Degree", duration: "4 years", mode: "In person", status: "Active", description: "Covers financial services industry operations, investment products, client advisory, and regulatory frameworks.", career_areas: ["Financial services officer", "Investment adviser", "Insurance broker", "Client relationship manager", "Regulatory compliance officer"], entry_requirements: "Five O-Level/WASSCE credits, with C6 or better in English and Mathematics plus C6 or better in Cost Accounting, Financial Accounting or Economics, within two sittings." },
    { id: "p6", faculty_id: "f1", department_id: "d3", name: "Executive Masters in Banking and Finance", level: "Postgraduate", duration: "2 years", mode: "In person", status: "Active", description: "An advanced executive programme for professionals seeking senior leadership in banking and financial services, covering strategy, risk, and financial innovation.", career_areas: ["Senior banking officer", "Branch manager", "Treasury manager", "Risk director", "Financial institution executive"] },
    { id: "p7", faculty_id: "f1", department_id: "d2", name: "Master in Financial Economics", level: "Postgraduate", duration: "2 years", mode: "In person", status: "Active", description: "Advanced finance/economics analysis, financial-market analysis, economic-policy evaluation and data-driven financial decision-making.", career_areas: ["Financial economist", "Economic policy analyst", "Research analyst", "Central bank officer", "Investment strategist"] },
    { id: "p8", faculty_id: "f1", department_id: "d1", name: "Masters of Finance and Accounting (MFA)", level: "Postgraduate", duration: "2 years", mode: "In person", status: "Active", description: "Advanced finance, accounting and financial-management knowledge, including analysis of complex financial information and strategic financial decision-making.", career_areas: ["Finance director", "Senior accountant", "CFO", "Financial controller", "Investment manager"] },

    // ── Faculty of Information Systems & Technology (3) ──
    { id: "p9", faculty_id: "f2", department_id: "d5", name: "BSc Computer Networking", level: "Degree", duration: "4 years", mode: "In person", status: "Active", description: "Computer networks, telecommunications systems, network administration, routing/switching and network security.", career_areas: ["Network Administrator", "Network Engineer", "Systems Administrator", "IT Infrastructure Officer", "Network Security Assistant", "Data Communications Technician", "Cloud/Network Operations Assistant", "ICT Graduate Trainee"] },
    { id: "p10", faculty_id: "f2", department_id: "d4", name: "BSc Information Systems", level: "Degree", duration: "4 years", mode: "In person", status: "Active", description: "Combines computing, business processes and data analytics to teach students how to design, implement and manage information systems supporting organisational processes and decision-making.", career_areas: ["Information Systems Analyst", "Business Systems Consultant", "Database Administrator", "IT Project Coordinator/Manager", "Business Intelligence Analyst", "Enterprise Systems Specialist", "Network/Security Administrator", "IT Consultant", "IT entrepreneur"], entry_requirements: "Five O-Level/WASSCE credits, including C6 English and C5 Mathematics plus any three subjects. Applicants are also subjected to a faculty entrance examination." },
    { id: "p11", faculty_id: "f2", department_id: "d5", name: "BSc Information Technology", level: "Degree", duration: "4 years", mode: "In person", status: "Active", description: "Covers professional IT areas such as software development, networking, databases, cybersecurity, web/mobile development and IT project management.", career_areas: ["IT Support/System Administrator", "Software Developer", "Network Administrator/Engineer", "Database Administrator", "Cybersecurity Analyst", "Web/Mobile Developer", "IT Project Manager", "Business/Data Analyst", "Technology entrepreneur"], entry_requirements: "Five credits, C6 English, C5 Mathematics plus any three subjects, with faculty entrance examination.", tuition: { "Year 1": "Le 12,465", "Year 2": "Le 9,399", "Year 3": "Le 9,399", "Final Year": "Le 9,025" } },

    // ── Faculty of Business Administration & Entrepreneurship (13) ──
    { id: "p12", faculty_id: "f3", department_id: "d6", name: "BSc Business Administration", level: "Degree", duration: "4 years", mode: "In person", status: "Active", description: "General business management and administration, covering organisational behaviour, operations, finance, and business strategy.", career_areas: ["Business administrator", "Operations officer", "Office manager", "Management trainee", "Business development associate"], entry_requirements: "Five O-Level/WASSCE credits, C5 or better in English and Mathematics plus credits in three other subjects, not more than two sittings." },
    { id: "p13", faculty_id: "f3", department_id: "d6", name: "BSc Entrepreneurship and Innovation", level: "Degree", duration: "4 years", mode: "In person", status: "Active", description: "Development of entrepreneurial mindset and innovation skills for creating, funding and managing high-growth business ventures.", career_areas: ["Entrepreneur", "Startup founder", "Business development officer", "Innovation manager", "Product manager"], entry_requirements: "Five credits, C6 English and Mathematics plus three other credits, within two sittings." },
    { id: "p14", faculty_id: "f3", department_id: "d6", name: "BSc Human Resource Management", level: "Degree", duration: "4 years", mode: "In person", status: "Active", description: "Recruitment, talent management, labour relations, performance appraisal and strategic human-resource management.", career_areas: ["HR Officer/Manager", "Talent Acquisition Specialist", "Training & Development Officer", "Compensation Analyst", "Employee Relations Officer", "HR Consultant", "Organisational Development Officer", "HR Analytics specialist"], tuition: { "Year 1": "Le 9,134", "Year 2": "Le 6,430", "Year 3": "Le 6,430", "Final Year": "Le 6,084" } },
    { id: "p15", faculty_id: "f3", department_id: "d8", name: "BSc Procurement, Logistics and Supply Chain Management", level: "Degree", duration: "4 years", mode: "In person", status: "Active", description: "Strategic procurement, supply-chain management, inventory logistics, warehouse operations and public/private contracting.", career_areas: ["Procurement officer", "Supply-chain analyst/manager", "Logistics coordinator", "Warehouse manager", "Contract officer", "Operations officer", "Risk/quality officer", "Supply-chain consultant"], entry_requirements: "Five credits, English and Mathematics plus three other subjects.", tuition: { "Year 1": "Le 9,134", "Year 2": "Le 6,430", "Year 3": "Le 6,430", "Final Year": "Le 6,084" } },
    { id: "p16", faculty_id: "f3", department_id: "d6", name: "BSc Project Management", level: "Degree", duration: "4 years", mode: "In person", status: "Active", description: "Project lifecycle management, planning, scheduling, risk mitigation, budgeting, monitoring and resource allocation.", career_areas: ["Project Manager/Coordinator", "Project Analyst", "Operations Officer", "Risk Officer", "Procurement/Contract Officer", "M&E Officer", "Business Development Officer", "NGO Development Project Officer"], entry_requirements: "Five credits, C6 English and Mathematics plus three other credits, within two sittings." },
    { id: "p17", faculty_id: "f3", department_id: "d7", name: "BSc Sales and Marketing", level: "Degree", duration: "4 years", mode: "In person", status: "Active", description: "Sales strategy, consumer behaviour, digital marketing, brand management, customer relations and market analytics.", career_areas: ["Sales executive", "Marketing officer", "Brand manager", "Digital marketing specialist", "Market researcher", "Business development officer"], entry_requirements: "Five O-Level/WASSCE credits, C6 English and Mathematics plus three other C6 credits, within two sittings." },
    { id: "p18", faculty_id: "f3", department_id: "d6", name: "MSc Entrepreneurship and Innovation", level: "Postgraduate", duration: "2 years", mode: "In person", status: "Active", description: "Advanced postgraduate training in creating, financing, scaling and leading innovative and sustainable enterprises.", career_areas: ["Startup founder", "Business-development manager", "Innovation manager", "Social-enterprise leader", "Product/project manager", "Investment analyst", "Digital entrepreneur", "Strategy consultant"] },
    { id: "p19", faculty_id: "f3", department_id: "d8", name: "MSc Procurement, Logistics and Supply Chain Management", level: "Postgraduate", duration: "2 years", mode: "In person", status: "Active", description: "Advanced strategic supply-chain design, international procurement, logistics optimization and supply chain analytics.", career_areas: ["Supply Chain Manager", "Procurement Manager", "Logistics Manager", "Inventory/Warehouse Manager", "Operations Manager", "Consultant", "NGO/International Organisation programme roles"] },
    { id: "p20", faculty_id: "f3", department_id: "d6", name: "Masters in Business Administration (MBA)", level: "Postgraduate", duration: "2 years", mode: "In person", status: "Active", description: "Flagship MBA program imparting executive leadership, corporate strategy, financial management, operations and data-driven executive decision-making.", career_areas: ["CEO/Managing Director", "Business Development Manager", "Operations/Project Manager", "Financial/Investment Manager", "Marketing Manager", "HR Manager", "Strategy/Policy Analyst", "Entrepreneur", "Consultant"] },
    { id: "p21", faculty_id: "f3", department_id: "d6", name: "Masters in Project Management", level: "Postgraduate", duration: "2 years", mode: "In person", status: "Active", description: "Advanced postgraduate qualification in complex project delivery, agile methodologies, strategic portfolio management and stakeholder governance.", career_areas: ["Project Manager", "Programme Manager", "Project Analyst", "M&E Officer", "Procurement/contract roles", "Consultancy"] },
    { id: "p22", faculty_id: "f3", department_id: "d6", name: "Online Master in Business Administration", level: "Postgraduate", duration: "2 years", mode: "Fully online", status: "Active", description: "Flexible online MBA designed for working executives, regional leaders, and entrepreneurs across Africa and globally.", career_areas: ["Senior manager", "Entrepreneur", "Business consultant", "Operations director", "Strategy executive"] },
    { id: "p23", faculty_id: "f3", department_id: "d6", name: "PhD in Management Sciences", level: "Postgraduate", duration: "2 years", mode: "In person", status: "Active", description: "Rigorous doctoral research in management sciences, corporate governance, organizational theory and public/private enterprise leadership.", career_areas: ["University lecturer/professor", "Management researcher", "Senior executive", "Strategic consultant", "Policy adviser", "Corporate-governance specialist", "Organisational-development consultant"] },
    { id: "p24", faculty_id: "f3", department_id: "d8", name: "Postgraduate Diploma in Procurement (PGDP)", level: "Postgraduate Diploma", duration: "2 years", mode: "In person", status: "Active", description: "Professional postgraduate diploma focusing on public procurement laws, supply-chain compliance, vendor management and contract negotiation.", career_areas: ["Procurement Officer/Manager", "Contract/Vendor Manager", "Supply Chain Analyst", "Logistics/Inventory Manager", "Procurement Consultant", "Compliance Officer", "Operations Manager"] },

    // ── Faculty of Leadership & Governance (7) ──
    { id: "p25", faculty_id: "f4", department_id: "d9", name: "BSc Leadership & Sustainable Development", level: "Degree", duration: "4 years", mode: "In person", status: "Active", description: "Develops ethical, visionary and socially responsible leaders with deep knowledge of governance, sustainable development and public leadership.", career_areas: ["Development officer", "NGO programme officer", "Sustainability manager", "Policy analyst", "Community development officer"] },
    { id: "p26", faculty_id: "f4", department_id: "d9", name: "BSc Public Policy", level: "Degree", duration: "4 years", mode: "In person", status: "Active", description: "Equips students with analytical tools to formulate, evaluate, and implement impactful public policies in Sierra Leone and West Africa.", career_areas: ["Policy Analyst", "Government Relations Officer", "Research Officer", "Legislative Assistant", "NGO Program Officer", "Public Affairs Consultant"] },
    { id: "p27", faculty_id: "f4", department_id: "d9", name: "BSc Public Sector Management", level: "Degree", duration: "4 years", mode: "In person", status: "Active", description: "Public administration, civil service management, policy implementation, public financial governance and local government leadership.", career_areas: ["Public-sector administrator", "Policy officer", "Local-government officer", "Public-finance/budget officer", "M&E officer", "Regulatory/compliance officer", "NGO/development officer"], entry_requirements: "Five credits, C5 English, C6 Mathematics and C5 in three relevant liberal-arts subjects such as History, Government, CRK or Economics." },
    { id: "p28", faculty_id: "f4", department_id: "d9", name: "Master in Development Management (MDM)", level: "Postgraduate", duration: "2 years", mode: "In person", status: "Active", description: "Focuses on strategic planning, implementing, financing and evaluating socio-economic development projects and national programmes.", career_areas: ["Development project manager", "Policy analyst", "M&E specialist", "Community-development practitioner", "NGO programme manager", "Sustainability/CSR officer", "Development consultant"] },
    { id: "p29", faculty_id: "f4", department_id: "d9", name: "Master in Governance and Leadership (MGL)", level: "Postgraduate", duration: "2 years", mode: "In person", status: "Active", description: "Directed toward advanced governance, leadership development, anti-corruption frameworks, and institutional leadership for senior public and private sector officials.", career_areas: ["Senior government official", "Policy director", "Governance consultant", "Leadership trainer", "Executive manager"] },
    { id: "p30", faculty_id: "f4", department_id: "d9", name: "Master in Public Administration (MPA)", level: "Postgraduate", duration: "2 years", mode: "In person", status: "Active", description: "Premier postgraduate training in executive public-sector management, administrative reform, public financial management and state governance.", career_areas: ["Public-sector manager", "Policy analyst", "Local-government officer", "Public HR manager", "Planning/M&E officer", "Public-financial-management officer", "Regulator/compliance officer", "NGO programme manager"] },
    { id: "p31", faculty_id: "f4", department_id: "d9", name: "Masters of Research and Public Policy (MRPP)", level: "Postgraduate", duration: "2 years", mode: "In person", status: "Active", description: "Advanced collaborative postgraduate degree focusing on rigorous research methodologies, policy analysis and evidence-based decision-making in Africa.", career_areas: ["Policy analyst", "Researcher", "Government planning officer", "M&E specialist", "NGO programme manager", "Governance consultant", "Policy-communication officer", "Academic/research roles"] },

    // ── Extra-Mural Studies / Professional & Continuing Education (8) ──
    { id: "p32", faculty_id: "f5", department_id: "d10", name: "Certificate in Business and Finance", level: "Certificate", duration: "1 year", mode: "In person", status: "Active", description: "A one-year foundational certificate introducing business, finance, accounting, and commerce fundamentals for workforce entry or progressive study.", career_areas: ["Junior business assistant", "Finance clerk", "Customer service representative", "Administrative trainee"], entry_requirements: "Four GCE O-Level/WASSCE credits, with C6 or better in English or Mathematics plus three other subjects." },
    { id: "p33", faculty_id: "f5", department_id: "d10", name: "Diploma in Applied Accounting", level: "Diploma", duration: "2 years", mode: "In person", status: "Active", description: "A professional diploma providing applied skills in financial accounting, bookkeeping, payroll, and reporting for commercial and public sector roles.", career_areas: ["Accounts clerk", "Bookkeeper", "Accounts assistant", "Finance assistant", "Accounts officer"], entry_requirements: "Four GCE O-Level/WASSCE credits, with C6 or better in English or Mathematics plus three other subjects." },
    { id: "p34", faculty_id: "f5", department_id: "d10", name: "Diploma in Banking and Finance", level: "Diploma", duration: "2 years", mode: "In person", status: "Active", description: "A professional diploma in banking operations, financial services, credit analysis, and customer relationship management.", career_areas: ["Bank teller", "Customer service officer", "Finance assistant", "Credit officer trainee", "Bank operations clerk"], entry_requirements: "Four GCE O-Level/WASSCE credits, with C6 or better in English or Mathematics plus three other subjects." },
    { id: "p35", faculty_id: "f5", department_id: "d10", name: "Diploma in Business Administration", level: "Diploma", duration: "2 years", mode: "In person", status: "Active", description: "A professional diploma in business principles, office administration, supervision, and organizational management for early career professionals.", career_areas: ["Office administrator", "Administrative assistant", "Office manager trainee", "Business support officer", "Executive assistant"], entry_requirements: "Four GCE O-Level/WASSCE credits, with C6 or better in English or Mathematics plus three other subjects." },
    { id: "p36", faculty_id: "f5", department_id: "d10", name: "Diploma in Financial Services", level: "Diploma", duration: "2 years", mode: "In person", status: "Active", description: "A professional diploma in the financial services sector, covering insurance, microfinance, investments, and client advisory basics.", career_areas: ["Financial services assistant", "Insurance clerk", "Investment assistant", "Client services officer"], entry_requirements: "Four GCE O-Level/WASSCE credits, with C6 or better in English or Mathematics plus three other subjects." },
    { id: "p37", faculty_id: "f5", department_id: "d10", name: "Diploma in Information Technology", level: "Diploma", duration: "2 years", mode: "In person", status: "Active", description: "A professional diploma in core IT skills including computer hardware, software applications, networking basics, web tools, and digital literacy.", career_areas: ["IT support technician", "Help desk assistant", "Data entry operator", "Systems clerk", "ICT trainee"], entry_requirements: "Four GCE O-Level/WASSCE credits, with C6 or better in English or Mathematics plus three other subjects." },
    { id: "p38", faculty_id: "f5", department_id: "d10", name: "Diploma in Procurement and Supply", level: "Diploma", duration: "2 years", mode: "In person", status: "Active", description: "A professional diploma in procurement principles, purchasing, inventory control, and supply chain administration for public and private institutions.", career_areas: ["Procurement clerk", "Stores officer", "Supply chain assistant", "Purchasing assistant", "Logistics trainee"], entry_requirements: "Four GCE O-Level/WASSCE credits, with C6 or better in English or Mathematics plus three other subjects." },
    { id: "p39", faculty_id: "f5", department_id: "d10", name: "Diploma in Public Sector Management", level: "Diploma", duration: "2 years", mode: "In person", status: "Active", description: "A professional diploma in government administration, public service ethics, civil service procedures, and local administrative management.", career_areas: ["Civil service officer", "Administrative officer", "Government clerk", "Local government officer", "Registry officer"], entry_requirements: "Four GCE O-Level/WASSCE credits, with C6 or better in English or Mathematics plus three other subjects." }
  ];

  return {
    users,
    profiles,
    providers,
    courses,
    enrollments: [],
    certificate_assets: [],
    course_materials: [
      {
        id: "mat-init-1",
        course_id: "c1",
        module_id: "m1",
        title: "Introduction to Core Principles - Syllabus",
        description: "Overview of the core principles, objectives, and week-by-week syllabus outline.",
        week_label: "Week 1",
        material_type: "pdf",
        material_category: "reading_material",
        file_url: "/uploads/materials/syllabus.pdf",
        uploaded_by: "lecturer-uuid",
        original_filename: "syllabus.pdf",
        file_size_bytes: 1024000,
        semester: "Semester 1",
        academic_year: 1,
        lecture_note_number: 1,
        is_published: true,
        created_at: new Date().toISOString()
      },
      {
        id: "mat-init-2",
        course_id: "c1",
        module_id: "m2",
        title: "Quantitative Methods I Lecture Slides",
        description: "Presentation slides covering basic algebra, equations, and mathematical applications in business.",
        week_label: "Week 2",
        material_type: "presentation",
        material_category: "lecture_notes",
        file_url: "/uploads/materials/quant_slides.pdf",
        uploaded_by: "lecturer-uuid",
        original_filename: "quant_slides.pptx",
        file_size_bytes: 3450000,
        semester: "Semester 1",
        academic_year: 1,
        lecture_note_number: 2,
        is_published: true,
        created_at: new Date().toISOString()
      },
      {
        id: "mat-init-3",
        course_id: "c1",
        module_id: "m3",
        title: "Academic Communication Skills Handbook",
        description: "Handbook containing standard rules of essay writing, structuring papers, and citation formats.",
        week_label: "Week 1",
        material_type: "pdf",
        material_category: "reading_material",
        file_url: "/uploads/materials/comm_handbook.pdf",
        uploaded_by: "lecturer-uuid",
        original_filename: "comm_handbook.pdf",
        file_size_bytes: 2048000,
        semester: "Semester 1",
        academic_year: 1,
        lecture_note_number: 1,
        is_published: true,
        created_at: new Date().toISOString()
      },
      {
        id: "mat-init-4",
        course_id: "c1",
        module_id: "m4",
        title: "Fundamentals of Practice Lab Manual",
        description: "Laboratory manual explaining system operation, tool usage, and introductory hands-on practice guidelines.",
        week_label: "Week 3",
        material_type: "doc",
        material_category: "assignment",
        file_url: "/uploads/materials/lab_manual.docx",
        uploaded_by: "lecturer-uuid",
        original_filename: "lab_manual.docx",
        file_size_bytes: 1540000,
        semester: "Semester 1",
        academic_year: 1,
        lecture_note_number: 3,
        is_published: true,
        created_at: new Date().toISOString()
      }
    ],
    assessments: [],
    assessment_questions: [],
    assessment_attempts: [],
    learning_events: [],
    transactions: [
      { id: "t1", user_id: "admin-uuid", type: "credit", amount: 250, created_at: new Date().toISOString() }
    ],
    scholarships: [
      { id: "s1", user_id: "admin-uuid", status: "approved", applied_at: new Date().toISOString() }
    ],
    notifications: [
      { id: "n1", user_id: "admin-uuid", title: "Welcome to UniPam", message: "Congratulations on setting up your premium student account on UniPam!", created_at: new Date().toISOString(), read_at: null }
    ],
    messages: [
      {
        id: "msg-init-1",
        from_user_id: "lecturer-uuid",
        from_name: "Dr. Ernest Udeh",
        from_role: "lecturer",
        to_user_id: "all",
        to_name: "All Students",
        course_id: "c1",
        course_title: "Information Systems & Modern Database Architecture",
        subject: "Mid-Semester Assignment Available in Learning Materials",
        message: "Dear students, the latest lecture slides and coursework questions have been uploaded to Manage Learning Materials. Please review them before next week's session.",
        category: "announcement",
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        read_at: null
      }
    ],
    ipam_faculties,
    ipam_departments,
    ipam_programmes
  };
}

class MockPool {
  constructor() {
    this.load();
  }

  load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        this.data = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      } catch (e) {
        this.data = getInitialState();
        this.save();
      }
    } else {
      this.data = getInitialState();
      this.save();
    }
    // Backfill collections added after this file was first written to disk.
    if (!this.data.course_materials) this.data.course_materials = [];
    if (!this.data.assessments) this.data.assessments = [];
    if (!this.data.assessment_questions) this.data.assessment_questions = [];
    if (!this.data.assessment_attempts) this.data.assessment_attempts = [];
    // Backfill IPAM academic data
    if (!this.data.ipam_faculties || this.data.ipam_faculties.length < 5 || !this.data.ipam_programmes || this.data.ipam_programmes.length !== 39) {
      const fresh = getInitialState();
      this.data.ipam_faculties = fresh.ipam_faculties;
      this.data.ipam_departments = fresh.ipam_departments;
      this.data.ipam_programmes = fresh.ipam_programmes;
      this.save();
    }
    if (!this.data.ipam_departments) this.data.ipam_departments = [];
    if (!this.data.ipam_programmes) this.data.ipam_programmes = [];
    if (!this.data.course_materials || this.data.course_materials.length === 0) {
      this.data.course_materials = getInitialState().course_materials;
      this.save();
    }
  }

  save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf8");
  }

  async connect() {
    const self = this;
    return {
      query: async (sql, params) => {
        return self.query(sql, params);
      },
      release: () => { }
    };
  }

  async query(sql, params = []) {
    this.load(); // Refresh state from file on every query
    const queryNormalized = sql.replace(/\s+/g, " ").trim().toLowerCase();

    // 1. SELECT NOW()
    if (queryNormalized.includes("select now()")) {
      return { rows: [{ now: new Date() }], rowCount: 1 };
    }

    // 0a. IPAM: Get single programme by ID
    if (queryNormalized.includes("from ipam_programmes") && queryNormalized.includes("where id = $1")) {
      const id = params[0];
      const prog = this.data.ipam_programmes.find(p => p.id === id);
      if (!prog) return { rows: [], rowCount: 0 };
      const fac = this.data.ipam_faculties.find(f => f.id === prog.faculty_id) || {};
      const dept = this.data.ipam_departments.find(d => d.id === prog.department_id) || {};
      return { rows: [{ ...prog, faculty_name: fac.name, faculty_slug: fac.slug, department_name: dept.name }], rowCount: 1 };
    }

    // 0b. IPAM: Get programmes (optionally by faculty, level, search)
    if (queryNormalized.includes("from ipam_programmes")) {
      let list = [...this.data.ipam_programmes];
      if (params[0]) list = list.filter(p => p.faculty_id === params[0]); // facultyId filter
      if (params[1]) list = list.filter(p => (p.level || "").toLowerCase() === String(params[1]).toLowerCase());
      if (params[2]) {
        const q = String(params[2]).toLowerCase();
        list = list.filter(p => (p.name || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
      }
      const rows = list.map(p => {
        const fac = this.data.ipam_faculties.find(f => f.id === p.faculty_id) || {};
        const dept = this.data.ipam_departments.find(d => d.id === p.department_id) || {};
        return { ...p, faculty_name: fac.name, faculty_slug: fac.slug, department_name: dept.name };
      });
      return { rows, rowCount: rows.length };
    }

    // 0c. IPAM: Get departments (optionally by faculty)
    if (queryNormalized.includes("from ipam_departments")) {
      let list = [...this.data.ipam_departments];
      if (params[0]) list = list.filter(d => d.faculty_id === params[0]);
      return { rows: list, rowCount: list.length };
    }

    // 0d. IPAM: Get faculties
    if (queryNormalized.includes("from ipam_faculties")) {
      const rows = this.data.ipam_faculties.map(f => ({
        ...f,
        programme_count: this.data.ipam_programmes.filter(p => p.faculty_id === f.id).length
      }));
      return { rows, rowCount: rows.length };
    }

    // 2. pg_database checks
    if (queryNormalized.includes("pg_database")) {
      return { rows: [{ '1': 1 }], rowCount: 1 };
    }

    // 2b. Provider Lookup by Slug (for course creation)
    if (queryNormalized.includes("from providers") && queryNormalized.includes("where slug = $1")) {
      const slug = String(params[0]).toLowerCase();
      const provider = this.data.providers.find(p => p.slug === slug);
      return { rows: provider ? [provider] : [], rowCount: provider ? 1 : 0 };
    }

    // 2c. Course Materials: Delete by ID
    if (queryNormalized.includes("delete from course_materials") && queryNormalized.includes("where id = $1")) {
      const id = params[0];
      const idx = this.data.course_materials.findIndex(m => m.id === id);
      if (idx === -1) return { rows: [], rowCount: 0 };
      const [removed] = this.data.course_materials.splice(idx, 1);
      this.save();
      return { rows: [removed], rowCount: 1 };
    }

    // 2d. Course Materials: Find by ID
    if (queryNormalized.includes("from course_materials") && queryNormalized.includes("where id = $1")) {
      const id = params[0];
      const material = this.data.course_materials.find(m => m.id === id);
      return { rows: material ? [material] : [], rowCount: material ? 1 : 0 };
    }

    // 2e. Course Materials: List by Course ID
    if (queryNormalized.includes("from course_materials") && queryNormalized.includes("where course_id = $1")) {
      const courseId = params[0];
      const list = this.data.course_materials
        .filter(m => m.course_id === courseId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      return { rows: list, rowCount: list.length };
    }

    // 2ee. Course Materials: Repository list query (student browse all published)
    if (queryNormalized.includes("from course_materials") && queryNormalized.includes("join enrollments")) {
      const userId = params[0];
      
      // Return published materials
      const list = this.data.course_materials.filter(m => m.is_published !== false);
      
      const rows = list.map(m => {
        const course = this.data.courses.find(c => c.id === m.course_id) || { title: "Information Systems & Modern Database Architecture" };
        
        // Find matching module title based on module_id
        let moduleTitle = m.module_title || "";
        if (m.module_id === "m1") moduleTitle = "Introduction to Core Principles";
        else if (m.module_id === "m2") moduleTitle = "Quantitative Methods I";
        else if (m.module_id === "m3") moduleTitle = "Academic Communication Skills";
        else if (m.module_id === "m4") moduleTitle = "Fundamentals of Practice";
        
        return {
          ...m,
          course_title: course.title,
          course_code: course.external_id || "IST111",
          module_title: moduleTitle,
          uploader_name: "Dr. Ernest Udeh",
          is_saved: this.data.saved_materials?.some(sm => sm.material_id === m.id && sm.user_id === userId) || false
        };
      });
      
      return { rows, rowCount: rows.length };
    }

    // 2f. Course Materials: Create
    if (queryNormalized.includes("insert into course_materials")) {
      const [courseId, title, description, weekLabel, materialType, fileUrl, uploadedBy] = params;
      const id = "mat-" + Math.random().toString(36).substr(2, 9);
      const material = {
        id,
        course_id: courseId,
        title,
        description: description || "",
        week_label: weekLabel || "",
        material_type: materialType,
        file_url: fileUrl,
        uploaded_by: uploadedBy,
        created_at: new Date().toISOString()
      };
      this.data.course_materials.push(material);
      this.save();
      return { rows: [material], rowCount: 1 };
    }

    // 2h. Assessment Attempts: Delete-cascade helper (also see assessment delete below)
    if (queryNormalized.includes("delete from assessments") && queryNormalized.includes("where id = $1")) {
      const id = params[0];
      const idx = this.data.assessments.findIndex(a => a.id === id);
      if (idx === -1) return { rows: [], rowCount: 0 };
      const [removed] = this.data.assessments.splice(idx, 1);
      this.data.assessment_questions = this.data.assessment_questions.filter(q => q.assessment_id !== id);
      this.data.assessment_attempts = this.data.assessment_attempts.filter(a => a.assessment_id !== id);
      this.save();
      return { rows: [removed], rowCount: 1 };
    }

    // 2i. Assessment: Find by ID
    if (queryNormalized.includes("from assessments") && queryNormalized.includes("where id = $1")) {
      const id = params[0];
      const assessment = this.data.assessments.find(a => a.id === id);
      return { rows: assessment ? [assessment] : [], rowCount: assessment ? 1 : 0 };
    }

    // 2j. Assessment: List by Course ID
    if (queryNormalized.includes("from assessments") && queryNormalized.includes("where course_id = $1")) {
      const courseId = params[0];
      const list = this.data.assessments
        .filter(a => a.course_id === courseId)
        .sort((a, b) => new Date(a.opens_at) - new Date(b.opens_at));
      return { rows: list, rowCount: list.length };
    }

    // 2k. Assessment: Create
    if (queryNormalized.includes("insert into assessments")) {
      const [courseId, title, description, opensAt, closesAt, durationMinutes, createdBy] = params;
      const id = "asm-" + Math.random().toString(36).substr(2, 9);
      const assessment = {
        id, course_id: courseId, title, description: description || "",
        opens_at: opensAt, closes_at: closesAt, duration_minutes: durationMinutes,
        created_by: createdBy, created_at: new Date().toISOString()
      };
      this.data.assessments.push(assessment);
      this.save();
      return { rows: [assessment], rowCount: 1 };
    }

    // 2l. Assessment Questions: List by Assessment ID
    if (queryNormalized.includes("from assessment_questions") && queryNormalized.includes("where assessment_id = $1")) {
      const assessmentId = params[0];
      const list = this.data.assessment_questions
        .filter(q => q.assessment_id === assessmentId)
        .sort((a, b) => a.order_index - b.order_index);
      return { rows: list, rowCount: list.length };
    }

    // 2m. Assessment Questions: Create
    if (queryNormalized.includes("insert into assessment_questions")) {
      const [assessmentId, questionText, options, correctIndex, points, orderIndex] = params;
      const id = "q-" + Math.random().toString(36).substr(2, 9);
      const question = {
        id, assessment_id: assessmentId, question_text: questionText,
        options: typeof options === "string" ? JSON.parse(options) : options,
        correct_index: correctIndex, points, order_index: orderIndex
      };
      this.data.assessment_questions.push(question);
      this.save();
      return { rows: [question], rowCount: 1 };
    }

    // 2n. Assessment Attempts: Find single (assessment_id + user_id)
    if (queryNormalized.includes("from assessment_attempts") && queryNormalized.includes("assessment_id = $1 and user_id = $2")) {
      const [assessmentId, userId] = params;
      const attempt = this.data.assessment_attempts.find(a => a.assessment_id === assessmentId && a.user_id === userId);
      return { rows: attempt ? [attempt] : [], rowCount: attempt ? 1 : 0 };
    }

    // 2o. Assessment Attempts: List all for an assessment
    if (queryNormalized.includes("from assessment_attempts") && queryNormalized.includes("where assessment_id = $1")) {
      const assessmentId = params[0];
      const list = this.data.assessment_attempts.filter(a => a.assessment_id === assessmentId);
      return { rows: list, rowCount: list.length };
    }

    // 2p. Assessment Attempts: Create
    if (queryNormalized.includes("insert into assessment_attempts")) {
      const [assessmentId, userId, answers, score, maxScore] = params;
      const id = "att-" + Math.random().toString(36).substr(2, 9);
      const attempt = {
        id, assessment_id: assessmentId, user_id: userId,
        answers: typeof answers === "string" ? JSON.parse(answers) : answers,
        score, max_score: maxScore, submitted_at: new Date().toISOString()
      };
      this.data.assessment_attempts.push(attempt);
      this.save();
      return { rows: [attempt], rowCount: 1 };
    }

    // 2g. Course: Create (lecturer/admin authoring a UniPam course)
    if (queryNormalized.includes("insert into courses") && queryNormalized.includes("returning *")) {
      const [
        providerId, externalId, title, category, level, duration, hasCertificate,
        costType, externalUrl, description, isInternal, instructorId, instructorName, thumbnailUrl
      ] = params;
      const id = "c-" + Math.random().toString(36).substr(2, 9);
      const course = {
        id,
        provider_id: providerId,
        external_id: externalId,
        title,
        category,
        skill_level: level,
        duration_label: duration,
        has_certificate: hasCertificate,
        cost_type: costType,
        external_url: externalUrl,
        description,
        is_internal: isInternal,
        instructor_id: instructorId,
        instructor_name: instructorName,
        thumbnail_url: thumbnailUrl,
        is_active: true,
        created_at: new Date().toISOString()
      };
      this.data.courses.push(course);
      this.save();
      return { rows: [course], rowCount: 1 };
    }

    // 3. User Lookup by Email (findByEmail)
    if (queryNormalized.includes("from users u left join profiles p on p.user_id = u.id") && queryNormalized.includes("where u.email = $1")) {
      const email = params[0].toLowerCase().trim();
      const user = this.data.users.find(u => u.email === email);
      if (!user) return { rows: [], rowCount: 0 };
      const profile = this.data.profiles.find(p => p.user_id === user.id) || {};

      let skillsParsed = [];
      try {
        skillsParsed = JSON.parse(profile.skills_interests || "[]");
      } catch (e) {
        skillsParsed = [];
      }

      return {
        rows: [{
          ...profile,
          ...user,
          skills_interests: skillsParsed
        }],
        rowCount: 1
      };
    }

    // 3b. User Lookup by Student ID (findByStudentId)
    if (queryNormalized.includes("from users u left join profiles p on p.user_id = u.id") && queryNormalized.includes("where p.student_id_number = $1")) {
      const studentId = params[0].trim();
      const profile = this.data.profiles.find(p => p.student_id_number === studentId);
      if (!profile) return { rows: [], rowCount: 0 };
      const user = this.data.users.find(u => u.id === profile.user_id);
      if (!user) return { rows: [], rowCount: 0 };

      let skillsParsed = [];
      try {
        skillsParsed = JSON.parse(profile.skills_interests || "[]");
      } catch (e) {
        skillsParsed = [];
      }

      return {
        rows: [{
          ...profile,
          ...user,
          skills_interests: skillsParsed
        }],
        rowCount: 1
      };
    }

    // 4. User Lookup by ID (findById)
    if (queryNormalized.includes("from users u left join profiles p on p.user_id = u.id") && queryNormalized.includes("where u.id = $1")) {
      const id = params[0];
      const user = this.data.users.find(u => u.id === id);
      if (!user) return { rows: [], rowCount: 0 };
      const profile = this.data.profiles.find(p => p.user_id === user.id) || {};

      let skillsParsed = [];
      try {
        skillsParsed = JSON.parse(profile.skills_interests || "[]");
      } catch (e) {
        skillsParsed = [];
      }

      return {
        rows: [{
          id: user.id,
          email: user.email,
          role: user.role,
          ...profile,
          skills_interests: skillsParsed
        }],
        rowCount: 1
      };
    }

    // 5. Create User (INSERT INTO users)
    if (queryNormalized.includes("insert into users") && queryNormalized.includes("returning id")) {
      const email = params[0].toLowerCase().trim();
      const passwordHash = params[1];
      const role = params[2] || "learner";
      const id = "user-" + Math.random().toString(36).substr(2, 9);

      const newUser = {
        id,
        email,
        password_hash: passwordHash,
        role,
        is_active: true,
        created_at: new Date().toISOString()
      };
      this.data.users.push(newUser);

      // Auto seed credit/transaction, notifications, and scholarship for mock database usability
      this.data.transactions.push({
        id: "t-" + Math.random().toString(36).substr(2, 9),
        user_id: id,
        type: "credit",
        amount: 250,
        created_at: new Date().toISOString()
      });
      this.data.scholarships.push({
        id: "s-" + Math.random().toString(36).substr(2, 9),
        user_id: id,
        status: "approved",
        applied_at: new Date().toISOString()
      });
      this.data.notifications.push({
        id: "n-" + Math.random().toString(36).substr(2, 9),
        user_id: id,
        title: "Welcome to UniPam",
        message: "Congratulations on setting up your premium student account on UniPam!",
        created_at: new Date().toISOString(),
        read_at: null
      });

      this.save();
      return { rows: [{ id, email, role }], rowCount: 1 };
    }

    // 6. Create Profile (INSERT INTO profiles)
    if (queryNormalized.includes("insert into profiles")) {
      const userId = params[0];
      const fullName = params[1];
      const studentIdNumber = params[2] || null;
      const universityProgramId = params[3] || null;
      const currentAcademicYear = params[4] || null;
      const currentSemester = params[5] || null;
      const newProfile = {
        user_id: userId,
        full_name: fullName,
        student_id_number: studentIdNumber,
        university_program_id: universityProgramId,
        current_academic_year: currentAcademicYear,
        current_semester: currentSemester,
        phone_number: "+232 76 000000",
        country_code: "SL",
        preferred_language: "English",
        education_background: "Bachelors",
        skills_interests: '[]',
        learning_goals: "Learn Web Development",
        institution_name: "University of Sierra Leone",
        faculty: "Faculty of Pure & Applied Sciences",
        department: "Department of Computer Science",
        enrollment_year: "2025",
        academic_standing: "Good",
        created_at: new Date().toISOString()
      };
      this.data.profiles.push(newProfile);
      this.save();
      return { rows: [newProfile], rowCount: 1 };
    }

    // 7. Update Profile
    if (queryNormalized.includes("update profiles set")) {
      const userId = params[0];
      const idx = this.data.profiles.findIndex(p => p.user_id === userId);
      if (idx !== -1) {
        const p = this.data.profiles[idx];
        if (params[1] !== undefined && params[1] !== null) p.full_name = params[1];
        if (params[2] !== undefined && params[2] !== null) p.phone_number = params[2];
        if (params[3] !== undefined && params[3] !== null) p.country_code = params[3];
        if (params[4] !== undefined && params[4] !== null) p.preferred_language = params[4];
        if (params[5] !== undefined && params[5] !== null) p.education_background = params[5];
        if (params[6] !== undefined && params[6] !== null) p.skills_interests = typeof params[6] === 'object' ? JSON.stringify(params[6]) : params[6];
        if (params[7] !== undefined && params[7] !== null) p.learning_goals = params[7];
        if (params[8] !== undefined && params[8] !== null) p.profile_photo_url = params[8];
        if (params[9] !== undefined && params[9] !== null) p.designation = params[9];
        if (params[10] !== undefined && params[10] !== null) p.website_url = params[10];
        if (params[11] !== undefined && params[11] !== null) p.bio = params[11];
        if (params[12] !== undefined && params[12] !== null) p.institution_name = params[12];
        if (params[13] !== undefined && params[13] !== null) p.faculty = params[13];
        if (params[14] !== undefined && params[14] !== null) p.department = params[14];
        if (params[15] !== undefined && params[15] !== null) p.enrollment_year = params[15];
        if (params[16] !== undefined && params[16] !== null) p.academic_standing = params[16];
        if (params[17] !== undefined && params[17] !== null) p.faculty_id = params[17];
        if (params[18] !== undefined && params[18] !== null) p.department_id = params[18];
        if (params[19] !== undefined && params[19] !== null) p.student_id_number = params[19];
        if (params[20] !== undefined && params[20] !== null) p.university_program_id = params[20];
        if (params[21] !== undefined && params[21] !== null) p.current_academic_year = params[21];
        if (params[22] !== undefined && params[22] !== null) p.current_semester = params[22];
        p.updated_at = new Date().toISOString();
        this.save();
        return { rows: [p], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // 7b. LMS: Modules and Lessons
    if (queryNormalized.includes("from modules") && queryNormalized.includes("course_id = $1")) {
      const courseId = params[0];
      if (!this.data.modules) this.data.modules = [];
      let list = this.data.modules.filter(m => m.course_id === courseId);
      if (list.length === 0) {
        list = [
          { id: `m-${courseId}-1`, course_id: courseId, title: "Introduction & Platform Walkthrough", order_index: 0, module_code: "IPAM-IS111", semester: "Semester 1", lecturer_name: "Dr. Ernest Udeh" },
          { id: `m-${courseId}-2`, course_id: courseId, title: "Advanced Features & Core Systems", order_index: 1, module_code: "IPAM-IS112", semester: "Semester 1", lecturer_name: "Dr. Ernest Udeh" }
        ];
        this.data.modules.push(...list);
        this.save();
      }
      return { rows: list, rowCount: list.length };
    }

    if (queryNormalized.includes("from lessons") && queryNormalized.includes("module_id = $1")) {
      const moduleId = params[0];
      if (!this.data.lessons) this.data.lessons = [];
      let list = this.data.lessons.filter(l => l.module_id === moduleId);
      if (list.length === 0) {
        list = [
          { id: `l-${moduleId}-1`, module_id: moduleId, title: "LMS Platform Walkthrough", content_type: "video", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", article_content: "This video walkthrough provides a comprehensive guide to navigating and utilizing the UniPam eLearning Platform features.", order_index: 0, duration_minutes: 10 },
          { id: `l-${moduleId}-2`, module_id: moduleId, title: "System Guidelines & Academic Integrity", content_type: "article", video_url: "", article_content: "Academic integrity is fundamental at the University of Sierra Leone. Please read this guide on proper citations and standards.", order_index: 1, duration_minutes: 15 }
        ];
        this.data.lessons.push(...list);
        this.save();
      }
      return { rows: list, rowCount: list.length };
    }

    if (queryNormalized.includes("from lessons") && queryNormalized.includes("where id = $1")) {
      const id = params[0];
      if (!this.data.lessons) this.data.lessons = [];
      let lesson = this.data.lessons.find(l => l.id === id);
      if (!lesson) {
        lesson = { id, module_id: "m1", title: "Standard LMS Lecture", content_type: "article", video_url: "", article_content: "This text provides standard course reading materials.", order_index: 0, duration_minutes: 10 };
      }
      return { rows: [lesson], rowCount: 1 };
    }

    // 8. Find Course By ID
    if (queryNormalized.includes("from courses c") && queryNormalized.includes("where c.id = $1")) {
      const courseId = params[0];
      const course = this.data.courses.find(c => c.id === courseId);
      if (!course) return { rows: [], rowCount: 0 };
      const provider = this.data.providers.find(p => p.id === course.provider_id) || {};
      const instructorUser = this.data.users.find(u => u.id === course.instructor_id);
      return {
        rows: [{
          ...course,
          provider_name: provider.name,
          provider_slug: provider.slug,
          instructor_email: instructorUser?.email || "instructor@usl.edu.sl"
        }],
        rowCount: 1
      };
    }

    // 9. Find Courses (findAll)
    if (queryNormalized.includes("from courses c")) {
      let filtered = [...this.data.courses];

      // Replicate category filter
      const categoryIdx = queryNormalized.indexOf("lower(c.category) = $");
      if (categoryIdx !== -1) {
        const matchNum = parseInt(queryNormalized.substr(categoryIdx + 21, 1));
        const val = params[matchNum - 1];
        if (val) filtered = filtered.filter(c => c.category.toLowerCase() === val.toLowerCase());
      }

      // Replicate skill level filter
      const skillIdx = queryNormalized.indexOf("lower(c.skill_level) = $");
      if (skillIdx !== -1) {
        const matchNum = parseInt(queryNormalized.substr(skillIdx + 24, 1));
        const val = params[matchNum - 1];
        if (val) filtered = filtered.filter(c => c.skill_level.toLowerCase() === val.toLowerCase());
      }

      // Replicate provider slug filter
      const provIdx = queryNormalized.indexOf("lower(p.slug) = $");
      if (provIdx !== -1) {
        const matchNum = parseInt(queryNormalized.substr(provIdx + 17, 1));
        const val = params[matchNum - 1];
        if (val) {
          const providerObj = this.data.providers.find(pr => pr.slug === val.toLowerCase());
          if (providerObj) {
            filtered = filtered.filter(c => c.provider_id === providerObj.id);
          } else {
            filtered = [];
          }
        }
      }

      // Replicate instructor filter (lecturer "My Courses")
      const instructorIdx = queryNormalized.indexOf("c.instructor_id = $");
      if (instructorIdx !== -1) {
        const matchNum = parseInt(queryNormalized.substr(instructorIdx + 19, 1));
        const val = params[matchNum - 1];
        if (val) filtered = filtered.filter(c => c.instructor_id === val);
      }

      const rows = filtered.map(c => {
        const provider = this.data.providers.find(p => p.id === c.provider_id) || {};
        const instructorUser = this.data.users.find(u => u.id === c.instructor_id);
        return {
          ...c,
          provider_name: provider.name,
          provider_slug: provider.slug,
          instructor_email: instructorUser?.email || "instructor@usl.edu.sl"
        };
      });

      return { rows, rowCount: rows.length };
    }

    // 10. Find Enrollment (check double-enroll)
    if (queryNormalized.includes("from enrollments") && queryNormalized.includes("user_id = $1 and course_id = $2")) {
      const userId = params[0];
      const courseId = params[1];
      const enrollment = this.data.enrollments.find(e => e.user_id === userId && e.course_id === courseId);
      return { rows: enrollment ? [enrollment] : [], rowCount: enrollment ? 1 : 0 };
    }

    // 11. Find Enrollments for User
    if (queryNormalized.includes("from enrollments") && queryNormalized.includes("user_id = $1")) {
      const userId = params[0];
      const list = this.data.enrollments.filter(e => e.user_id === userId);
      const rows = list.map(e => {
        const course = this.data.courses.find(c => c.id === e.course_id) || {};
        const provider = this.data.providers.find(p => p.id === course.provider_id) || {};
        return {
          ...e,
          title: course.title,
          category: course.category,
          provider_name: provider.name,
          is_internal: course.is_internal,
          duration_label: course.duration_label
        };
      });
      return { rows, rowCount: rows.length };
    }

    // 12. Create Enrollment
    if (queryNormalized.includes("insert into enrollments")) {
      const userId = params[0];
      const courseId = params[1];
      const status = params[2] || "enrolled";
      const id = "enroll-" + Math.random().toString(36).substr(2, 9);
      const newEnroll = {
        id,
        user_id: userId,
        course_id: courseId,
        status,
        progress_percent: 0,
        lessons_completed: 0,
        enrolled_at: new Date().toISOString()
      };
      this.data.enrollments.push(newEnroll);
      this.save();
      return { rows: [newEnroll], rowCount: 1 };
    }

    // 13. Update Enrollment Progress
    if (queryNormalized.includes("update enrollments set") && queryNormalized.includes("progress_percent")) {
      const enrollmentId = params[0];
      const progress = params[1];
      const completed = params[2];

      const idx = this.data.enrollments.findIndex(e => e.id === enrollmentId);
      if (idx !== -1) {
        this.data.enrollments[idx].progress_percent = progress;
        this.data.enrollments[idx].lessons_completed = completed;
        this.data.enrollments[idx].updated_at = new Date().toISOString();
        this.save();
        return { rows: [this.data.enrollments[idx]], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // 14. List Certificates
    if (queryNormalized.includes("from certificate_assets") && queryNormalized.includes("user_id = $1")) {
      const userId = params[0];
      const list = this.data.certificate_assets.filter(c => c.user_id === userId);
      return { rows: list, rowCount: list.length };
    }

    // 15. Create Certificate Asset
    if (queryNormalized.includes("insert into certificate_assets")) {
      const userId = params[0];
      const courseId = params[1];
      const title = params[2];
      const storageKey = params[3];
      const fileName = params[4];
      const mimeType = params[5];

      const id = "cert-" + Math.random().toString(36).substr(2, 9);
      const newCert = {
        id,
        user_id: userId,
        course_id: courseId,
        title,
        storage_key: storageKey,
        file_name: fileName,
        mime_type: mimeType,
        created_at: new Date().toISOString()
      };
      this.data.certificate_assets.push(newCert);

      // Auto complete the corresponding enrollment if present
      const enrollIdx = this.data.enrollments.findIndex(e => e.user_id === userId && e.course_id === courseId);
      if (enrollIdx !== -1) {
        this.data.enrollments[enrollIdx].progress_percent = 100;
        this.data.enrollments[enrollIdx].lessons_completed = 10;
        this.data.enrollments[enrollIdx].status = "completed";
      }

      this.save();
      return { rows: [newCert], rowCount: 1 };
    }

    // 16. Dashboard Count Enrollments
    if (queryNormalized.includes("select count(*)") && queryNormalized.includes("from enrollments")) {
      const userId = params[0];
      const count = this.data.enrollments.filter(e => e.user_id === userId).length;
      return { rows: [{ count: String(count) }], rowCount: 1 };
    }

    // 17. Dashboard Summary Stats (Complex Filter Query)
    if (queryNormalized.includes("from enrollments") && queryNormalized.includes("where user_id = $1") && queryNormalized.includes("completed_courses")) {
      const userId = params[0];
      const userEnrollments = this.data.enrollments.filter(e => e.user_id === userId);

      const enrolled_courses = userEnrollments.length;
      const completed_courses = userEnrollments.filter(e => e.progress_percent >= 100).length;

      let sumProgress = 0;
      let sumLessons = 0;
      userEnrollments.forEach(e => {
        sumProgress += parseInt(e.progress_percent || 0);
        sumLessons += parseInt(e.lessons_completed || 0);
      });
      const average_progress = enrolled_courses > 0 ? Math.round(sumProgress / enrolled_courses) : 0;
      const weekly_progress = sumLessons;

      return {
        rows: [{
          enrolled_courses,
          completed_courses,
          average_progress,
          weekly_progress
        }],
        rowCount: 1
      };
    }

    // 18. Wallet Stats (Transactions balance)
    if (queryNormalized.includes("from transactions") && queryNormalized.includes("user_id = $1")) {
      const userId = params[0];
      const userTx = this.data.transactions.filter(t => t.user_id === userId);
      let balance = 0;
      userTx.forEach(t => {
        if (t.type === "credit") balance += t.amount;
        else balance -= t.amount;
      });
      return { rows: [{ balance }], rowCount: 1 };
    }

    // 19. Scholarship Status
    if (queryNormalized.includes("from scholarships") && queryNormalized.includes("user_id = $1")) {
      const userId = params[0];
      const statusObj = this.data.scholarships.find(s => s.user_id === userId) || { status: "approved" };
      return { rows: [statusObj], rowCount: 1 };
    }

    // 20. Profile Institutional Identity (Faculties/Departments)
    if (queryNormalized.includes("from profiles p") && queryNormalized.includes("left join faculties")) {
      const userId = params[0];
      const profileObj = this.data.profiles.find(p => p.user_id === userId) || {};
      return {
        rows: [{
          faculty_name: profileObj.faculty || "Faculty of Pure & Applied Sciences",
          department_name: profileObj.department || "Department of Computer Science"
        }],
        rowCount: 1
      };
    }

    // 21. Notifications Queries
    if (queryNormalized.includes("insert into notifications")) {
      const notif = {
        id: "n-" + Math.random().toString(36).substr(2, 9),
        user_id: params[0],
        title: params[1],
        message: params[2],
        type: params[3] || "info",
        link: params[4] || "/app/repository",
        created_at: new Date().toISOString(),
        read_at: null
      };
      this.data.notifications.push(notif);
      this.save();
      return { rows: [notif], rowCount: 1 };
    }

    if (queryNormalized.includes("update notifications") && queryNormalized.includes("set read_at")) {
      if (queryNormalized.includes("where id = $1 and user_id = $2")) {
        const notif = this.data.notifications.find(n => n.id === params[0] && n.user_id === params[1]);
        if (notif) {
          notif.read_at = new Date().toISOString();
          this.save();
        }
      } else if (queryNormalized.includes("where user_id = $1")) {
        this.data.notifications.forEach(n => {
          if (n.user_id === params[0]) n.read_at = new Date().toISOString();
        });
        this.save();
      }
      return { rows: [], rowCount: 1 };
    }

    if (queryNormalized.includes("from notifications") && queryNormalized.includes("user_id = $1")) {
      const userId = params[0];
      const list = this.data.notifications
        .filter(n => n.user_id === userId || n.user_id === "all" || n.user_id === "all_students")
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      return { rows: list, rowCount: list.length };
    }

    // 22. Category Stats
    if (queryNormalized.includes("group by c.category")) {
      const userId = params[0];
      const enrollList = this.data.enrollments.filter(e => e.user_id === userId);
      const catCount = {};
      enrollList.forEach(e => {
        const c = this.data.courses.find(course => course.id === e.course_id) || {};
        if (c.category) {
          catCount[c.category] = (catCount[c.category] || 0) + 1;
        }
      });
      const rows = Object.keys(catCount).map(category => ({
        category,
        hits: catCount[category]
      })).sort((a, b) => b.hits - a.hits);
      return { rows, rowCount: rows.length };
    }

    // 23. Messages Queries
    if (queryNormalized.includes("insert into messages")) {
      if (!this.data.messages) this.data.messages = [];
      const newMsg = {
        id: "msg-" + Math.random().toString(36).substr(2, 9),
        from_user_id: params[0],
        from_name: params[1],
        from_role: params[2],
        to_user_id: params[3],
        to_name: params[4],
        course_id: params[5],
        course_title: params[6],
        subject: params[7],
        message: params[8],
        category: params[9] || "general",
        created_at: new Date().toISOString(),
        read_at: null
      };
      this.data.messages.push(newMsg);

      // Automatically sync a corresponding notice into student's notifications list
      if (!this.data.notifications) this.data.notifications = [];
      this.data.notifications.push({
        id: "n-" + Math.random().toString(36).substr(2, 9),
        user_id: newMsg.to_user_id, // could be "all", "all_students" or a specific student's UUID
        title: `Announcement: ${newMsg.subject}`,
        message: newMsg.message,
        type: "info",
        link: "/app/messages",
        created_at: new Date().toISOString(),
        read_at: null
      });

      this.save();
      return { rows: [newMsg], rowCount: 1 };
    }

    if (queryNormalized.includes("from messages")) {
      if (!this.data.messages) this.data.messages = [];
      const userId = params && params[0] ? params[0] : null;
      const list = this.data.messages
        .filter(m => !userId || m.from_user_id === userId || m.to_user_id === userId || m.to_user_id === "all" || m.to_user_id === "all_students")
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      return { rows: list, rowCount: list.length };
    }

    if (queryNormalized.includes("update messages set read_at")) {
      if (!this.data.messages) this.data.messages = [];
      const msgId = params[0];
      const msg = this.data.messages.find(m => m.id === msgId);
      if (msg) {
        msg.read_at = new Date().toISOString();
        this.save();
      }
      return { rows: [], rowCount: 1 };
    }

    // Default Fallback: Empty array
    return { rows: [], rowCount: 0 };
  }
}

const pool = new MockPool();

async function healthCheckDb() {
  const result = await pool.query("SELECT NOW() AS now");
  return result.rows[0];
}

module.exports = {
  pool,
  healthCheckDb
};
