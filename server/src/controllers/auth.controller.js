const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { env } = require("../config/env");


exports.register = async (req, res) => {
  const { email, password, fullName, studentIdNumber, universityProgramId } = req.body;

  if (!email || !password || !fullName || !studentIdNumber) {
    return res.status(400).json({ error: "Full name, email, and student ID are required." });
  }

  try {
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const existingById = await User.findByStudentId(studentIdNumber);
    if (existingById) {
      return res.status(409).json({ error: "Student ID already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      role: "learner",
      fullName,
      studentIdNumber,
      universityProgramId: universityProgramId || null,
      currentAcademicYear: null,
      currentSemester: null
    });

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        studentIdNumber: user.studentIdNumber,
        universityProgramId: universityProgramId || null,
        currentAcademicYear: user.currentAcademicYear || null,
        currentSemester: user.currentSemester || null
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed." });
  }
};

exports.login = async (req, res) => {
  const { studentId, email, password } = req.body;

  // Determine login mode: email (lecturer) or studentId (student)
  const loginByEmail = !!email;
  const identifier = loginByEmail ? email : studentId;

  if (!identifier || !password) {
    return res.status(400).json({ error: loginByEmail ? "Email and password are required." : "Student ID and password are required." });
  }

  try {
    const user = loginByEmail
      ? await User.findByEmail(identifier)
      : await User.findByStudentId(identifier);

    if (!user) {
      return res.status(401).json({ error: loginByEmail ? "Invalid email or password." : "Invalid Student ID or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: loginByEmail ? "Invalid email or password." : "Invalid Student ID or password." });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
        studentIdNumber: user.student_id_number,
        universityProgramId: user.university_program_id,
        currentAcademicYear: user.current_academic_year,
        currentSemester: user.current_semester
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed." });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.auth.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ user });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ error: "Failed to fetch user data." });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const updatedProfile = await User.updateProfile(userId, req.body);
    res.json({ user: updatedProfile });
  } catch (error) {
    console.error("UpdateProfile error:", error);
    res.status(500).json({ error: "Failed to update profile." });
  }
};
