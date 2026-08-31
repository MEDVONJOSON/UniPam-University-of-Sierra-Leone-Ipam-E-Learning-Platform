const { prisma } = require("../config/db");

exports.getDashboardSummary = async (req, res) => {
  const userId = req.auth.userId;

  try {
    // 1. Enrollment Stats
    const enrollments = await prisma.enrollment.findMany({
      where: { user_id: userId }
    });
    const enrolled_courses = enrollments.length;
    const completed_courses = enrollments.filter(e => Number(e.progress_percent) >= 100).length;
    
    let totalProgress = 0;
    let weekly_progress = 0;
    enrollments.forEach(e => {
      totalProgress += Number(e.progress_percent);
      weekly_progress += e.lessons_completed || 0;
    });
    const average_progress = enrolled_courses > 0 ? Math.round(totalProgress / enrolled_courses) : 0;

    // 2. Financial Balance (Rewards/Credits)
    const transactions = await prisma.transaction.findMany({
      where: { user_id: userId }
    });
    let balance = 0;
    transactions.forEach(t => {
      const amt = Number(t.amount);
      if (t.type === "credit") {
        balance += amt;
      } else {
        balance -= amt;
      }
    });

    // 3. Scholarship Status
    const scholarship = await prisma.scholarship.findFirst({
      where: { user_id: userId },
      orderBy: { applied_at: "desc" },
      select: { status: true }
    });

    // 4. Institutional Identity (Faculty/Department)
    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
      include: {
        faculty_rel: true,
        department_rel: true
      }
    });

    // 5. Recent Notifications
    const unread_notifications = await prisma.notification.count({
      where: { user_id: userId, read_at: null }
    });

    const summary = {
      enrolled_courses,
      completed_courses,
      average_progress,
      weekly_progress,
      credits: balance,
      rewards: Math.floor(balance / 10), // Mock conversion for rewards
      scholarship_status: scholarship?.status || "none",
      institution: {
        faculty_name: profile?.faculty_rel?.name || profile?.faculty || "Unassigned",
        department_name: profile?.department_rel?.name || profile?.department || "Unassigned"
      },
      unread_notifications
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
    // Group enrollments by course category to find preferred categories
    const enrollments = await prisma.enrollment.findMany({
      where: { user_id: userId },
      include: { course: { select: { category: true } } }
    });

    const categoryCounts = {};
    enrollments.forEach(e => {
      const cat = e.course?.category;
      if (cat) {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    });

    const preferred = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(entry => entry[0]);
    
    let courses;
    if (preferred.length === 0) {
      courses = await prisma.course.findMany({
        include: { provider: true },
        orderBy: { created_at: "desc" },
        take: 5
      });
    } else {
      courses = await prisma.course.findMany({
        where: { category: { in: preferred } },
        include: { provider: true },
        orderBy: { created_at: "desc" },
        take: 5
      });
    }

    const data = courses.map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      provider_name: c.provider.name,
      thumbnail_url: c.thumbnail_url,
      is_internal: c.is_internal
    }));

    res.json({ data });
  } catch (error) {
    console.error("Recommendations Error:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
};

exports.getEnrollments = async (req, res) => {
  const userId = req.auth.userId;
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { user_id: userId },
      include: {
        course: {
          include: {
            provider: true
          }
        }
      },
      orderBy: { enrolled_at: "desc" }
    });

    const data = enrollments.map(e => ({
      id: e.id,
      course_id: e.course_id,
      status: e.status,
      progress_percent: e.progress_percent,
      enrolled_at: e.enrolled_at,
      lessons_completed: e.lessons_completed,
      title: e.course.title,
      category: e.course.category,
      provider_name: e.course.provider.name,
      is_internal: e.course.is_internal
    }));

    res.json({ data });
  } catch (error) {
    console.error("Enrollments Error:", error);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
};
