const { prisma } = require("../config/db");

const FACULTY_MAP = {
  f1: "Faculty of Accounting & Finance",
  f2: "Faculty of Information Systems & Technology",
  f3: "Faculty of Business Administration & Entrepreneurship",
  f4: "Faculty of Leadership & Governance",
  f5: "Faculty of Extra-Mural Studies"
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalize(value) {
  return (value || "").toString().trim().toLowerCase();
}

function stringsOverlap(a, b) {
  const left = normalize(a);
  const right = normalize(b);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

/**
 * Resolve a student's org scope from profile fields.
 * Faculty falls back to university_program_id prefix (f1–f5).
 */
function resolveStudentOrg(profile) {
  if (!profile) {
    return { faculty: "", department: "", facultyId: null, departmentId: null };
  }

  let faculty = (profile.faculty || "").trim();
  if (!faculty && profile.university_program_id) {
    const prefix = String(profile.university_program_id).split("::")[0];
    faculty = FACULTY_MAP[prefix] || "";
  }

  return {
    faculty,
    department: (profile.department || "").trim(),
    facultyId: profile.faculty_id || null,
    departmentId: profile.department_id || null
  };
}

/**
 * Practical match: faculty always; department only when the student has one.
 */
function lecturerMatchesStudent(studentOrg, lecturerProfile) {
  if (!studentOrg || !lecturerProfile) return false;

  const studentFaculty = normalize(studentOrg.faculty);
  const lecturerFaculty = normalize(lecturerProfile.faculty);
  const studentDept = normalize(studentOrg.department);
  const lecturerDept = normalize(lecturerProfile.department);

  let facultyOk = false;
  if (studentOrg.facultyId && lecturerProfile.faculty_id) {
    facultyOk = studentOrg.facultyId === lecturerProfile.faculty_id;
  }
  if (!facultyOk) {
    facultyOk = stringsOverlap(studentFaculty, lecturerFaculty);
  }
  if (!facultyOk) return false;

  if (!studentDept && !studentOrg.departmentId) {
    return true;
  }

  if (studentOrg.departmentId && lecturerProfile.department_id) {
    return studentOrg.departmentId === lecturerProfile.department_id;
  }

  return stringsOverlap(studentDept, lecturerDept);
}

function isUuid(value) {
  return typeof value === "string" && UUID_RE.test(value);
}

/**
 * Approved/active lecturers that match the student's org scope.
 * Returns [{ id, fullName, faculty, department }]
 */
async function findMatchingLecturers(studentUserId) {
  const student = await prisma.user.findUnique({
    where: { id: studentUserId },
    include: { profile: true }
  });

  const studentOrg = resolveStudentOrg(student?.profile);
  if (!studentOrg.faculty && !studentOrg.facultyId) {
    return [];
  }

  const lecturers = await prisma.user.findMany({
    where: {
      role: "lecturer",
      is_active: true,
      approval_status: "approved"
    },
    include: {
      profile: {
        select: {
          full_name: true,
          faculty: true,
          department: true,
          faculty_id: true,
          department_id: true
        }
      }
    }
  });

  return lecturers
    .filter((lecturer) => lecturerMatchesStudent(studentOrg, lecturer.profile))
    .map((lecturer) => ({
      id: lecturer.id,
      fullName: lecturer.profile?.full_name || lecturer.email,
      faculty: lecturer.profile?.faculty || "",
      department: lecturer.profile?.department || ""
    }));
}

async function findMatchingLecturerIds(studentUserId) {
  const lecturers = await findMatchingLecturers(studentUserId);
  return lecturers.map((l) => l.id);
}

async function courseInstructorMatchesStudent(studentUserId, course) {
  if (!course?.instructor_id) return false;

  const student = await prisma.user.findUnique({
    where: { id: studentUserId },
    include: { profile: true }
  });
  const studentOrg = resolveStudentOrg(student?.profile);
  if (!studentOrg.faculty && !studentOrg.facultyId) return false;

  const instructorProfile = await prisma.profile.findUnique({
    where: { user_id: course.instructor_id },
    select: {
      faculty: true,
      department: true,
      faculty_id: true,
      department_id: true
    }
  });

  return lecturerMatchesStudent(studentOrg, instructorProfile);
}

/**
 * True when the material's uploader (preferred) or course instructor matches the student org.
 */
async function materialAccessibleToStudent(studentUserId, material) {
  if (!material) return false;

  const student = await prisma.user.findUnique({
    where: { id: studentUserId },
    include: { profile: true }
  });
  const studentOrg = resolveStudentOrg(student?.profile);
  if (!studentOrg.faculty && !studentOrg.facultyId) return false;

  if (material.uploaded_by) {
    const uploaderProfile = await prisma.profile.findUnique({
      where: { user_id: material.uploaded_by },
      select: {
        faculty: true,
        department: true,
        faculty_id: true,
        department_id: true
      }
    });
    if (lecturerMatchesStudent(studentOrg, uploaderProfile)) return true;
  }

  if (material.course_id) {
    const course = await prisma.course.findUnique({
      where: { id: material.course_id },
      select: { instructor_id: true }
    });
    return courseInstructorMatchesStudent(studentUserId, course);
  }

  return false;
}

/**
 * Approved/active learners matching a lecturer's faculty (and department when the lecturer has one).
 * Used to "receive" new notes in the notification bell.
 */
async function findStudentsMatchingLecturer(lecturerUserId) {
  const lecturer = await prisma.user.findUnique({
    where: { id: lecturerUserId },
    include: {
      profile: {
        select: {
          faculty: true,
          department: true,
          faculty_id: true,
          department_id: true
        }
      }
    }
  });

  if (!lecturer?.profile) return [];

  const students = await prisma.user.findMany({
    where: {
      role: "learner",
      is_active: true,
      approval_status: "approved"
    },
    include: { profile: true }
  });

  return students
    .filter((student) => {
      const studentOrg = resolveStudentOrg(student.profile);
      return lecturerMatchesStudent(studentOrg, lecturer.profile);
    })
    .map((student) => student.id);
}

module.exports = {
  FACULTY_MAP,
  resolveStudentOrg,
  lecturerMatchesStudent,
  findMatchingLecturers,
  findMatchingLecturerIds,
  courseInstructorMatchesStudent,
  materialAccessibleToStudent,
  findStudentsMatchingLecturer,
  isUuid
};
