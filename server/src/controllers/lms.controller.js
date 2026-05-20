const LMS = require("../models/lms.model");
const Course = require("../models/course.model");

exports.getCourseLMS = async (req, res) => {
  const { courseId } = req.params;
  
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found." });

    const modules = await LMS.findModulesByCourseId(courseId);
    
    // For each module, get lessons
    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await LMS.findLessonsByModuleId(mod.id);
        return {
          ...mod,
          lessons
        };
      })
    );

    res.json({
      data: {
        course,
        modules: modulesWithLessons
      }
    });
  } catch (error) {
    console.error("GetCourseLMS error:", error);
    res.status(500).json({ error: "Failed to fetch course content." });
  }
};

exports.getLessonDetails = async (req, res) => {
  const { lessonId } = req.params;
  try {
    const lesson = await LMS.findLessonById(lessonId);
    if (!lesson) return res.status(404).json({ error: "Lesson not found." });

    const [materials, quizzes] = await Promise.all([
      LMS.findMaterialsByLessonId(lessonId),
      LMS.findQuizzesByLessonId(lessonId)
    ]);

    const quizzesWithQuestions = await Promise.all(
      quizzes.map(async (q) => {
        const questions = await LMS.findQuizQuestions(q.id);
        return { ...q, questions };
      })
    );

    res.json({
      data: {
        ...lesson,
        materials,
        quizzes: quizzesWithQuestions
      }
    });
  } catch (error) {
    console.error("GetLessonDetails error:", error);
    res.status(500).json({ error: "Failed to fetch lesson details." });
  }
};

exports.createModule = async (req, res) => {
  const { courseId } = req.params;
  const { title, orderIndex } = req.body;
  const mod = await LMS.createModule(courseId, title, orderIndex);
  res.status(201).json({ data: mod });
};

exports.createLesson = async (req, res) => {
  const { moduleId } = req.params;
  const lesson = await LMS.createLesson(moduleId, req.body);
  res.status(201).json({ data: lesson });
};
