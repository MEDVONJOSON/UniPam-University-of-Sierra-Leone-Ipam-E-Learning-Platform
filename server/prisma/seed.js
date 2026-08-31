const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create default Provider
  const provider = await prisma.provider.upsert({
    where: { slug: "unipam" },
    update: {},
    create: {
      name: "UniPam",
      slug: "unipam",
      is_active: true
    }
  });
  console.log(`Created Provider: ${provider.name}`);

  // 2. Create Faculty
  const faculty = await prisma.faculty.upsert({
    where: { slug: "info-systems-tech" },
    update: {},
    create: {
      name: "Information Systems & Technology",
      slug: "info-systems-tech",
      dean_name: "Dr. Ernest Udeh",
      description: "Responsible for IPAM's computing, information systems, networking, cybersecurity, web development and IT education."
    }
  });
  console.log(`Created Faculty: ${faculty.name}`);

  // 3. Create Department
  const department = await prisma.department.upsert({
    where: { faculty_id_slug: { faculty_id: faculty.id, slug: "computer-science-it" } },
    update: {},
    create: {
      faculty_id: faculty.id,
      name: "Computer Science & Information Technology",
      slug: "computer-science-it",
      head_of_department: "Mr. Abdul Rahman Sesay"
    }
  });
  console.log(`Created Department: ${department.name}`);

  // 4. Create University Program
  const program = await prisma.universityProgram.create({
    data: {
      department_id: department.id,
      name: "B.Sc. in Information Technology",
      degree_level: "Degree",
      duration_years: 4
    }
  });
  console.log(`Created Program: ${program.name}`);

  // 5. Create default Admin User
  const adminPasswordHash = await bcrypt.hash("adminpassword123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@usl.edu.sl" },
    update: {},
    create: {
      email: "admin@usl.edu.sl",
      password_hash: adminPasswordHash,
      role: "admin",
      approval_status: "approved",
      is_active: true,
      profile: {
        create: {
          full_name: "System Administrator",
          phone_number: "+23277000000",
          faculty: "Information Systems & Technology",
          department: "Computer Science & Information Technology"
        }
      }
    }
  });
  console.log(`Created Admin User: ${adminUser.email}`);

  // 6. Create default Lecturer User
  const lecturerPasswordHash = await bcrypt.hash("lecturerpassword123", 10);
  const lecturerUser = await prisma.user.upsert({
    where: { email: "lecturer@usl.edu.sl" },
    update: {},
    create: {
      email: "lecturer@usl.edu.sl",
      password_hash: lecturerPasswordHash,
      role: "lecturer",
      approval_status: "approved",
      is_active: true,
      profile: {
        create: {
          full_name: "Dr. Alimamy Conteh",
          phone_number: "+23276111222",
          designation: "Senior Lecturer & Module Coordinator",
          faculty: "Information Systems & Technology",
          department: "Computer Science & Information Technology"
        }
      }
    }
  });
  console.log(`Created Lecturer User: ${lecturerUser.email}`);

  // 7. Create Courses
  const coursesToSeed = [
    { title: "DATABASE 1", code: "IT-201", category: "Database Systems" },
    { title: "NETWORKING", code: "IT-202", category: "Computer Networks" },
    { title: "WEB DESIGN", code: "IT-203", category: "Software Engineering" },
    { title: "DATA VISUALIZATION", code: "IT-301", category: "Data Science" },
    { title: "DATA ANALYSIS", code: "IT-302", category: "Data Science" },
    { title: "CYBER SECURITY", code: "IT-401", category: "Information Security" },
    { title: "PROJECT MANAGEMENT", code: "IT-402", category: "Management" },
    { title: "RESEARCH", code: "IT-403", category: "Research Methodology" }
  ];

  for (const courseInfo of coursesToSeed) {
    // A. Create University Module
    const uniModule = await prisma.universityModule.create({
      data: {
        program_id: program.id,
        module_code: courseInfo.code,
        module_name: courseInfo.title,
        academic_year: 2,
        semester: 1,
        credits: 3
      }
    });

    // B. Create Course inside the E-learning system
    const course = await prisma.course.create({
      data: {
        provider_id: provider.id,
        external_id: courseInfo.code,
        title: courseInfo.title,
        category: courseInfo.category,
        skill_level: "Intermediate",
        duration_label: "1 Semester",
        has_certificate: true,
        cost_type: "free",
        external_url: `https://unipam.edu.sl/courses/${courseInfo.code}`,
        description: `Official academic course module for ${courseInfo.title} (${courseInfo.code}) at the University of Sierra Leone, IPAM. Coordinated by ${lecturerUser.email}.`,
        is_internal: true,
        instructor_id: lecturerUser.id,
        instructor_name: "Dr. Alimamy Conteh",
        is_active: true,
        lms_modules: {
          create: {
            title: "Syllabus & Introduction",
            order_index: 0,
            lessons: {
              create: {
                title: "Lesson 1: Course Guide & Foundations",
                content_type: "article",
                article_content: `Welcome to ${courseInfo.title}! In this introductory session, we cover the core prerequisites, reading lists, and expectations for the semester.`,
                order_index: 0
              }
            }
          }
        },
        course_modules: {
          create: {
            title: "General Modules Syllabus",
            description: "Syllabus breakdown and resource repository.",
            sort_order: 0
          }
        }
      }
    });
    console.log(`Seeded Course Module: ${course.title} (${course.external_id})`);
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
