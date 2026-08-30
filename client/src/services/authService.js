import { apiRequest, setToken } from "./apiClient";

const CURRENT_USER_KEY = "currentUser";

// ── Faculty map (mirrors RegisterPage) ───────────────────────────────────────
const FACULTY_MAP = {
  f1: "Faculty of Accounting & Finance",
  f2: "Faculty of Information Systems & Technology",
  f3: "Faculty of Business Administration & Entrepreneurship",
  f4: "Faculty of Leadership & Governance",
  f5: "Faculty of Extra-Mural Studies"
};

/**
 * Parses "f2::BSc Computer Science" → { facultyId, facultyName, program }
 */
function parseProgramId(universityProgramId) {
  if (!universityProgramId) return { facultyId: "", facultyName: "", program: "" };
  const [facultyId, ...rest] = universityProgramId.split("::");
  return {
    facultyId,
    facultyName: FACULTY_MAP[facultyId] || facultyId,
    program: rest.join("::")
  };
}

function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return;
  }
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
  } catch (_) {
    return null;
  }
}

export async function registerUser(payload) {
  const data = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      fullName: payload.name,
      studentIdNumber: payload.studentIdNumber || "",
      universityProgramId: payload.universityProgramId || null
    })
  });

  // If registration requires admin approval, return immediately without session
  if (data.pendingApproval) {
    return data;
  }

  if (data.token) {
    setToken(data.token);
  }

  if (data.user) {
    const parsed = parseProgramId(data.user.universityProgramId);
    setCurrentUser({
      id: data.user.id,
      name: data.user.fullName || "",
      email: data.user.email,
      role: data.user.role,
      studentIdNumber: data.user.studentIdNumber || "",
      universityProgramId: data.user.universityProgramId || null,
      facultyName: parsed.facultyName,
      program: parsed.program,
      currentAcademicYear: data.user.currentAcademicYear || null,
      currentSemester: data.user.currentSemester || null
    });
  }
  return data;
}

export async function loginUser(payload) {
  // Build request body based on login mode
  const body = payload.email
    ? { email: payload.email, password: payload.password }
    : { studentId: payload.studentId, password: payload.password };

  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(body)
  });
  setToken(data.token);
  const parsed = parseProgramId(data.user.universityProgramId);
  setCurrentUser({
    id: data.user.id,
    name: data.user.fullName || "",
    email: data.user.email,
    role: data.user.role,
    studentIdNumber: data.user.studentIdNumber || "",
    universityProgramId: data.user.universityProgramId || null,
    facultyName: parsed.facultyName,
    program: parsed.program,
    currentAcademicYear: data.user.currentAcademicYear || null,
    currentSemester: data.user.currentSemester || null,
    profilePhotoUrl: data.user.profilePhotoUrl || data.user.profile_photo_url || null
  });
  return data;
}

export async function changePassword(payload) {
  return await apiRequest("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function hydrateCurrentUser() {
  const data = await apiRequest("/auth/me");
  const parsed = parseProgramId(data.user.university_program_id || data.user.universityProgramId);
  setCurrentUser({
    id: data.user.id,
    name: data.user.full_name || data.user.fullName || "",
    email: data.user.email,
    role: data.user.role,
    studentIdNumber: data.user.student_id_number || data.user.studentIdNumber || "",
    universityProgramId: data.user.university_program_id || data.user.universityProgramId || null,
    facultyName: data.user.faculty || parsed.facultyName,
    program: parsed.program,
    currentAcademicYear: data.user.current_academic_year || data.user.currentAcademicYear || null,
    currentSemester: data.user.current_semester || data.user.currentSemester || null,
    profilePhotoUrl: data.user.profile_photo_url || data.user.profilePhotoUrl || null
  });
  return data.user;
}

export async function updateProfile(payload) {
  const data = await apiRequest("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
  const current = getCurrentUser();
  if (current) {
    const programId = data.user.university_program_id || data.user.universityProgramId;
    const parsed = parseProgramId(programId);
    setCurrentUser({
      ...current,
      name: data.user.full_name || data.user.fullName || current.name,
      studentIdNumber: data.user.student_id_number || data.user.studentIdNumber || current.studentIdNumber,
      universityProgramId: programId || current.universityProgramId,
      facultyName: data.user.faculty || parsed.facultyName || current.facultyName,
      program: parsed.program || current.program,
      currentAcademicYear: data.user.current_academic_year || data.user.currentAcademicYear || current.currentAcademicYear,
      currentSemester: data.user.current_semester || data.user.currentSemester || current.currentSemester,
      profilePhotoUrl: data.user.profile_photo_url || data.user.profilePhotoUrl || current.profilePhotoUrl
    });
  }
  return data.user;
}

export function logoutUser() {
  setToken("");
  setCurrentUser(null);
}
