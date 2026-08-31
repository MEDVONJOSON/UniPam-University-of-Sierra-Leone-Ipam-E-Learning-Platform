const { prisma } = require("../config/db");

class LMS {
  // --- Modules ---
  static async findModulesByCourseId(courseId) {
    return await prisma.lmsModule.findMany({
      where: { course_id: courseId },
      orderBy: { order_index: "asc" }
    });
  }

  static async createModule(courseId, title, orderIndex = 0) {
    return await prisma.lmsModule.create({
      data: {
        course_id: courseId,
        title,
        order_index: orderIndex
      }
    });
  }

  // --- Lessons ---
  static async findLessonsByModuleId(moduleId) {
    return await prisma.lmsLesson.findMany({
      where: { module_id: moduleId },
      orderBy: { order_index: "asc" }
    });
  }

  static async findLessonById(lessonId) {
    return await prisma.lmsLesson.findUnique({
      where: { id: lessonId }
    });
  }

  static async createLesson(moduleId, data) {
    const { title, contentType, videoUrl, articleContent, orderIndex, durationMinutes } = data;
    return await prisma.lmsLesson.create({
      data: {
        module_id: moduleId,
        title,
        content_type: contentType,
        video_url: videoUrl,
        article_content: articleContent,
        order_index: orderIndex,
        duration_minutes: durationMinutes ? parseInt(durationMinutes, 10) : null
      }
    });
  }

  // --- Materials ---
  static async findMaterialsByLessonId(lessonId) {
    return await prisma.lmsMaterial.findMany({
      where: { lesson_id: lessonId }
    });
  }

  static async createMaterial(data) {
    const { lessonId, courseId, title, fileUrl, fileType } = data;
    return await prisma.lmsMaterial.create({
      data: {
        lesson_id: lessonId,
        course_id: courseId,
        title,
        file_url: fileUrl,
        file_type: fileType
      }
    });
  }

  // --- Assignments ---
  static async findAssignmentsByCourseId(courseId) {
    return await prisma.assignment.findMany({
      where: { course_id: courseId }
    });
  }

  // --- Quizzes ---
  static async findQuizzesByLessonId(lessonId) {
    return await prisma.quiz.findMany({
      where: { lesson_id: lessonId }
    });
  }

  static async findQuizQuestions(quizId) {
    const list = await prisma.quizQuestion.findMany({
      where: { quiz_id: quizId },
      orderBy: { order_index: "asc" }
    });
    return list.map(q => ({
      ...q,
      options: JSON.parse(q.options || "[]")
    }));
  }
}

module.exports = LMS;
