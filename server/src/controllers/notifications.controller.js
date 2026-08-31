const { prisma } = require("../config/db");

exports.listNotifications = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const notifications = await prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      take: 50
    });
    const unreadCount = notifications.filter(n => !n.read_at).length;
    res.json({
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    console.error("List notifications error:", error);
    res.status(500).json({ error: "Failed to list notifications." });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.userId;
    await prisma.notification.updateMany({
      where: { id, user_id: userId },
      data: { read_at: new Date() }
    });
    res.json({ data: { success: true } });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({ error: "Failed to mark notification read." });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const userId = req.auth.userId;
    await prisma.notification.updateMany({
      where: { user_id: userId, read_at: null },
      data: { read_at: new Date() }
    });
    res.json({ data: { success: true } });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    res.status(500).json({ error: "Failed to mark notifications read." });
  }
};
