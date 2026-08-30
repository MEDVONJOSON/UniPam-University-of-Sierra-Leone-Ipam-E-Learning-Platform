const Assessment = require("../models/assessment.model");
const Course = require("../models/course.model");
const User = require("../models/user.model");

function canManage(course, auth) {
  return auth.role === "admin" || course.instructor_id === auth.userId;
}

function getStatus(assessment) {
  const now = Date.now();
  const opensAt = new Date(assessment.opens_at).getTime();
  const closesAt = new Date(assessment.closes_at).getTime();
  if (now < opensAt) return "upcoming";
  if (now > closesAt) return "closed";
  return "open";
}

exports.listAssessments = async (req, res) => {
  const { courseId } = req.params;
  const assessments = await Assessment.findByCourseId(courseId);
  const data = assessments.map((a) => ({
    id: a.id,
    courseId: a.course_id,
    title: a.title,
    description: a.description,
    opensAt: a.opens_at,
    closesAt: a.closes_at,
    durationMinutes: a.duration_minutes,
    status: getStatus(a)
  }));
  res.json({ data });
};

exports.createAssessment = async (req, res) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ error: "Course not found." });
  if (!canManage(course, req.auth)) {
    return res.status(403).json({ error: "You do not teach this course." });
  }

  const { title, description = "", opensAt, closesAt, durationMinutes, questions } = req.body;
  if (!title || !opensAt || !closesAt) {
    return res.status(400).json({ error: "title, opensAt, and closesAt are required." });
  }
  if (new Date(closesAt).getTime() <= new Date(opensAt).getTime()) {
    return res.status(400).json({ error: "closesAt must be after opensAt." });
  }
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: "At least one question is required." });
  }
  for (const q of questions) {
    if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2) {
      return res.status(400).json({ error: "Each question needs text and at least 2 options." });
    }
    if (typeof q.correctIndex !== "number" || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      return res.status(400).json({ error: "Each question needs a valid correctIndex." });
    }
  }

  const assessment = await Assessment.create({
    courseId,
    title: String(title).trim(),
    description,
    opensAt,
    closesAt,
    durationMinutes: durationMinutes || 30,
    createdBy: req.auth.userId
  });

  const createdQuestions = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    createdQuestions.push(await Assessment.addQuestion({
      assessmentId: assessment.id,
      questionText: q.questionText,
      options: q.options,
      correctIndex: q.correctIndex,
      points: q.points || 1,
      orderIndex: i
    }));
  }

  res.status(201).json({ data: { ...assessment, questions: createdQuestions } });
};

exports.getAssessmentDetail = async (req, res) => {
  const { courseId, assessmentId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ error: "Course not found." });

  const assessment = await Assessment.findById(assessmentId);
  if (!assessment || assessment.course_id !== courseId) {
    return res.status(404).json({ error: "Assessment not found." });
  }

  const status = getStatus(assessment);
  const questions = await Assessment.findQuestionsByAssessmentId(assessmentId);
  const isOwner = canManage(course, req.auth);

  const base = {
    id: assessment.id,
    courseId: assessment.course_id,
    title: assessment.title,
    description: assessment.description,
    opensAt: assessment.opens_at,
    closesAt: assessment.closes_at,
    durationMinutes: assessment.duration_minutes,
    status
  };

  if (isOwner) {
    return res.json({
      data: {
        ...base,
        questions: questions.map((q) => ({
          id: q.id, questionText: q.question_text, options: q.options,
          correctIndex: q.correct_index, points: q.points
        }))
      }
    });
  }

  const myAttempt = await Assessment.findAttempt(assessmentId, req.auth.userId);
  if (myAttempt) {
    return res.json({
      data: {
        ...base,
        questions: questions.map((q) => ({
          id: q.id, questionText: q.question_text, options: q.options,
          correctIndex: q.correct_index, points: q.points
        })),
        myAttempt: {
          answers: myAttempt.answers, score: myAttempt.score,
          maxScore: myAttempt.max_score, submittedAt: myAttempt.submitted_at
        }
      }
    });
  }

  if (status !== "open") {
    return res.json({ data: base });
  }

  return res.json({
    data: {
      ...base,
      questions: questions.map((q) => ({ id: q.id, questionText: q.question_text, options: q.options, points: q.points }))
    }
  });
};

exports.deleteAssessment = async (req, res) => {
  const { courseId, assessmentId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ error: "Course not found." });
  if (!canManage(course, req.auth)) {
    return res.status(403).json({ error: "You do not teach this course." });
  }
  await Assessment.delete(assessmentId);
  res.status(204).send();
};

exports.submitAttempt = async (req, res) => {
  const { courseId, assessmentId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ error: "Course not found." });

  const assessment = await Assessment.findById(assessmentId);
  if (!assessment || assessment.course_id !== courseId) {
    return res.status(404).json({ error: "Assessment not found." });
  }

  if (getStatus(assessment) !== "open") {
    return res.status(400).json({ error: "This assessment is not currently open." });
  }

  const existing = await Assessment.findAttempt(assessmentId, req.auth.userId);
  if (existing) {
    return res.status(409).json({ error: "You have already submitted this assessment." });
  }

  const { answers } = req.body;
  const questions = await Assessment.findQuestionsByAssessmentId(assessmentId);
  if (!Array.isArray(answers) || answers.length !== questions.length) {
    return res.status(400).json({ error: `Expected ${questions.length} answers.` });
  }

  let score = 0;
  let maxScore = 0;
  questions.forEach((q, i) => {
    maxScore += q.points;
    if (answers[i] === q.correct_index) score += q.points;
  });

  const attempt = await Assessment.createAttempt({
    assessmentId, userId: req.auth.userId, answers, score, maxScore
  });

  res.status(201).json({
    data: { score: attempt.score, maxScore: attempt.max_score, submittedAt: attempt.submitted_at }
  });
};

exports.myAttempt = async (req, res) => {
  const { assessmentId } = req.params;
  const attempt = await Assessment.findAttempt(assessmentId, req.auth.userId);
  if (!attempt) return res.status(404).json({ error: "No attempt found." });
  res.json({
    data: { score: attempt.score, maxScore: attempt.max_score, submittedAt: attempt.submitted_at, answers: attempt.answers }
  });
};

exports.listAttempts = async (req, res) => {
  const { courseId, assessmentId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ error: "Course not found." });
  if (!canManage(course, req.auth)) {
    return res.status(403).json({ error: "You do not teach this course." });
  }

  const attempts = await Assessment.findAttemptsByAssessmentId(assessmentId);
  const data = await Promise.all(attempts.map(async (a) => {
    const student = await User.findById(a.user_id);
    return {
      userId: a.user_id,
      studentName: student?.full_name || student?.email || "Unknown",
      studentEmail: student?.email || "",
      score: a.score,
      maxScore: a.max_score,
      submittedAt: a.submitted_at
    };
  }));
  res.json({ data });
};
