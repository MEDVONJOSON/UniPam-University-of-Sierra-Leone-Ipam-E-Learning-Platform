const { prisma } = require("../config/db");

class User {
  static async findByEmail(email) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { profile: true }
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      password_hash: user.password_hash,
      role: user.role,
      is_active: user.is_active,
      approval_status: user.approval_status,
      has_changed_password: user.has_changed_password,
      ...user.profile
    };
  }

  static async findByStudentId(studentId) {
    const profile = await prisma.profile.findUnique({
      where: { student_id_number: studentId.trim() },
      include: { user: true }
    });
    if (!profile) return null;
    return {
      id: profile.user.id,
      email: profile.user.email,
      password_hash: profile.user.password_hash,
      role: profile.user.role,
      is_active: profile.user.is_active,
      approval_status: profile.user.approval_status,
      has_changed_password: profile.user.has_changed_password,
      ...profile
    };
  }

  static async findById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      approval_status: user.approval_status,
      has_changed_password: user.has_changed_password,
      ...user.profile
    };
  }

  static async updateProfile(userId, data) {
    const {
      fullName, phoneNumber, countryCode, preferredLanguage,
      educationBackground, skillsInterests, learningGoals,
      profilePhotoUrl, designation, websiteUrl, bio, institutionName,
      faculty, department, enrollmentYear, academicStanding,
      facultyId, departmentId, studentIdNumber, universityProgramId,
      currentAcademicYear, currentSemester
    } = data;

    const academicYearInt = (currentAcademicYear !== undefined && currentAcademicYear !== null && currentAcademicYear !== "") ? parseInt(currentAcademicYear, 10) : undefined;
    const semesterInt = (currentSemester !== undefined && currentSemester !== null && currentSemester !== "") ? parseInt(currentSemester, 10) : undefined;

    const profile = await prisma.profile.update({
      where: { user_id: userId },
      data: {
        full_name: fullName !== undefined ? fullName : undefined,
        phone_number: phoneNumber !== undefined ? phoneNumber : undefined,
        country_code: countryCode !== undefined ? countryCode : undefined,
        preferred_language: preferredLanguage !== undefined ? preferredLanguage : undefined,
        education_background: educationBackground !== undefined ? educationBackground : undefined,
        skills_interests: skillsInterests !== undefined ? JSON.stringify(skillsInterests || []) : undefined,
        learning_goals: learningGoals !== undefined ? learningGoals : undefined,
        profile_photo_url: profilePhotoUrl !== undefined ? profilePhotoUrl : undefined,
        designation: designation !== undefined ? designation : undefined,
        website_url: websiteUrl !== undefined ? websiteUrl : undefined,
        bio: bio !== undefined ? bio : undefined,
        institution_name: institutionName !== undefined ? institutionName : undefined,
        faculty: faculty !== undefined ? faculty : undefined,
        department: department !== undefined ? department : undefined,
        enrollment_year: enrollmentYear !== undefined ? enrollmentYear : undefined,
        academic_standing: academicStanding !== undefined ? academicStanding : undefined,
        faculty_id: facultyId !== undefined ? facultyId : undefined,
        department_id: departmentId !== undefined ? departmentId : undefined,
        student_id_number: studentIdNumber !== undefined ? studentIdNumber : undefined,
        university_program_id: universityProgramId !== undefined ? universityProgramId : undefined,
        current_academic_year: academicYearInt,
        current_semester: semesterInt,
      }
    });
    return profile;
  }

  static async create({ email, passwordHash, role, fullName, studentIdNumber, universityProgramId, currentAcademicYear, currentSemester }) {
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        role: role,
        profile: {
          create: {
            full_name: fullName,
            student_id_number: studentIdNumber || null,
            university_program_id: universityProgramId || null,
            current_academic_year: currentAcademicYear ? parseInt(currentAcademicYear, 10) : null,
            current_semester: currentSemester ? parseInt(currentSemester, 10) : null,
          }
        }
      },
      include: {
        profile: true
      }
    });
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.profile.full_name,
      studentIdNumber: user.profile.student_id_number
    };
  }
}

module.exports = User;
