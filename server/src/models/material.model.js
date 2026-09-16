const { prisma } = require("../config/db");
const { findMatchingLecturerIds } = require("../utils/org-scope");

function sanitizeLectureNoteNumber(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s || null;
}

class Material {
  static async findByCourseId(courseId) {
    const list = await prisma.courseMaterial.findMany({
      where: { course_id: courseId },
      include: {
        module: { select: { title: true, sort_order: true } }
      },
      orderBy: [
        { module: { sort_order: 'asc' } },
        { created_at: 'asc' }
      ]
    });

    const uploaderIds = [...new Set(list.map(cm => cm.uploaded_by).filter(Boolean))];
    const uploaders = await prisma.user.findMany({
      where: { id: { in: uploaderIds } },
      select: { id: true, email: true, profile: { select: { full_name: true } } }
    });
    const uploaderMap = Object.fromEntries(uploaders.map(u => [u.id, { email: u.email, name: u.profile?.full_name }]));

    return list.map(cm => {
      const uName = cm.uploaded_by ? uploaderMap[cm.uploaded_by]?.name || null : null;
      return {
        ...cm,
        file_size_bytes: cm.file_size_bytes ? Number(cm.file_size_bytes) : null,
        file_size: cm.file_size_bytes ? Number(cm.file_size_bytes) : null,
        module_title: cm.module?.title || null,
        module_sort_order: cm.module?.sort_order || null,
        uploader_email: cm.uploaded_by ? uploaderMap[cm.uploaded_by]?.email || null : null,
        uploader_name: uName,
        lecturer_name: uName
      };
    });
  }

  static async findPublishedByCourseId(courseId, userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    const isStaff = user?.role === "admin" || user?.role === "lecturer";

    let enrollment = await prisma.enrollment.findUnique({
      where: { user_id_course_id: { user_id: userId, course_id: courseId } }
    });

    // If student is not explicitly enrolled, allow only when uploader/instructor matches org scope
    if (!enrollment && !isStaff) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, is_internal: true, category: true, instructor_id: true }
      });

      const { materialAccessibleToStudent } = require("../utils/org-scope");
      const probe = { course_id: courseId, uploaded_by: course?.instructor_id || null };
      const allowed = await materialAccessibleToStudent(userId, probe);
      if (allowed) {
        enrollment = await prisma.enrollment.upsert({
          where: { user_id_course_id: { user_id: userId, course_id: courseId } },
          create: { user_id: userId, course_id: courseId, status: "enrolled" },
          update: {}
        }).catch(() => null);
      }
    }

    if (!enrollment && !isStaff) return null;

    const list = await prisma.courseMaterial.findMany({
      where: { course_id: courseId, is_published: true },
      include: {
        module: { select: { title: true, sort_order: true } },
        saved_materials: { where: { user_id: userId } }
      },
      orderBy: [
        { module: { sort_order: 'asc' } },
        { created_at: 'asc' }
      ]
    });

    const uploaderIds = [...new Set(list.map(cm => cm.uploaded_by).filter(Boolean))];
    const profiles = await prisma.profile.findMany({
      where: { user_id: { in: uploaderIds } },
      select: { user_id: true, full_name: true }
    });
    const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p.full_name]));

    return list.map(cm => {
      const uName = cm.uploaded_by ? profileMap[cm.uploaded_by] || null : null;
      return {
        ...cm,
        file_size_bytes: cm.file_size_bytes ? Number(cm.file_size_bytes) : null,
        file_size: cm.file_size_bytes ? Number(cm.file_size_bytes) : null,
        module_title: cm.module?.title || null,
        module_sort_order: cm.module?.sort_order || null,
        uploader_name: uName,
        lecturer_name: uName,
        is_saved: cm.saved_materials.length > 0
      };
    });
  }

  static async findAllForEnrolledCourses(userId, {
    search, category, courseId,
    semester, academicYear, materialType, weekLabel, lecturer
  } = {}) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    const isStaff = user?.role === "admin" || user?.role === "lecturer";

    const where = {
      is_published: true
    };

    if (isStaff) {
      // Staff can browse all published materials
    } else {
      const matchingLecturerIds = await findMatchingLecturerIds(userId);
      if (matchingLecturerIds.length === 0) return [];

      // See notes only from lecturers in the student's faculty (and department when set)
      where.OR = [
        { uploaded_by: { in: matchingLecturerIds } },
        { course: { instructor_id: { in: matchingLecturerIds } } }
      ];
    }

    if (courseId) {
      where.course_id = courseId;
    }
    if (category) {
      where.material_category = category;
    }
    if (semester) {
      where.semester = { contains: semester, mode: 'insensitive' };
    }
    if (academicYear) {
      where.academic_year = academicYear;
    }
    if (materialType) {
      where.material_type = materialType;
    }
    if (weekLabel) {
      where.week_label = { contains: weekLabel, mode: 'insensitive' };
    }

    const list = await prisma.courseMaterial.findMany({
      where,
      include: {
        course: { select: { title: true, category: true, instructor_id: true } },
        module: { select: { title: true } },
        saved_materials: { where: { user_id: userId } }
      },
      orderBy: { created_at: 'desc' },
      take: 500
    });

    if (!isStaff) {
      const courseIds = [...new Set(list.map((cm) => cm.course_id).filter(Boolean))];
      for (const cId of courseIds) {
        prisma.enrollment.upsert({
          where: { user_id_course_id: { user_id: userId, course_id: cId } },
          create: { user_id: userId, course_id: cId, status: "enrolled" },
          update: {}
        }).catch(() => {});
      }
    }

    const uploaderIds = [...new Set(list.map(cm => cm.uploaded_by).filter(Boolean))];
    const profiles = await prisma.profile.findMany({
      where: { user_id: { in: uploaderIds } },
      select: { user_id: true, full_name: true, faculty: true, department: true }
    });
    const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));

    let result = list.map(cm => {
      const uploader = cm.uploaded_by ? profileMap[cm.uploaded_by] : null;
      const uName = uploader?.full_name || null;
      return {
        ...cm,
        file_size_bytes: cm.file_size_bytes ? Number(cm.file_size_bytes) : null,
        file_size: cm.file_size_bytes ? Number(cm.file_size_bytes) : null,
        course_title: cm.course.title,
        course_department: cm.course.category || uploader?.department || uploader?.faculty || null,
        module_title: cm.module?.title || null,
        uploader_name: uName,
        lecturer_name: uName,
        lecturer_faculty: uploader?.faculty || null,
        lecturer_department: uploader?.department || null,
        is_saved: cm.saved_materials.length > 0
      };
    });

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(cm =>
        (cm.title || "").toLowerCase().includes(q) ||
        (cm.description || "").toLowerCase().includes(q) ||
        (cm.course_title || "").toLowerCase().includes(q) ||
        (cm.module_title || "").toLowerCase().includes(q) ||
        (cm.week_label || "").toLowerCase().includes(q) ||
        (cm.original_filename || "").toLowerCase().includes(q) ||
        (cm.uploader_name || "").toLowerCase().includes(q) ||
        (cm.lecturer_name || "").toLowerCase().includes(q) ||
        (cm.lecturer_faculty || "").toLowerCase().includes(q) ||
        (cm.lecturer_department || "").toLowerCase().includes(q)
      );
    }

    if (lecturer) {
      const l = lecturer.toLowerCase();
      result = result.filter(cm =>
        (cm.uploader_name || "").toLowerCase().includes(l) ||
        (cm.lecturer_name || "").toLowerCase().includes(l)
      );
    }

    return result;
  }

  static async findById(id) {
    const cm = await prisma.courseMaterial.findUnique({
      where: { id },
      include: { course: { select: { title: true } } }
    });
    if (!cm) return null;
    return {
      ...cm,
      file_size_bytes: cm.file_size_bytes ? Number(cm.file_size_bytes) : null,
      file_size: cm.file_size_bytes ? Number(cm.file_size_bytes) : null,
      course_title: cm.course.title
    };
  }

  static async create({
    courseId, moduleId, title, description, weekLabel,
    materialType, materialCategory, fileUrl, uploadedBy,
    originalFilename, fileSizeBytes, semester, academicYear,
    lectureNoteNumber, isPublished
  }) {
    const sanitizedNoteNumber = sanitizeLectureNoteNumber(lectureNoteNumber);
    const createData = {
      course_id: courseId,
      module_id: moduleId || null,
      title,
      description: description || "",
      week_label: weekLabel || "",
      material_type: materialType,
      material_category: materialCategory || "lecture_notes",
      file_url: fileUrl,
      uploaded_by: uploadedBy,
      original_filename: originalFilename || null,
      file_size_bytes: fileSizeBytes ? BigInt(fileSizeBytes) : null,
      semester: semester || null,
      academic_year: academicYear || null,
      lecture_note_number: sanitizedNoteNumber,
      is_published: isPublished !== false
    };

    let cm;
    try {
      cm = await prisma.courseMaterial.create({
        data: createData
      });
    } catch (err) {
      // Fallback: If deployed Prisma client still expects an Int for lecture_note_number
      if (err.message && (err.message.includes("lecture_note_number") || err.message.includes("Expected Int"))) {
        const num = sanitizedNoteNumber ? parseInt(sanitizedNoteNumber.replace(/\D/g, ""), 10) : null;
        createData.lecture_note_number = isNaN(num) ? null : num;
        cm = await prisma.courseMaterial.create({
          data: createData
        });
      } else {
        throw err;
      }
    }
    
    return {
      ...cm,
      file_size_bytes: cm.file_size_bytes ? Number(cm.file_size_bytes) : null,
      file_size: cm.file_size_bytes ? Number(cm.file_size_bytes) : null
    };
  }

  static async update(id, fields) {
    const data = {};
    const allowed = ["title", "description", "week_label", "module_id",
                     "material_category", "semester", "academic_year",
                     "lecture_note_number", "is_published"];
                     
    for (const [key, val] of Object.entries(fields)) {
      const col = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      if (allowed.includes(col)) {
        if (col === "lecture_note_number") {
          data[col] = sanitizeLectureNoteNumber(val);
        } else {
          data[col] = val;
        }
      }
    }

    let cm;
    try {
      cm = await prisma.courseMaterial.update({
        where: { id },
        data
      });
    } catch (err) {
      if (err.message && (err.message.includes("lecture_note_number") || err.message.includes("Expected Int"))) {
        const raw = data.lecture_note_number;
        const num = raw ? parseInt(String(raw).replace(/\D/g, ""), 10) : null;
        data.lecture_note_number = isNaN(num) ? null : num;
        cm = await prisma.courseMaterial.update({
          where: { id },
          data
        });
      } else {
        throw err;
      }
    }
    
    return {
      ...cm,
      file_size_bytes: cm.file_size_bytes ? Number(cm.file_size_bytes) : null,
      file_size: cm.file_size_bytes ? Number(cm.file_size_bytes) : null
    };
  }

  static async incrementDownloadCount(id) {
    await prisma.courseMaterial.update({
      where: { id },
      data: { download_count: { increment: 1 } }
    });
  }

  static async delete(id) {
    const cm = await prisma.courseMaterial.delete({
      where: { id }
    });
    return {
      ...cm,
      file_size_bytes: cm.file_size_bytes ? Number(cm.file_size_bytes) : null
    };
  }

  static async saveMaterial(userId, materialId) {
    await prisma.savedMaterial.upsert({
      where: { user_id_material_id: { user_id: userId, material_id: materialId } },
      create: { user_id: userId, material_id: materialId },
      update: {}
    });
  }

  static async unsaveMaterial(userId, materialId) {
    await prisma.savedMaterial.delete({
      where: { user_id_material_id: { user_id: userId, material_id: materialId } }
    });
  }

  static async getSavedMaterials(userId) {
    const saved = await prisma.savedMaterial.findMany({
      where: { user_id: userId, material: { is_published: true } },
      include: {
        material: {
          include: {
            course: { select: { title: true } },
            module: { select: { title: true } }
          }
        }
      },
      orderBy: { saved_at: 'desc' }
    });

    const uploaderIds = [...new Set(saved.map(sm => sm.material.uploaded_by).filter(Boolean))];
    const profiles = await prisma.profile.findMany({
      where: { user_id: { in: uploaderIds } },
      select: { user_id: true, full_name: true }
    });
    const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p.full_name]));

    return saved.map(sm => ({
      ...sm.material,
      course_title: sm.material.course.title,
      module_title: sm.material.module?.title || null,
      uploader_name: sm.material.uploaded_by ? profileMap[sm.material.uploaded_by] || null : null,
      is_saved: true,
      file_size_bytes: sm.material.file_size_bytes ? Number(sm.material.file_size_bytes) : null
    }));
  }
}

module.exports = Material;
