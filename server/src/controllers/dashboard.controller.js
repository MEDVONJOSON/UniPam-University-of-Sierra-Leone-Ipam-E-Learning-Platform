const { pool } = require("../config/db");

exports.getDashboardSummary = async (req, res) => {
  const userId = req.auth.userId;

  try {
    // 1. Enrollment Stats
    const enrollmentStats = await pool.query(
      `SELECT
          COUNT(*)::int AS enrolled_courses,
          COUNT(*) FILTER (WHERE progress_percent >= 100)::int AS completed_courses,
          COALESCE(ROUND(AVG(progress_percent))::int, 0) AS average_progress,
          COALESCE(SUM(lessons_completed), 0)::int AS weekly_progress
       FROM enrollments
       WHERE user_id = $1`,
      [userId]
    );

    // 2. Financial Balance (Rewards/Credits)
    const walletStats = await pool.query(
      `SELECT 
          COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) AS balance
       FROM transactions
       WHERE user_id = $1`,
      [userId]
    );

    // 3. Scholarship Status
    const scholarshipStats = await pool.query(
      `SELECT status, applied_at FROM scholarships 
       WHERE user_id = $1 
       ORDER BY applied_at DESC LIMIT 1`,
      [userId]
    );

    // 4. Institutional Identity (Faculty/Department)
    const profileIdentity = await pool.query(
      `SELECT f.name as faculty_name, d.name as department_name
       FROM profiles p
       LEFT JOIN faculties f ON f.id = p.faculty_id
       LEFT JOIN departments d ON d.id = p.department_id
       WHERE p.user_id = $1`,
      [userId]
    );

    // 5. Recent Notifications
    const recentNotifications = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 AND read_at IS NULL 
       ORDER BY created_at DESC LIMIT 5`,
      [userId]
    );

    const summary = {
      ...enrollmentStats.rows[0],
      credits: walletStats.rows[0]?.balance || 0,
      rewards: Math.floor((walletStats.rows[0]?.balance || 0) / 10), // Mock conversion for rewards
      scholarship_status: scholarshipStats.rows[0]?.status || 'none',
      institution: profileIdentity.rows[0] || { faculty_name: 'Unassigned', department_name: 'Unassigned' },
      unread_notifications: recentNotifications.rows.length
    };

    res.json({ data: summary });
  } catch (error) {
    console.error("Dashboard Summary Error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
};

exports.getRecommendations = async (req, res) => {
  const userId = req.auth.userId;
  try {
    const categoryStats = await pool.query(
      `SELECT c.category, COUNT(*)::int AS hits
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = $1
       GROUP BY c.category
       ORDER BY hits DESC
       LIMIT 2`,
      [userId]
    );

    const preferred = categoryStats.rows.map((row) => row.category);
    
    let recommendations;
    if (preferred.length === 0) {
      recommendations = await pool.query(
        `SELECT c.id, c.title, c.category, p.name AS provider_name, c.thumbnail_url, c.is_internal
         FROM courses c
         JOIN providers p ON p.id = c.provider_id
         ORDER BY c.created_at DESC
         LIMIT 5`
      );
    } else {
      recommendations = await pool.query(
        `SELECT c.id, c.title, c.category, p.name AS provider_name, c.thumbnail_url, c.is_internal
         FROM courses c
         JOIN providers p ON p.id = c.provider_id
         WHERE c.category = ANY($1::text[])
         ORDER BY c.created_at DESC
         LIMIT 5`,
        [preferred]
      );
    }
    res.json({ data: recommendations.rows });
  } catch (error) {
    console.error("Recommendations Error:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
};

exports.getEnrollments = async (req, res) => {
  const userId = req.auth.userId;
  try {
    const result = await pool.query(
      `SELECT e.id, e.course_id, e.status, e.progress_percent, e.enrolled_at, e.lessons_completed,
              c.title, c.category, p.name AS provider_name, c.is_internal
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       JOIN providers p ON p.id = c.provider_id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [userId]
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Enrollments Error:", error);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
};
