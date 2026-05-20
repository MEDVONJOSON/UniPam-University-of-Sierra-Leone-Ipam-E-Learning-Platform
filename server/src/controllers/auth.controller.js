const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { env } = require("../config/env");

exports.register = async (req, res) => {
  const { email, password, fullName, role = "learner" } = req.body;
  
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: "Email, password, and fullName are required." });
  }

  try {
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role, fullName });

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
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  // Temporary Dev Bypass for USL Admin
  if (email.toLowerCase() === "admin@usl.edu.sl" && password === "registry2026") {
    const adminId = "00000000-0000-0000-0000-000000000001";
    const token = jwt.sign(
      { sub: adminId, email: "admin@usl.edu.sl", role: "admin" },
      env.jwtSecret,
      { expiresIn: "7d" }
    );
    return res.json({
      token,
      user: {
        id: adminId,
        email: "admin@usl.edu.sl",
        role: "admin",
        fullName: "USL Registry Admin (Dev)"
      }
    });
  }

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
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
        fullName: user.full_name
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed." });
  }
};
exports.getMe = async (req, res) => {
  const adminId = "00000000-0000-0000-0000-000000000001";
  if (req.auth.userId === adminId) {
    return res.json({
      user: {
        id: adminId,
        email: "admin@usl.edu.sl",
        role: "admin",
        fullName: "USL Registry Admin (Dev)"
      }
    });
  }

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
    if (userId === "00000000-0000-0000-0000-000000000001") {
      return res.status(400).json({ error: "Dev admin profile cannot be updated." });
    }

    const updatedProfile = await User.updateProfile(userId, req.body);
    res.json({ user: updatedProfile });
  } catch (error) {
    console.error("UpdateProfile error:", error);
    res.status(500).json({ error: "Failed to update profile." });
  }
};
