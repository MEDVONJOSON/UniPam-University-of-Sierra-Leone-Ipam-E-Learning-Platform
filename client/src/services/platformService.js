import { apiRequest } from "./apiClient";

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

  const data = await apiRequest("/certificates", {
    method: "POST",
    body: formData
  });
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

// LMS Specific
export async function getCourseLMS(courseId) {
  const data = await apiRequest(`/lms/course/${courseId}`);
  return data.data;
}

export async function getLessonDetails(lessonId) {
  const data = await apiRequest(`/lms/lesson/${lessonId}`);
  return data.data;
}

