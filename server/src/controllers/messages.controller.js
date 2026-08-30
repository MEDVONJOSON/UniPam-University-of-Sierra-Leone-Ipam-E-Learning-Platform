const { pool } = require("../config/db");

exports.listMessages = async (req, res) => {
  const userId = req.auth.userId;
  const result = await pool.query(
    `SELECT * FROM messages
     WHERE from_user_id = $1 OR to_user_id = $1 OR to_user_id = 'all'
     ORDER BY created_at DESC
     LIMIT 100`,
    [userId]
  );
  res.json({ data: result.rows || [] });
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

  // 1. Insert message
  const result = await pool.query(
    `INSERT INTO messages (from_user_id, from_name, from_role, to_user_id, to_name, course_id, course_title, subject, message, category, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
     RETURNING *`,
    [userId, senderName, senderRole, to_user_id, to_name, course_id, course_title, subject, message, category]
  );

  const createdMsg = result.rows[0] || {
    id: "msg-" + Math.random().toString(36).substr(2, 9),
    from_user_id: userId,
    from_name: senderName,
    from_role: senderRole,
    to_user_id,
    to_name,
    course_id,
    course_title,
    subject,
    message,
    category,
    created_at: new Date().toISOString()
  };

  // 2. Dispatch Live Notification to Recipient's Notification Bell
  try {
    const notifTitle = senderRole === "lecturer"
      ? `Lecturer Notification: ${senderName}`
      : `Student Inquiry from: ${senderName}`;
    const notifMessage = `[${course_title}] ${subject}: ${message.length > 90 ? message.substring(0, 90) + "..." : message}`;
    const notifLink = senderRole === "lecturer" ? "/app/dashboard" : "/app/teach";

    // If sent to a specific user
    if (to_user_id && to_user_id !== "all" && to_user_id !== "all_students") {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES ($1, $2, $3, $4, $5)`,
        [to_user_id, notifTitle, notifMessage, "message", notifLink]
      );
    } else {
      // If broadcast to all students/enrolled students, create notification for users
      const usersRes = await pool.query(`SELECT id, role FROM users`);
      const targetUsers = usersRes.rows.filter(u => senderRole === "lecturer" ? (u.role !== "lecturer" && u.id !== userId) : (u.role === "lecturer" || u.role === "admin"));
      for (const target of targetUsers) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, link)
           VALUES ($1, $2, $3, $4, $5)`,
          [target.id, notifTitle, notifMessage, "message", notifLink]
        );
      }
    }
  } catch (notifErr) {
    console.warn("Notification dispatch notice:", notifErr.message);
  }

  res.status(201).json({ data: createdMsg });
};

exports.markMessageRead = async (req, res) => {
  const { id } = req.params;
  await pool.query(
    `UPDATE messages SET read_at = NOW() WHERE id = $1`,
    [id]
  );
  res.json({ data: { success: true } });
};
