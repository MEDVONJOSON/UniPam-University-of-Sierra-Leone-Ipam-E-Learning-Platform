import { apiRequest, API_BASE, getToken } from "./apiClient";

export async function getCourses(filters = {}) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category && filters.category !== "all") params.set("category", filters.category);
  if (filters.level && filters.level !== "all") params.set("level", filters.level);
  if (filters.provider && filters.provider !== "all") params.set("provider", filters.provider);
  const qs = params.toString();
  const data = await apiRequest(`/courses${qs ? `?${qs}` : ""}`);
  return data.data || [];
}

export async function getEnrollments() {
  const data = await apiRequest("/enrollments");
  return data.data || [];
}

export async function enrollInCourse(courseId) {
  const data = await apiRequest("/enrollments", {
    method: "POST",
    body: JSON.stringify({ courseId })
  });
  return data;
}

export async function updateEnrollmentProgress(enrollmentId, progressPercent) {
  const data = await apiRequest(`/enrollments/${enrollmentId}/progress`, {
    method: "PATCH",
    body: JSON.stringify({ progressPercent })
  });
  return data.data;
}

export async function getDashboardSummary() {
  const data = await apiRequest("/dashboard/summary");
  return data.data;
}

export async function getDashboardRecommendations() {
  const data = await apiRequest("/dashboard/recommendations");
  return data.data || [];
}

export async function getCertificates() {
  const data = await apiRequest("/certificates");
  return data.data || [];
}

export async function uploadCertificate(payload) {
  const formData = new FormData();
  formData.append("title", payload.title);
  if (payload.courseId) formData.append("courseId", payload.courseId);
  if (payload.externalVerificationUrl) {
    formData.append("externalVerificationUrl", payload.externalVerificationUrl);
  }
  formData.append("isPublic", payload.isPublic ? "true" : "false");
  formData.append("certificateFile", payload.file);
  const data = await apiRequest("/certificates", { method: "POST", body: formData });
  return data.data;
}

export async function setCertificateVisibility(certificateId, isPublic) {
  const data = await apiRequest(`/certificates/${certificateId}/visibility`, {
    method: "PATCH",
    body: JSON.stringify({ isPublic })
  });
  return data.data;
}

export async function createCourse(payload) {
  const data = await apiRequest("/courses", {
    method: "POST",
    body: JSON.stringify({
      providerSlug: payload.providerSlug,
      title: payload.title,
      category: payload.category,
      level: payload.level,
      duration: payload.duration,
      costType: payload.costType,
      externalUrl: payload.externalUrl,
      description: payload.description,
      isInternal: payload.isInternal,
      thumbnailUrl: payload.thumbnailUrl
    })
  });
  return data.data;
}

export async function getMyCourses() {
  const data = await apiRequest("/courses/mine");
  return data.data || [];
}

// LMS Specific
export async function getCourseLMS(courseId) {
  const data = await apiRequest(`/lms/course/${courseId}`);
  return data.data;
}

export async function getLessonDetails(lessonId) {
  const data = await apiRequest(`/lms/lesson/${lessonId}`);
  return data.data;
}

// ─── Modules ─────────────────────────────────────────────────────────────────
export async function getCourseModules(courseId) {
  const data = await apiRequest(`/courses/${courseId}/modules`);
  return data.data || [];
}

export async function createCourseModule(courseId, payload) {
  const data = await apiRequest(`/courses/${courseId}/modules`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data.data;
}

export async function updateCourseModule(courseId, moduleId, payload) {
  const data = await apiRequest(`/courses/${courseId}/modules/${moduleId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
  return data.data;
}

export async function deleteCourseModule(courseId, moduleId) {
  await apiRequest(`/courses/${courseId}/modules/${moduleId}`, { method: "DELETE" });
}

// ─── Course Materials (Lecturer) ─────────────────────────────────────────────
export async function getCourseMaterials(courseId) {
  const data = await apiRequest(`/courses/${courseId}/materials`);
  return data.data || [];
}

export async function uploadCourseMaterial(courseId, payload) {
  const formData = new FormData();
  formData.append("title", payload.title);
  if (payload.description) formData.append("description", payload.description);
  if (payload.weekLabel) formData.append("weekLabel", payload.weekLabel);
  if (payload.moduleId) formData.append("moduleId", payload.moduleId);
  if (payload.materialCategory) formData.append("materialCategory", payload.materialCategory);
  if (payload.semester) formData.append("semester", payload.semester);
  if (payload.academicYear) formData.append("academicYear", payload.academicYear);
  if (payload.lectureNoteNumber) formData.append("lectureNoteNumber", payload.lectureNoteNumber);
  formData.append("isPublished", payload.isPublished !== false ? "true" : "false");
  if (payload.file) formData.append("file", payload.file);
  else if (payload.externalUrl) formData.append("externalUrl", payload.externalUrl);

  const data = await apiRequest(`/courses/${courseId}/materials`, {
    method: "POST",
    body: formData
  });
  return data.data;
}

export async function updateCourseMaterial(courseId, materialId, payload) {
  const data = await apiRequest(`/courses/${courseId}/materials/${materialId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
  return data.data;
}

export async function deleteCourseMaterial(courseId, materialId) {
  await apiRequest(`/courses/${courseId}/materials/${materialId}`, { method: "DELETE" });
}

// ─── Course Materials (Student — enrollment-gated) ────────────────────────────
export async function getEnrolledCourseMaterials(courseId) {
  const data = await apiRequest(`/courses/${courseId}/materials/published`);
  return data.data || [];
}

export function getDownloadUrl(courseId, materialId) {
  return `${API_BASE}/courses/${courseId}/materials/${materialId}/download`;
}

function getFilenameFromDisposition(disposition) {
  if (!disposition) return "";
  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1].replace(/"/g, ""));
  const match = disposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] || "";
}

export async function downloadCourseMaterial(courseId, materialId, fallbackFilename = "learning-material") {
  const token = getToken();
  const response = await fetch(getDownloadUrl(courseId, materialId), {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (!response.ok) {
    let data = {};
    try {
      data = await response.json();
    } catch (_) {
      data = {};
    }
    throw new Error(data.error || "Download failed. Please sign in again and try once more.");
  }

  const blob = await response.blob();
  const filename = getFilenameFromDisposition(response.headers.get("Content-Disposition")) || fallbackFilename;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── Repository (student — all enrolled courses, rich search) ─────────────────
export async function getRepositoryMaterials(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.courseId) params.set("courseId", filters.courseId);
  if (filters.semester) params.set("semester", filters.semester);
  if (filters.academicYear) params.set("academicYear", filters.academicYear);
  if (filters.materialType) params.set("materialType", filters.materialType);
  if (filters.weekLabel) params.set("weekLabel", filters.weekLabel);
  if (filters.lecturer) params.set("lecturer", filters.lecturer);
  const qs = params.toString();
  const data = await apiRequest(`/repository/materials${qs ? `?${qs}` : ""}`);
  return data.data || [];
}


export async function getSavedMaterials() {
  const data = await apiRequest("/repository/saved");
  return data.data || [];
}

export async function saveMaterial(courseId, materialId) {
  const data = await apiRequest(`/courses/${courseId}/materials/${materialId}/save`, {
    method: "POST"
  });
  return data.data;
}

export async function unsaveMaterial(courseId, materialId) {
  const data = await apiRequest(`/courses/${courseId}/materials/${materialId}/save`, {
    method: "DELETE"
  });
  return data.data;
}

// ─── Assessments ─────────────────────────────────────────────────────────────
export async function getAssessments(courseId) {
  const data = await apiRequest(`/courses/${courseId}/assessments`);
  return data.data || [];
}

export async function getAssessmentDetail(courseId, assessmentId) {
  const data = await apiRequest(`/courses/${courseId}/assessments/${assessmentId}`);
  return data.data;
}

export async function createAssessment(courseId, payload) {
  const data = await apiRequest(`/courses/${courseId}/assessments`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data.data;
}

export async function deleteAssessment(courseId, assessmentId) {
  await apiRequest(`/courses/${courseId}/assessments/${assessmentId}`, { method: "DELETE" });
}

export async function submitAssessmentAttempt(courseId, assessmentId, answers) {
  const data = await apiRequest(`/courses/${courseId}/assessments/${assessmentId}/attempt`, {
    method: "POST",
    body: JSON.stringify({ answers })
  });
  return data.data;
}

export async function getAssessmentAttempts(courseId, assessmentId) {
  const data = await apiRequest(`/courses/${courseId}/assessments/${assessmentId}/attempts`);
  return data.data || [];
}

// ─── Notifications ───────────────────────────────────────────────────────────
export async function getNotifications() {
  const res = await apiRequest("/notifications");
  return res.data || { notifications: [], unreadCount: 0 };
}

export async function markNotificationRead(id) {
  const res = await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
  return res.data;
}

export async function markAllNotificationsRead() {
  const res = await apiRequest("/notifications/read-all", { method: "PATCH" });
  return res.data;
}

// ─── Messages & Communication Hub ───────────────────────────────────────────
export async function getMessages() {
  const res = await apiRequest("/messages");
  return res.data || [];
}

export async function sendMessage(payload) {
  const res = await apiRequest("/messages", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return res.data;
}

export async function markMessageRead(id) {
  const res = await apiRequest(`/messages/${id}/read`, { method: "PATCH" });
  return res.data;
}
