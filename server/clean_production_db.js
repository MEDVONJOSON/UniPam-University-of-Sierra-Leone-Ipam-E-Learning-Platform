const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting production database cleanup...");

  // Delete Gamification data (Certificates)
  await prisma.certificateAsset.deleteMany({});
  console.log("Deleted all Certificates.");

  // Delete Saved Materials
  await prisma.savedMaterial.deleteMany({});
  console.log("Deleted all Saved Materials.");

  // Delete CourseMaterials & CourseModules
  await prisma.courseMaterial.deleteMany({});
  console.log("Deleted all Course Materials.");

  await prisma.courseModule.deleteMany({});
  console.log("Deleted all Course Modules.");

  // Delete LMS structure
  await prisma.lmsMaterial.deleteMany({});
  console.log("Deleted all LMS Materials.");

  await prisma.submission.deleteMany({});
  console.log("Deleted all Submissions.");

  await prisma.assignment.deleteMany({});
  console.log("Deleted all Assignments.");

  await prisma.quizResult.deleteMany({});
  console.log("Deleted all Quiz Results.");

  await prisma.quizQuestion.deleteMany({});
  console.log("Deleted all Quiz Questions.");

  await prisma.quiz.deleteMany({});
  console.log("Deleted all Quizzes.");

  await prisma.lmsLesson.deleteMany({});
  console.log("Deleted all LMS Lessons.");

  await prisma.lmsModule.deleteMany({});
  console.log("Deleted all LMS Modules.");

  // Assessments
  await prisma.assessmentAttempt.deleteMany({});
  console.log("Deleted all Assessment Attempts.");

  await prisma.assessmentQuestion.deleteMany({});
  console.log("Deleted all Assessment Questions.");

  await prisma.assessment.deleteMany({});
  console.log("Deleted all Assessments.");

  // Reviews, events, etc.
  await prisma.review.deleteMany({});
  await prisma.learningEvent.deleteMany({});
  await prisma.liveSession.deleteMany({});
  await prisma.discussion.deleteMany({});
  await prisma.scholarship.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.auditLog.deleteMany({});
  console.log("Deleted other course related data.");

  // Delete Course & Enrollments
  await prisma.enrollment.deleteMany({});
  console.log("Deleted all Enrollments.");

  await prisma.course.deleteMany({});
  console.log("Deleted all Courses.");

  await prisma.universityModule.deleteMany({});
  console.log("Deleted all University Modules.");

  // Delete Messages & Notifications
  await prisma.message.deleteMany({});
  console.log("Deleted all Messages.");

  await prisma.notification.deleteMany({});
  console.log("Deleted all Notifications.");

  // Delete Users & Profiles (except admin)
  await prisma.profile.deleteMany({
    where: {
      user: {
        email: { not: "admin@usl.edu.sl" }
      }
    }
  });
  console.log("Deleted all User Profiles (except Admin).");

  await prisma.user.deleteMany({
    where: {
      email: { not: "admin@usl.edu.sl" }
    }
  });
  console.log("Deleted all Users (except Admin).");

  console.log("Production database cleanup completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error cleaning database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
