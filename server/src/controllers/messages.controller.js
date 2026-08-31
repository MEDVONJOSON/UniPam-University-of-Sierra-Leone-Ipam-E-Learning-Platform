const { prisma } = require("../config/db");

exports.listMessages = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const list = await prisma.message.findMany({
      where: {
        OR: [
          { from_user_id: userId },
          { to_user_id: userId },
          { to_user_id: "all" }
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
      if (to_user_id && to_user_id !== "all" && to_user_id !== "all_students") {
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
        // If broadcast to all students/enrolled students, create notification for users
        const allUsers = await prisma.user.findMany({
          select: { id: true, role: true }
        });
        const targetUsers = allUsers.filter(u => senderRole === "lecturer" ? (u.role !== "lecturer" && u.id !== userId) : (u.role === "lecturer" || u.role === "admin"));
        
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
