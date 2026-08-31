const { prisma } = require("../config/db");

class Assessment {
  static async create({ courseId, title, description, opensAt, closesAt, durationMinutes, createdBy }) {
    return await prisma.assessment.create({
      data: {
        course_id: courseId,
        title,
        description,
        opens_at: opensAt ? new Date(opensAt) : null,
        closes_at: closesAt ? new Date(closesAt) : null,
        duration_minutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
        created_by: createdBy
      }
    });
  }

  static async findByCourseId(courseId) {
    return await prisma.assessment.findMany({
      where: { course_id: courseId },
      orderBy: { created_at: "desc" }
    });
  }

  static async findById(id) {
    return await prisma.assessment.findUnique({
      where: { id }
    });
  }

  static async delete(id) {
    return await prisma.assessment.delete({
      where: { id }
    });
  }

  static async addQuestion({ assessmentId, questionText, options, correctIndex, points, orderIndex }) {
    return await prisma.assessmentQuestion.create({
      data: {
        assessment_id: assessmentId,
        question_text: questionText,
        options: JSON.stringify(options || []),
        correct_index: parseInt(correctIndex, 10),
        points: parseInt(points, 10),
        order_index: parseInt(orderIndex, 10)
      }
    });
  }

  static async findQuestionsByAssessmentId(assessmentId) {
    const list = await prisma.assessmentQuestion.findMany({
      where: { assessment_id: assessmentId },
      orderBy: { order_index: "asc" }
    });
    return list.map(q => ({
      ...q,
      options: JSON.parse(q.options || "[]")
    }));
  }

  static async findAttempt(assessmentId, userId) {
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: {
        assessment_id_user_id: {
          assessment_id: assessmentId,
          user_id: userId
        }
      }
    });
    if (!attempt) return null;
    return {
      ...attempt,
      answers: JSON.parse(attempt.answers || "[]")
    };
  }

  static async findAttemptsByAssessmentId(assessmentId) {
    const list = await prisma.assessmentAttempt.findMany({
      where: { assessment_id: assessmentId }
    });
    return list.map(attempt => ({
      ...attempt,
      answers: JSON.parse(attempt.answers || "[]")
    }));
  }

  static async createAttempt({ assessmentId, userId, answers, score, maxScore }) {
    const attempt = await prisma.assessmentAttempt.create({
      data: {
        assessment_id: assessmentId,
        user_id: userId,
        answers: JSON.stringify(answers || []),
        score: parseInt(score, 10),
        max_score: parseInt(maxScore, 10)
      }
    });
    return {
      ...attempt,
      answers: JSON.parse(attempt.answers || "[]")
    };
  }
}

module.exports = Assessment;
