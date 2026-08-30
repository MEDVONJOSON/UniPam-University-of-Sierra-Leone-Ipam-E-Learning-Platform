const { pool } = require("../config/db");

class User {
  static async findByEmail(email) {
    const result = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.role, p.* 
       FROM users u 
       LEFT JOIN profiles p ON p.user_id = u.id 
       WHERE u.email = $1`,
      [email.toLowerCase().trim()]
    );
    return result.rows[0];
  }

  static async findByStudentId(studentId) {
    const result = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.role, p.*
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE p.student_id_number = $1`,
      [studentId.trim()]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT u.id, u.email, u.role, p.* 
       FROM users u 
       LEFT JOIN profiles p ON p.user_id = u.id 
       WHERE u.id = $1`,
      [id]
    );
    return result.rows[0];
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

    const academicYearInt = (currentAcademicYear !== undefined && currentAcademicYear !== null && currentAcademicYear !== "") ? parseInt(currentAcademicYear, 10) : null;
    const semesterInt = (currentSemester !== undefined && currentSemester !== null && currentSemester !== "") ? parseInt(currentSemester, 10) : null;

    const result = await pool.query(
      `UPDATE profiles SET
        full_name = COALESCE($2, full_name),
        phone_number = COALESCE($3, phone_number),
        country_code = COALESCE($4, country_code),
        preferred_language = COALESCE($5, preferred_language),
        education_background = COALESCE($6, education_background),
        skills_interests = COALESCE($7, skills_interests),
        learning_goals = COALESCE($8, learning_goals),
        profile_photo_url = COALESCE($9, profile_photo_url),
        designation = COALESCE($10, designation),
        website_url = COALESCE($11, website_url),
        bio = COALESCE($12, bio),
        institution_name = COALESCE($13, institution_name),
        faculty = COALESCE($14, faculty),
        department = COALESCE($15, department),
        enrollment_year = COALESCE($16, enrollment_year),
        academic_standing = COALESCE($17, academic_standing),
        faculty_id = COALESCE($18, faculty_id),
        department_id = COALESCE($19, department_id),
        student_id_number = COALESCE($20, student_id_number),
        university_program_id = COALESCE($21, university_program_id),
        current_academic_year = COALESCE($22, current_academic_year),
        current_semester = COALESCE($23, current_semester),
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING *`,
      [
        userId, fullName, phoneNumber, countryCode, preferredLanguage,
        educationBackground, JSON.stringify(skillsInterests || []), learningGoals,
        profilePhotoUrl, designation, websiteUrl, bio, institutionName,
        faculty, department, enrollmentYear, academicStanding,
        facultyId, departmentId, studentIdNumber, universityProgramId,
        academicYearInt, semesterInt
      ]
    );
    return result.rows[0];
  }

  static async create({ email, passwordHash, role, fullName, studentIdNumber, universityProgramId, currentAcademicYear, currentSemester }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      const userResult = await client.query(
        "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role",
        [email.toLowerCase().trim(), passwordHash, role]
      );
      
      const user = userResult.rows[0];
      
      await client.query(
        "INSERT INTO profiles (user_id, full_name, student_id_number, university_program_id, current_academic_year, current_semester) VALUES ($1, $2, $3, $4, $5, $6)",
        [user.id, fullName, studentIdNumber || null, universityProgramId || null, currentAcademicYear || null, currentSemester || null]
      );
      
      await client.query("COMMIT");
      return { ...user, fullName, studentIdNumber };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = User;
