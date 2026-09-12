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

  // 4. Create the complete Information Systems & Technology program set
  const programs = [
    { name: "BSc Information Systems", degree_level: "Degree", duration_years: 4 },
    { name: "BSc Information Technology", degree_level: "Degree", duration_years: 4 },
    { name: "BSc In Computer Networking", degree_level: "Degree", duration_years: 4 },
    { name: "Diploma in Information Systems", degree_level: "Diploma", duration_years: 2 }
  ];

  for (const programData of programs) {
    const existingProgram = await prisma.universityProgram.findFirst({
      where: { department_id: department.id, name: programData.name }
    });

    if (!existingProgram) {
      const program = await prisma.universityProgram.create({
        data: { department_id: department.id, ...programData }
      });
      console.log(`Created Program: ${program.name}`);
    }
  }

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
