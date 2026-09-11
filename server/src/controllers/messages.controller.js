const { prisma } = require("../config/db");

exports.listMessages = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const isStudent = req.auth.role !== "lecturer" && req.auth.role !== "admin";

    const orConditions = [
      { from_user_id: userId },
      { to_user_id: userId },
      { to_user_id: "all" },
      { to_user_id: "all_students" },
      { to_user_id: "all_faculty_students" },
      { to_user_id: "all_department_students" }
    ];

    const list = await prisma.message.findMany({
      where: {
        OR: orConditions
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
  const senderName = user.name || user.email?.split("@")[0] || "University User";

  try {
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

      // If sent to a specific user
      const isBroadcast = ["all", "all_students", "all_faculty_students", "all_department_students"].includes(to_user_id);

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
      } else {
        // Broadcast to relevant students
        let targetUsers = [];
        if (senderRole === "lecturer") {
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
        } else {
          // Inquiry from student -> notify lecturers/admins
          const lecturers = await prisma.user.findMany({
            where: { role: { in: ["lecturer", "admin"] } },
            select: { id: true }
          });
          targetUsers = lecturers;
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
