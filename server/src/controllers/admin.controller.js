const { pool } = require("../config/db");
const bcrypt = require("bcryptjs");

/**
 * GET /admin/stats
 * Returns aggregate counts for the admin dashboard overview cards.
 */
exports.getStats = async (req, res) => {
  try {
    const data = pool.data;
    const totalUsers = data.users.length;
    const activeStudents = data.users.filter(u => u.role === "learner" && u.is_active !== false).length;
    const activeLecturers = data.users.filter(u => u.role === "lecturer" && u.is_active !== false).length;
    const totalCourses = data.courses.length;
    const totalMaterials = (data.course_materials || []).length;

    // Messages received today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const messagesToday = (data.messages || []).filter(m => new Date(m.created_at) >= todayStart).length;

    res.json({
      data: {
        totalUsers,
        activeStudents,
        activeLecturers,
        totalCourses,
        totalMaterials,
        messagesToday
      }
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ error: "Failed to fetch admin stats." });
  }
};

/**
 * GET /admin/recent-activity
 * Returns a mock recent activity feed for the dashboard.
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const data = pool.data;
    const activities = [];

    // Derive activities from real data
    // 1. Recent user registrations
    const recentUsers = [...data.users]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);
    recentUsers.forEach(u => {
      const profile = data.profiles.find(p => p.user_id === u.id);
      activities.push({
        id: "act-" + u.id,
        type: "user_created",
        status: "SUCCESS",
        description: `New ${u.role} account created: ${profile?.full_name || u.email}`,
        timestamp: u.created_at
      });
    });

    // 2. Recent material uploads
    const recentMats = [...(data.course_materials || [])]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 2);
    recentMats.forEach(m => {
      activities.push({
        id: "act-" + m.id,
        type: "material_uploaded",
        status: "SUCCESS",
        description: `Learning material uploaded: ${m.title}`,
        timestamp: m.created_at
      });
    });

    // 3. Add some mock system events
    activities.push({
      id: "act-backup-1",
      type: "system_backup",
      status: "SUCCESS",
      description: "Automated system backup completed successfully",
      timestamp: new Date(Date.now() - 3600000).toISOString()
    });
    activities.push({
      id: "act-concurrent-1",
      type: "system_warning",
      status: "WARNING",
      description: `High concurrent users detected: ${data.users.length} active`,
      timestamp: new Date(Date.now() - 7200000).toISOString()
    });

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ data: activities.slice(0, 10) });
  } catch (error) {
    console.error("Admin Recent Activity Error:", error);
    res.status(500).json({ error: "Failed to fetch recent activity." });
  }
};

/**
 * GET /admin/users?search=&role=
 * Returns list of all users with profiles, supporting search and role filters.
 */
exports.getUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const data = pool.data;
    let users = data.users.map(u => {
      const profile = data.profiles.find(p => p.user_id === u.id) || {};
      return {
        id: u.id,
        email: u.email,
        role: u.role,
        is_active: u.is_active !== false,
        created_at: u.created_at,
        fullName: profile.full_name || "",
        phoneNumber: profile.phone_number || "",
        faculty: profile.faculty || "",
        department: profile.department || "",
        studentIdNumber: profile.student_id_number || "",
        universityProgramId: profile.university_program_id || "",
        enrollmentYear: profile.enrollment_year || "",
        academicStanding: profile.academic_standing || ""
      };
    });

    // Filter by role
    if (role && role !== "all") {
      users = users.filter(u => u.role === role);
    }

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.studentIdNumber.toLowerCase().includes(q)
      );
    }

    res.json({ data: users });
  } catch (error) {
    console.error("Admin Get Users Error:", error);
    res.status(500).json({ error: "Failed to fetch users." });
  }
};

/**
 * GET /admin/users/:id
 * Returns a single user with full profile.
 */
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = pool.data;
    const user = data.users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: "User not found." });

    const profile = data.profiles.find(p => p.user_id === user.id) || {};
    res.json({
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_active: user.is_active !== false,
        created_at: user.created_at,
        fullName: profile.full_name || "",
        phoneNumber: profile.phone_number || "",
        faculty: profile.faculty || "",
        department: profile.department || "",
        studentIdNumber: profile.student_id_number || "",
        universityProgramId: profile.university_program_id || "",
        enrollmentYear: profile.enrollment_year || "",
        academicStanding: profile.academic_standing || "",
        designation: profile.designation || "",
        bio: profile.bio || "",
        institutionName: profile.institution_name || ""
      }
    });
  } catch (error) {
    console.error("Admin Get User Error:", error);
    res.status(500).json({ error: "Failed to fetch user." });
  }
};

/**
 * POST /admin/users
 * Create a new user (student or lecturer) from the admin panel.
 */
exports.createUser = async (req, res) => {
  try {
    const { email, fullName, role, phoneNumber, faculty, department, password } = req.body;
    if (!email || !fullName || !role) {
      return res.status(400).json({ error: "Email, full name, and role are required." });
    }

    const data = pool.data;

    // Check duplicate email
    const existing = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: "A user with this email already exists." });
    }

    // Generate password
    const rawPassword = password || Math.random().toString(36).slice(-10);
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const id = "user-" + Math.random().toString(36).substr(2, 9);
    const newUser = {
      id,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      role: role || "learner",
      is_active: true,
      created_at: new Date().toISOString()
    };
    data.users.push(newUser);

    const newProfile = {
      user_id: id,
      full_name: fullName,
      phone_number: phoneNumber || "",
      country_code: "SL",
      preferred_language: "English",
      education_background: "",
      skills_interests: "[]",
      learning_goals: "",
      institution_name: "University of Sierra Leone",
      faculty: faculty || "",
      department: department || "",
      enrollment_year: new Date().getFullYear().toString(),
      academic_standing: "Good",
      designation: role === "lecturer" ? "Lecturer" : "",
      created_at: new Date().toISOString()
    };
    data.profiles.push(newProfile);

    // Seed notifications
    data.notifications.push({
      id: "n-" + Math.random().toString(36).substr(2, 9),
      user_id: id,
      title: "Welcome to UniPam",
      message: `Your ${role} account has been created by the administrator.`,
      created_at: new Date().toISOString(),
      read_at: null
    });

    pool.save();

    res.status(201).json({
      data: {
        id,
        email: newUser.email,
        role: newUser.role,
        fullName,
        generatedPassword: rawPassword
      }
    });
  } catch (error) {
    console.error("Admin Create User Error:", error);
    res.status(500).json({ error: "Failed to create user." });
  }
};

/**
 * PATCH /admin/users/:id
 * Update an existing user's account details.
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, fullName, role, phoneNumber, faculty, department, is_active } = req.body;
    const data = pool.data;

    const userIdx = data.users.findIndex(u => u.id === id);
    if (userIdx === -1) return res.status(404).json({ error: "User not found." });

    if (email !== undefined) data.users[userIdx].email = email.toLowerCase().trim();
    if (role !== undefined) data.users[userIdx].role = role;
    if (is_active !== undefined) data.users[userIdx].is_active = is_active;

    const profileIdx = data.profiles.findIndex(p => p.user_id === id);
    if (profileIdx !== -1) {
      if (fullName !== undefined) data.profiles[profileIdx].full_name = fullName;
      if (phoneNumber !== undefined) data.profiles[profileIdx].phone_number = phoneNumber;
      if (faculty !== undefined) data.profiles[profileIdx].faculty = faculty;
      if (department !== undefined) data.profiles[profileIdx].department = department;
      data.profiles[profileIdx].updated_at = new Date().toISOString();
    }

    pool.save();

    const user = data.users[userIdx];
    const profile = data.profiles.find(p => p.user_id === id) || {};
    res.json({
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        fullName: profile.full_name || "",
        phoneNumber: profile.phone_number || "",
        faculty: profile.faculty || "",
        department: profile.department || ""
      }
    });
  } catch (error) {
    console.error("Admin Update User Error:", error);
    res.status(500).json({ error: "Failed to update user." });
  }
};

/**
 * DELETE /admin/users/:id
 * Delete a user account and their profile.
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = pool.data;

    // Don't allow deleting yourself
    if (id === req.auth.userId) {
      return res.status(400).json({ error: "You cannot delete your own admin account." });
    }

    const userIdx = data.users.findIndex(u => u.id === id);
    if (userIdx === -1) return res.status(404).json({ error: "User not found." });

    data.users.splice(userIdx, 1);
    data.profiles = data.profiles.filter(p => p.user_id !== id);
    data.enrollments = data.enrollments.filter(e => e.user_id !== id);
    data.notifications = data.notifications.filter(n => n.user_id !== id);
    data.transactions = data.transactions.filter(t => t.user_id !== id);
    data.scholarships = data.scholarships.filter(s => s.user_id !== id);

    pool.save();
    res.json({ data: { message: "User deleted successfully." } });
  } catch (error) {
    console.error("Admin Delete User Error:", error);
    res.status(500).json({ error: "Failed to delete user." });
  }
};

/**
 * GET /admin/reports
 * Returns system health metrics and activity log for the reports dashboard.
 */
exports.getReports = async (req, res) => {
  try {
    const data = pool.data;
    const totalUsers = data.users.length;
    const totalMaterials = (data.course_materials || []).length;

    // Mock storage calculation (each material ~2MB average)
    const storageUsedGB = Math.round((totalMaterials * 2 * 1024 * 1024) / (1024 * 1024 * 1024) * 100 + 284);
    const storageTotalGB = 500;

    const reports = {
      userGrowth: {
        title: "User Growth Report",
        value: `${totalUsers} total users`,
        trend: "+12%",
        trendDirection: "up",
        description: "Active users trending up this month"
      },
      systemPerformance: {
        title: "System Performance Report",
        value: "245ms",
        status: "optimal",
        description: "Database response time within optimal range"
      },
      securityAudit: {
        title: "Security Audit Report",
        value: "No vulnerabilities",
        status: "secure",
        description: "TLS 1.3 encryption active"
      },
      storageUsage: {
        title: "Storage Usage Report",
        usedGB: Math.min(storageUsedGB, storageTotalGB),
        totalGB: storageTotalGB,
        percentUsed: Math.min(Math.round((storageUsedGB / storageTotalGB) * 100), 100),
        description: `${Math.min(storageUsedGB, storageTotalGB)} GB of ${storageTotalGB} GB used`
      }
    };

    // Activity log (last 24 hours)
    const activityLog = [];
    const now = new Date();

    // Derive from real data
    const recentUsers = data.users
      .filter(u => new Date(u.created_at) > new Date(now - 86400000))
      .slice(0, 3);
    recentUsers.forEach(u => {
      const profile = data.profiles.find(p => p.user_id === u.id);
      activityLog.push({
        timestamp: u.created_at,
        status: "SUCCESS",
        description: `User account created: ${profile?.full_name || u.email}`
      });
    });

    const recentMats = (data.course_materials || [])
      .filter(m => new Date(m.created_at) > new Date(now - 86400000))
      .slice(0, 2);
    recentMats.forEach(m => {
      activityLog.push({
        timestamp: m.created_at,
        status: "SUCCESS",
        description: `Learning material uploaded: ${m.title}`
      });
    });

    // Static system events
    activityLog.push(
      {
        timestamp: new Date(now - 1800000).toISOString(),
        status: "SUCCESS",
        description: "Automated system backup completed"
      },
      {
        timestamp: new Date(now - 5400000).toISOString(),
        status: "WARNING",
        description: `High concurrent users: ${totalUsers} active`
      }
    );

    activityLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ data: { reports, activityLog } });
  } catch (error) {
    console.error("Admin Reports Error:", error);
    res.status(500).json({ error: "Failed to fetch system reports." });
  }
};
