const { prisma } = require("../config/db");

exports.listMessages = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const isLecturer = req.auth.role === "lecturer" || req.auth.role === "admin";
    const { departmentFilter, moduleFilter } = req.query;

    let orConditions = [];

    if (isLecturer) {
      const profile = await prisma.profile.findUnique({
        where: { user_id: userId }
      });
      
      const facultyId = profile?.faculty_id;
      const facultyText = profile?.faculty;

      orConditions.push({ from_user_id: userId });
      orConditions.push({ to_user_id: userId });

      let studentCondition = { from_role: "learner" };
      let profileFilters = {};

      if (facultyId) {
        profileFilters.faculty_id = facultyId;
      } else if (facultyText) {
        profileFilters.faculty = { contains: facultyText, mode: "insensitive" };
      }
      
      if (departmentFilter && departmentFilter !== "All Departments") {
        const program = await prisma.universityProgram.findFirst({
          where: { name: departmentFilter }
        });
        if (program) {
          profileFilters.university_program_id = program.id;
        } else {
          profileFilters.department = { contains: departmentFilter, mode: "insensitive" };
        }
      }

      if (Object.keys(profileFilters).length > 0) {
        studentCondition.sender = { profile: profileFilters };
      }

      if (moduleFilter && moduleFilter !== "All Modules") {
        studentCondition.course_title = { contains: moduleFilter, mode: "insensitive" };
      }

      orConditions.push(studentCondition);
    } else {
      // For students, first find lecturers who teach courses matching student's Year, Faculty, Department
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: { select: { faculty_id: true, department_id: true, current_academic_year: true } } }
      });
      const studentFacultyId = user?.profile?.faculty_id;
      const studentFacultyText = user?.profile?.faculty;
      const studentDeptId = user?.profile?.department_id;
      const studentDeptText = user?.profile?.department;
      
      const hasFaculty = studentFacultyId || studentFacultyText;
      const hasDept = studentDeptId || studentDeptText;
      
      let validLecturerIds = [];
      if (hasFaculty && hasDept) {
        const validLecturerProfiles = await prisma.profile.findMany({
          where: {
            user: { role: { in: ["lecturer", "admin"] } }
          },
          select: { user_id: true, faculty_id: true, faculty: true, department_id: true, department: true }
        });
        
        const validSet = new Set();
        for (const instProfile of validLecturerProfiles) {
          const facultyMatch = 
            (studentFacultyId && instProfile.faculty_id === studentFacultyId) ||
            (studentFacultyText && instProfile.faculty?.toLowerCase() === studentFacultyText.toLowerCase());
            
          const deptMatch = 
            (studentDeptId && instProfile.department_id === studentDeptId) ||
            (studentDeptText && instProfile.department?.toLowerCase() === studentDeptText.toLowerCase());
          
          if (facultyMatch && deptMatch) {
            validSet.add(instProfile.user_id);
          }
        }
        validLecturerIds = [...validSet];
      }
      
      // If validLecturerIds is empty, we must ensure they don't see ANY lecturer messages.
      // So if a message is from a lecturer, its from_user_id must be in validLecturerIds.
      orConditions = [
        { from_user_id: userId },
        {
          AND: [
            { to_user_id: { in: [userId, "all", "all_students", "all_faculty_students", "all_department_students"] } },
            {
              OR: [
                { from_role: { not: "lecturer" } }, // not from a lecturer
                { from_user_id: { in: validLecturerIds.length > 0 ? validLecturerIds : ["none"] } } // if from lecturer, must be valid
              ]
            }
          ]
        }
      ];
    }

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
          // Inquiry from student -> notify ONLY valid lecturers for this student (and admins)
          const studentProfile = await prisma.profile.findUnique({
            where: { user_id: userId },
            select: { faculty_id: true, faculty: true, department_id: true, department: true, current_academic_year: true }
          });
          
          const studentFacultyId = studentProfile?.faculty_id;
          const studentFacultyText = studentProfile?.faculty;
          const studentDeptId = studentProfile?.department_id;
          const studentDeptText = studentProfile?.department;
          
          const hasFaculty = studentFacultyId || studentFacultyText;
          const hasDept = studentDeptId || studentDeptText;
          
          let validLecturerIds = [];
          if (hasFaculty && hasDept) {
            const validLecturerProfiles = await prisma.profile.findMany({
              where: {
                user: { role: { in: ["lecturer", "admin"] } }
              },
              select: { user_id: true, faculty_id: true, faculty: true, department_id: true, department: true }
            });
            
            for (const instProfile of validLecturerProfiles) {
              const facultyMatch = 
                (studentFacultyId && instProfile.faculty_id === studentFacultyId) ||
                (studentFacultyText && instProfile.faculty?.toLowerCase() === studentFacultyText.toLowerCase());
                
              const deptMatch = 
                (studentDeptId && instProfile.department_id === studentDeptId) ||
                (studentDeptText && instProfile.department?.toLowerCase() === studentDeptText.toLowerCase());
              
              if (facultyMatch && deptMatch) {
                validLecturerIds.push(instProfile.user_id);
              }
            }
          }
          
          const targetRoleLecturers = await prisma.user.findMany({
            where: { 
              OR: [
                { role: "admin" },
                { role: "lecturer", id: { in: validLecturerIds.length > 0 ? validLecturerIds : ["none"] } }
              ]
            },
            select: { id: true }
          });
          targetUsers = targetRoleLecturers;
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
