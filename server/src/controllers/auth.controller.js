const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { env } = require("../config/env");


exports.register = async (req, res) => {
  const { email, password, fullName, studentIdNumber, universityProgramId } = req.body;

  if (!email || !fullName || !studentIdNumber) {
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

    // Default password is the student ID number
    const defaultPassword = (password && password.trim()) || studentIdNumber.trim();
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const user = await User.create({
      email,
      passwordHash,
      role: "learner",
      fullName,
      studentIdNumber: studentIdNumber.trim(),
      universityProgramId: universityProgramId || null,
      currentAcademicYear: "Year 1",
      currentSemester: "Semester 1",
      approvalStatus: "pending",
      isActive: false,
      hasChangedPassword: false
    });

    res.status(201).json({
      pendingApproval: true,
      message: `Registration submitted successfully! Your account is pending Registry Admin approval. Once approved by the administrator, you can log in using your Student ID (${studentIdNumber}) and your default password.`,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        studentIdNumber: user.studentIdNumber,
        universityProgramId: universityProgramId || null,
        approvalStatus: "pending",
        defaultPassword: defaultPassword,
        hasChangedPassword: false
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

    // Check account approval & active status
    if (user.approval_status === "pending" || user.approvalStatus === "pending" || user.is_active === false) {
      return res.status(403).json({
        error: "Your student account is pending Administrator approval. Please wait for the University Registry to approve your registration before logging in."
      });
    }

    if (user.approval_status === "rejected" || user.approvalStatus === "rejected") {
      return res.status(403).json({
        error: "Your account registration was not approved. Please contact the University Registry Office."
      });
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
        currentSemester: user.current_semester,
        hasChangedPassword: user.has_changed_password === true
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
    res.json({
      user: {
        ...user,
        hasChangedPassword: user.has_changed_password === true
      }
    });
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

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.auth.userId;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters long." });
  }

  try {
    const { prisma } = require("../config/db");
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Verify current password if provided
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password does not match." });
      }
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: newHash,
        has_changed_password: true
      }
    });

    res.json({
      hasChangedPassword: true,
      message: "Password updated successfully! The default password notice has been cleared. Please use your new password for future logins."
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to update password." });
  }
};
