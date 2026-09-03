const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("Enrolling all learners and assigning all coordinators...");

  // 1. Create a default learner if not exists
  const defaultStudentEmail = "student@usl.edu.sl";
  let defaultStudent = await prisma.user.findUnique({
    where: { email: defaultStudentEmail }
  });

  if (!defaultStudent) {
    const studentPasswordHash = await bcrypt.hash("studentpassword123", 10);
    defaultStudent = await prisma.user.create({
      data: {
        email: defaultStudentEmail,
        password_hash: studentPasswordHash,
        role: "learner",
        approval_status: "approved",
        is_active: true,
        profile: {
          create: {
            full_name: "John Doe (Student)",
            phone_number: "+23277999999",
            faculty: "Information Systems & Technology",
            department: "Computer Science & Information Technology"
          }
        }
      }
    });
    console.log(`Created default learner: ${defaultStudentEmail}`);
  }

  const courses = await prisma.course.findMany();
  const learners = await prisma.user.findMany({ where: { role: 'learner' }, include: { profile: true } });
  const lecturers = await prisma.user.findMany({ where: { role: 'lecturer' }, include: { profile: true } });

  console.log(`Found ${courses.length} courses, ${learners.length} learners, ${lecturers.length} lecturers.`);

  // 2. Enroll all learners in all courses
  for (const learner of learners) {
    for (const course of courses) {
      await prisma.enrollment.upsert({
        where: {
          user_id_course_id: {
            user_id: learner.id,
            course_id: course.id
          }
        },
        update: {},
        create: {
          user_id: learner.id,
          course_id: course.id,
          status: "enrolled",
          progress_percent: 0,
          lessons_completed: 0
        }
      });
      console.log(`Enrolled student ${learner.email} in ${course.title}`);
    }
  }

  // 3. Assign coordinators for all courses
  if (lecturers.length > 0) {
    const primaryLecturer = lecturers[0];
    for (const course of courses) {
      await prisma.course.update({
        where: { id: course.id },
        data: {
          instructor_id: primaryLecturer.id,
          instructor_name: primaryLecturer.profile?.full_name || "Dr. Alimamy Conteh"
        }
      });
      console.log(`Assigned course ${course.title} to coordinator ${primaryLecturer.email}`);
    }
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
