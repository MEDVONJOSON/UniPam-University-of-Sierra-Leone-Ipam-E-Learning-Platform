const { prisma } = require("../config/db");

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Build a Prisma profile-filter object that matches the three axes set by
 * the admin on "Edit User Account":
 *   • faculty           (text, e.g. "Faculty of Information Systems & Technology")
 *   • department        (text, e.g. "BSc Information Systems")
 *   • current_academic_year (int, e.g. 2  ← stored from "Year 2")
 *
 * Each axis is only added when the reference profile actually has that field
 * populated, so users without complete profiles still receive/see messages
 * gracefully.
 */
function buildProfileMatchFilter(refProfile) {
  const filter = {};

  if (refProfile?.faculty) {
    filter.faculty = { equals: refProfile.faculty, mode: "insensitive" };
  } else if (refProfile?.faculty_id) {
    filter.faculty_id = refProfile.faculty_id;
  }

  if (refProfile?.department) {
    filter.department = { equals: refProfile.department, mode: "insensitive" };
  }

  if (refProfile?.current_academic_year != null) {
    filter.current_academic_year = refProfile.current_academic_year;
  }

  return filter;
}

// ─── listMessages ────────────────────────────────────────────────────────────

exports.listMessages = async (req, res) => {
  try {
    const userId   = req.auth.userId;
    const isAdmin  = req.auth.role === "admin";
    const isLecturer = req.auth.role === "lecturer" || isAdmin;
    const { departmentFilter, moduleFilter } = req.query;

    let orConditions = [];

    if (isLecturer) {
      const profile = await prisma.profile.findUnique({
        where: { user_id: userId }
      });

      // Always show messages sent by or directly addressed to this lecturer
      orConditions.push({ from_user_id: userId });
      orConditions.push({ to_user_id: userId });

      // Build the base profile match from the lecturer's own profile
      // (faculty + department + academic year — all set by admin)
      const baseProfileFilter = buildProfileMatchFilter(profile);

      // ── Optional UI filters on top of the base match ──────────────────────
      // departmentFilter: user can narrow further from the dropdown
      if (departmentFilter && departmentFilter !== "All Departments" && departmentFilter !== "All") {
        // Override the department axis with the UI-selected value
        const program = await prisma.universityProgram.findFirst({
          where: { name: departmentFilter }
        });
        if (program) {
          baseProfileFilter.university_program_id = program.id;
          delete baseProfileFilter.department; // avoid double-filter
        } else {
          baseProfileFilter.department = {
            contains: departmentFilter,
            mode: "insensitive"
          };
        }
      }

      // Build the student message condition
      const studentCondition = {
        from_role: "learner",
        sender: { profile: baseProfileFilter }
      };

      if (moduleFilter && moduleFilter !== "All Modules") {
        studentCondition.course_title = {
          contains: moduleFilter,
          mode: "insensitive"
        };
      }

      orConditions.push(studentCondition);

    } else {
      // ── Student view ──────────────────────────────────────────────────────
      // Students see messages sent by them, addressed to them, or broadcasts
      orConditions = [
        { from_user_id: userId },
        { to_user_id: userId },
        { to_user_id: "all" },
        { to_user_id: "all_students" },
        { to_user_id: "all_faculty_students" },
        { to_user_id: "all_department_students" }
      ];
    }

    const list = await prisma.message.findMany({
      where: { OR: orConditions },
      orderBy: { created_at: "desc" },
      take: 100
    });

    res.json({ data: list || [] });
  } catch (error) {
    console.error("List messages error:", error);
    res.status(500).json({ error: "Failed to list messages." });
  }
};

// ─── getLecturerFilters ───────────────────────────────────────────────────────

exports.getLecturerFilters = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
      include: { faculty_rel: true }
    });

    let departments = [];
    if (profile?.faculty_id) {
      const programs = await prisma.universityProgram.findMany({
        where: { department: { faculty_id: profile.faculty_id } },
        orderBy: { name: "asc" }
      });
      departments = programs.map(p => p.name);
    } else if (profile?.department) {
      // Surface just the lecturer's own department so the UI still shows it
      departments = [profile.department];
    } else if (profile?.faculty) {
      departments = [profile.faculty];
    }

    const courses = await prisma.course.findMany({
      where: { instructor_id: userId },
      select: { id: true, title: true, external_id: true },
      orderBy: { title: "asc" }
    });

    res.json({
      data: {
        faculty: profile?.faculty_rel?.name || profile?.faculty || "Unknown Faculty",
        departments: [...new Set(departments)],
        modules: courses.map(c => ({
          id: c.id,
          title: c.title,
          code: c.external_id
        }))
      }
    });
  } catch (error) {
    console.error("Get lecturer filters error:", error);
    res.status(500).json({ error: "Failed to fetch filters." });
  }
};

// ─── sendMessage ─────────────────────────────────────────────────────────────

exports.sendMessage = async (req, res) => {
  const userId = req.auth.userId;
  const user   = req.auth;
  const {
    to_user_id   = "all",
    to_name      = "All Students",
    course_id    = null,
    course_title = "General Academic Notice",
    subject,
    message,
    category     = "general"
  } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ error: "Subject and message body are required." });
  }

  const senderRole = user.role || "student";
  const senderName = user.name || user.email?.split("@")[0] || "University User";

  try {
    // 1. Persist the message
    const createdMsg = await prisma.message.create({
      data: {
        from_user_id: userId,
        from_name:    senderName,
        from_role:    senderRole,
        to_user_id,
        to_name,
        course_id,
        course_title,
        subject,
        message,
        category
      }
    });

    // 2. Dispatch live notifications ──────────────────────────────────────────
    try {
      const notifTitle   = senderRole === "lecturer"
        ? `Lecturer Notification: ${senderName}`
        : `Student Inquiry from: ${senderName}`;
      const notifMessage = `[${course_title}] ${subject}: ${
        message.length > 90 ? message.substring(0, 90) + "..." : message
      }`;
      const notifLink    = senderRole === "lecturer" ? "/app/dashboard" : "/app/teach";

      const isBroadcast = ["all", "all_students", "all_faculty_students", "all_department_students"]
        .includes(to_user_id);

      if (!isBroadcast && to_user_id) {
        // ── Direct message to a specific user ─────────────────────────────
        await prisma.notification.create({
          data: {
            user_id: to_user_id,
            title:   notifTitle,
            message: notifMessage,
            type:    "message",
            link:    notifLink
          }
        });

      } else if (senderRole === "lecturer" || senderRole === "admin") {
        // ── Lecturer/admin broadcast to students ───────────────────────────
        const senderProfile = await prisma.profile.findUnique({
          where:  { user_id: userId },
          select: { faculty: true, department: true, faculty_id: true, department_id: true, current_academic_year: true }
        });

        let targetUsers = [];

        if (
          to_user_id === "all_department_students" &&
          (senderProfile?.department_id || senderProfile?.department)
        ) {
          const matchingProfiles = await prisma.profile.findMany({
            where: {
              OR: [
                ...(senderProfile.department_id ? [{ department_id: senderProfile.department_id }] : []),
                ...(senderProfile.department     ? [{ department: { contains: senderProfile.department, mode: "insensitive" } }] : [])
              ],
              user: { role: { not: "lecturer" }, id: { not: userId } }
            },
            select: { user_id: true }
          });
          targetUsers = matchingProfiles.map(p => ({ id: p.user_id }));

        } else if (
          to_user_id === "all_faculty_students" &&
          (senderProfile?.faculty_id || senderProfile?.faculty)
        ) {
          const matchingProfiles = await prisma.profile.findMany({
            where: {
              OR: [
                ...(senderProfile.faculty_id ? [{ faculty_id: senderProfile.faculty_id }] : []),
                ...(senderProfile.faculty     ? [{ faculty: { contains: senderProfile.faculty, mode: "insensitive" } }] : [])
              ],
              user: { role: { not: "lecturer" }, id: { not: userId } }
            },
            select: { user_id: true }
          });
          targetUsers = matchingProfiles.map(p => ({ id: p.user_id }));
        }

        // Fallback → all students
        if (targetUsers.length === 0) {
          const allStudents = await prisma.user.findMany({
            where:  { role: { not: "lecturer" }, id: { not: userId } },
            select: { id: true }
          });
          targetUsers = allStudents;
        }

        if (targetUsers.length > 0) {
          await prisma.notification.createMany({
            data: targetUsers.map(t => ({
              user_id: t.id,
              title:   notifTitle,
              message: notifMessage,
              type:    "message",
              link:    notifLink
            }))
          });
        }

      } else {
        // ── Student sending a message → notify matched lecturers ───────────
        // Fetch the sending student's profile (faculty + department + academic year)
        const studentProfile = await prisma.profile.findUnique({
          where:  { user_id: userId },
          select: { faculty: true, department: true, faculty_id: true, department_id: true, current_academic_year: true }
        });

        let targetLecturers = [];

        // Build match criteria for lecturers whose profile equals the student's
        if (studentProfile) {
          const profileMatch = {};

          if (studentProfile.faculty_id) {
            profileMatch.faculty_id = studentProfile.faculty_id;
          } else if (studentProfile.faculty) {
            profileMatch.faculty = { equals: studentProfile.faculty, mode: "insensitive" };
          }

          if (studentProfile.department) {
            profileMatch.department = { equals: studentProfile.department, mode: "insensitive" };
          }

          if (studentProfile.current_academic_year != null) {
            profileMatch.current_academic_year = studentProfile.current_academic_year;
          }

          if (Object.keys(profileMatch).length > 0) {
            const matchedProfiles = await prisma.profile.findMany({
              where: {
                ...profileMatch,
                user: { role: "lecturer", id: { not: userId } }
              },
              select: { user_id: true }
            });
            targetLecturers = matchedProfiles.map(p => ({ id: p.user_id }));
          }
        }

        // Fallback → all lecturers + admins (so no message goes undelivered)
        if (targetLecturers.length === 0) {
          const allLecturers = await prisma.user.findMany({
            where:  { role: { in: ["lecturer", "admin"] } },
            select: { id: true }
          });
          targetLecturers = allLecturers;
        }

        if (targetLecturers.length > 0) {
          await prisma.notification.createMany({
            data: targetLecturers.map(t => ({
              user_id: t.id,
              title:   notifTitle,
              message: notifMessage,
              type:    "message",
              link:    notifLink
            }))
          });
        }
      }

    } catch (notifErr) {
      console.warn("Notification dispatch notice:", notifErr.message);
    }

    res.status(201).json({ data: createdMsg });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
};

// ─── markMessageRead ──────────────────────────────────────────────────────────

exports.markMessageRead = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.message.update({
      where: { id },
      data:  { read_at: new Date() }
    });
    res.json({ data: { success: true } });
  } catch (error) {
    console.error("Mark message read error:", error);
    res.status(500).json({ error: "Failed to mark message read." });
  }
};

// ─── deleteMessage ────────────────────────────────────────────────────────────

exports.deleteMessage = async (req, res) => {
  try {
    const { id }     = req.params;
    const userId     = req.auth.userId;
    const canDeleteAny = req.auth.role === "admin";

    const message = await prisma.message.findFirst({
      where: {
        id,
        ...(canDeleteAny
          ? {
              OR: [
                { from_user_id: userId },
                { to_user_id:   userId },
                { to_user_id:   "all" },
                { to_user_id:   "all_students" },
                { to_user_id:   "all_faculty_students" },
                { to_user_id:   "all_department_students" }
              ]
            }
          : { from_user_id: userId })
      },
      select: { id: true }
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found or access denied." });
    }

    await prisma.message.delete({ where: { id: message.id } });
    res.json({ data: { success: true } });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ error: "Failed to delete message." });
  }
};
