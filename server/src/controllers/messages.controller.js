const { prisma } = require("../config/db");
const {
  findMatchingLecturers,
  findMatchingLecturerIds,
  isUuid
} = require("../utils/org-scope");

const BROADCAST_TARGETS = ["all", "all_students", "all_faculty_students", "all_department_students"];

exports.listMessages = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const isStudent = req.auth.role !== "lecturer" && req.auth.role !== "admin";

    if (!isStudent) {
      const list = await prisma.message.findMany({
        where: {
          OR: [
            { from_user_id: userId },
            { to_user_id: userId },
            { to_user_id: "all" },
            { to_user_id: "all_students" },
            { to_user_id: "all_faculty_students" },
            { to_user_id: "all_department_students" }
          ]
        },
        orderBy: { created_at: "desc" },
        take: 100
      });
      return res.json({ data: list || [] });
    }

    const lecturerIds = await findMatchingLecturerIds(userId);
    if (lecturerIds.length === 0) {
      const ownOnly = await prisma.message.findMany({
        where: {
          OR: [
            { from_user_id: userId },
            { to_user_id: userId }
          ]
        },
        orderBy: { created_at: "desc" },
        take: 100
      });
      return res.json({ data: ownOnly || [] });
    }

    const list = await prisma.message.findMany({
      where: {
        OR: [
          // Direct messages between student and in-scope lecturers
          {
            AND: [
              { from_user_id: userId },
              { to_user_id: { in: lecturerIds } }
            ]
          },
          {
            AND: [
              { to_user_id: userId },
              { from_user_id: { in: lecturerIds } }
            ]
          },
          // Broadcasts only from in-scope lecturers
          {
            AND: [
              { from_user_id: { in: lecturerIds } },
              { to_user_id: { in: BROADCAST_TARGETS } }
            ]
          }
        ]
      },
      orderBy: { created_at: "desc" },
      take: 100
    });

    res.json({ data: list || [] });
  } catch (error) {
    console.error("List messages error:", error);
    res.status(500).json({ error: "Failed to list messages." });
  }
};

exports.listFacultyLecturers = async (req, res) => {
  try {
    const isStudent = req.auth.role !== "lecturer" && req.auth.role !== "admin";
    if (!isStudent) {
      return res.json({ data: [] });
    }

    const lecturers = await findMatchingLecturers(req.auth.userId);
    res.json({ data: lecturers });
  } catch (error) {
    console.error("List faculty lecturers error:", error);
    res.status(500).json({ error: "Failed to list faculty lecturers." });
  }
};

exports.sendMessage = async (req, res) => {
  const userId = req.auth.userId;
  const user = req.auth;
  const {
    to_user_id = "all",
    to_name = "All Students",
    course_id = null,
    course_title = "General Academic Notice",
    subject,
    message,
    category = "general"
  } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ error: "Subject and message body are required." });
  }

  const senderRole = user.role || "student";
  const isStudent = senderRole !== "lecturer" && senderRole !== "admin";
  const senderName = user.name || user.email?.split("@")[0] || "University User";

  try {
    if (isStudent) {
      if (!isUuid(to_user_id)) {
        return res.status(400).json({ error: "Please select a lecturer from your faculty." });
      }
      const lecturerIds = await findMatchingLecturerIds(userId);
      if (!lecturerIds.includes(to_user_id)) {
        return res.status(403).json({
          error: "You can only message lecturers from your assigned faculty and department."
        });
      }
    }

    // 1. Insert message
    const createdMsg = await prisma.message.create({
      data: {
        from_user_id: userId,
        from_name: senderName,
        from_role: senderRole,
        to_user_id,
        to_name,
        course_id,
        course_title,
        subject,
        message,
        category
      }
    });

    // 2. Dispatch Live Notification to Recipient's Notification Bell
    try {
      const notifTitle = senderRole === "lecturer"
        ? `Lecturer Notification: ${senderName}`
        : `Student Inquiry from: ${senderName}`;
      const notifMessage = `[${course_title}] ${subject}: ${message.length > 90 ? message.substring(0, 90) + "..." : message}`;
      const notifLink = senderRole === "lecturer" ? "/app/dashboard" : "/app/teach";

      const isBroadcast = BROADCAST_TARGETS.includes(to_user_id);

      if (!isBroadcast && to_user_id) {
        await prisma.notification.create({
          data: {
            user_id: to_user_id,
            title: notifTitle,
            message: notifMessage,
            type: "message",
            link: notifLink
          }
        });
      } else if (senderRole === "lecturer") {
        // Broadcast to relevant students
        let targetUsers = [];
        const senderProfile = await prisma.profile.findUnique({
          where: { user_id: userId },
          select: { faculty: true, department: true, faculty_id: true, department_id: true }
        });

        if (to_user_id === "all_department_students" && (senderProfile?.department_id || senderProfile?.department)) {
          const matchingProfiles = await prisma.profile.findMany({
            where: {
              OR: [
                ...(senderProfile.department_id ? [{ department_id: senderProfile.department_id }] : []),
                ...(senderProfile.department ? [{ department: { contains: senderProfile.department, mode: "insensitive" } }] : [])
              ],
              user: { role: { not: "lecturer" }, id: { not: userId } }
            },
            select: { user_id: true }
          });
          targetUsers = matchingProfiles.map(p => ({ id: p.user_id }));
        } else if (to_user_id === "all_faculty_students" && (senderProfile?.faculty_id || senderProfile?.faculty)) {
          const matchingProfiles = await prisma.profile.findMany({
            where: {
              OR: [
                ...(senderProfile.faculty_id ? [{ faculty_id: senderProfile.faculty_id }] : []),
                ...(senderProfile.faculty ? [{ faculty: { contains: senderProfile.faculty, mode: "insensitive" } }] : [])
              ],
              user: { role: { not: "lecturer" }, id: { not: userId } }
            },
            select: { user_id: true }
          });
          targetUsers = matchingProfiles.map(p => ({ id: p.user_id }));
        }

        // Fallback if no matching profiles found or general broadcast
        if (targetUsers.length === 0) {
          const allStudents = await prisma.user.findMany({
            where: { role: { not: "lecturer" }, id: { not: userId } },
            select: { id: true }
          });
          targetUsers = allStudents;
        }

        if (targetUsers.length > 0) {
          await prisma.notification.createMany({
            data: targetUsers.map(target => ({
              user_id: target.id,
              title: notifTitle,
              message: notifMessage,
              type: "message",
              link: notifLink
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

exports.markMessageRead = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.message.update({
      where: { id },
      data: { read_at: new Date() }
    });
    res.json({ data: { success: true } });
  } catch (error) {
    console.error("Mark message read error:", error);
    res.status(500).json({ error: "Failed to mark message read." });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.userId;
    const canDeleteAnyVisibleMessage = req.auth.role === "admin";
    const message = await prisma.message.findFirst({
      where: {
        id,
        ...(canDeleteAnyVisibleMessage
          ? {
              OR: [
                { from_user_id: userId },
                { to_user_id: userId },
                { to_user_id: "all" },
                { to_user_id: "all_students" },
                { to_user_id: "all_faculty_students" },
                { to_user_id: "all_department_students" }
              ]
            }
          : { from_user_id: userId })
      },
      select: { id: true }
    });

    if (!message) return res.status(404).json({ error: "Message not found or access denied." });

    await prisma.message.delete({ where: { id: message.id } });
    res.json({ data: { success: true } });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ error: "Failed to delete message." });
  }
};
