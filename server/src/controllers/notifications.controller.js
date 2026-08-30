const { pool } = require("../config/db");

exports.listNotifications = async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [req.auth.userId]
  );
  const unreadCount = result.rows.filter(n => !n.read_at).length;
  res.json({
    data: {
      notifications: result.rows,
      unreadCount
    }
  });
};

exports.markRead = async (req, res) => {
  const { id } = req.params;
  await pool.query(
    `UPDATE notifications
     SET read_at = NOW()
     WHERE id = $1 AND user_id = $2`,
    [id, req.auth.userId]
  );
  res.json({ data: { success: true } });
};

exports.markAllRead = async (req, res) => {
  await pool.query(
    `UPDATE notifications
     SET read_at = NOW()
     WHERE user_id = $1 AND read_at IS NULL`,
    [req.auth.userId]
  );
  res.json({ data: { success: true } });
};
