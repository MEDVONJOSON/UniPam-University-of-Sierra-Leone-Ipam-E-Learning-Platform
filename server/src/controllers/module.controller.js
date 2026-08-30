const Module = require("../models/module.model");
const Course = require("../models/course.model");

function canManage(course, auth) {
  return auth.role === "admin" || course.instructor_id === auth.userId;
}

exports.listModules = async (req, res) => {
  const { courseId } = req.params;
  const modules = await Module.findByCourseId(courseId);
  res.json({ data: modules });
};

exports.createModule = async (req, res) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ error: "Course not found." });
  if (!canManage(course, req.auth)) {
    return res.status(403).json({ error: "You do not teach this course." });
  }

  const { title, description = "" } = req.body;
  if (!title) return res.status(400).json({ error: "title is required." });

  const sortOrder = await Module.getNextSortOrder(courseId);
  const mod = await Module.create({ courseId, title: title.trim(), description, sortOrder });
  res.status(201).json({ data: mod });
};

exports.updateModule = async (req, res) => {
  const { courseId, moduleId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ error: "Course not found." });
  if (!canManage(course, req.auth)) {
    return res.status(403).json({ error: "You do not teach this course." });
  }

  const existing = await Module.findById(moduleId);
  if (!existing || existing.course_id !== courseId) {
    return res.status(404).json({ error: "Module not found." });
  }

  const { title, description, sortOrder } = req.body;
  const updated = await Module.update(moduleId, { title, description, sortOrder });
  res.json({ data: updated });
};

exports.deleteModule = async (req, res) => {
  const { courseId, moduleId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ error: "Course not found." });
  if (!canManage(course, req.auth)) {
    return res.status(403).json({ error: "You do not teach this course." });
  }

  const existing = await Module.findById(moduleId);
  if (!existing || existing.course_id !== courseId) {
    return res.status(404).json({ error: "Module not found." });
  }

  await Module.delete(moduleId);
  res.status(204).send();
};
