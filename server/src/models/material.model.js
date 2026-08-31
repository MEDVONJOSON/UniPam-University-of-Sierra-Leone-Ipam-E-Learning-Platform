const { prisma } = require("../config/db");

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

    return list.map(cm => ({
      ...cm,
      file_size_bytes: cm.file_size_bytes ? Number(cm.file_size_bytes) : null,
      module_title: cm.module?.title || null,
      module_sort_order: cm.module?.sort_order || null,
      uploader_email: cm.uploaded_by ? uploaderMap[cm.uploaded_by]?.email || null : null,
      uploader_name: cm.uploaded_by ? uploaderMap[cm.uploaded_by]?.name || null : null
    }));
  }

  static async findPublishedByCourseId(courseId, userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { user_id_course_id: { user_id: userId, course_id: courseId } }
    });
    if (!enrollment) return null;

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

    return list.map(cm => ({
      ...cm,
      file_size_bytes: cm.file_size_bytes ? Number(cm.file_size_bytes) : null,
      module_title: cm.module?.title || null,
      module_sort_order: cm.module?.sort_order || null,
      uploader_name: cm.uploaded_by ? profileMap[cm.uploaded_by] || null : null,
      is_saved: cm.saved_materials.length > 0
    }));
  }

  static async findAllForEnrolledCourses(userId, {
    search, category, courseId,
    semester, academicYear, materialType, weekLabel, lecturer
  } = {}) {
    const enrollments = await prisma.enrollment.findMany({
      where: { user_id: userId },
      select: { course_id: true }
    });
    const enrolledCourseIds = enrollments.map(e => e.course_id);
    if (enrolledCourseIds.length === 0) return [];

    const where = {
      course_id: { in: enrolledCourseIds },
      is_published: true
    };

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
        course: { select: { title: true } },
        module: { select: { title: true } },
        saved_materials: { where: { user_id: userId } }
      },
      orderBy: { created_at: 'desc' },
      take: 500
    });

    const uploaderIds = [...new Set(list.map(cm => cm.uploaded_by).filter(Boolean))];
    const profiles = await prisma.profile.findMany({
      where: { user_id: { in: uploaderIds } },
      select: { user_id: true, full_name: true }
    });
    const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p.full_name]));

    let result = list.map(cm => ({
      ...cm,
      file_size_bytes: cm.file_size_bytes ? Number(cm.file_size_bytes) : null,
      course_title: cm.course.title,
      module_title: cm.module?.title || null,
      uploader_name: cm.uploaded_by ? profileMap[cm.uploaded_by] || null : null,
      is_saved: cm.saved_materials.length > 0
    }));

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(cm => 
        (cm.title || "").toLowerCase().includes(q) ||
        (cm.description || "").toLowerCase().includes(q) ||
        (cm.course_title || "").toLowerCase().includes(q) ||
        (cm.module_title || "").toLowerCase().includes(q) ||
        (cm.week_label || "").toLowerCase().includes(q) ||
        (cm.original_filename || "").toLowerCase().includes(q) ||
        (cm.uploader_name || "").toLowerCase().includes(q)
      );
    }

    if (lecturer) {
      const l = lecturer.toLowerCase();
      result = result.filter(cm => (cm.uploader_name || "").toLowerCase().includes(l));
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
      course_title: cm.course.title
    };
  }

  static async create({
    courseId, moduleId, title, description, weekLabel,
    materialType, materialCategory, fileUrl, uploadedBy,
    originalFilename, fileSizeBytes, semester, academicYear,
    lectureNoteNumber, isPublished
  }) {
    const cm = await prisma.courseMaterial.create({
      data: {
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
        lecture_note_number: lectureNoteNumber || null,
        is_published: isPublished !== false
      }
    });
    
    return {
      ...cm,
      file_size_bytes: cm.file_size_bytes ? Number(cm.file_size_bytes) : null
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
        data[col] = val;
      }
    }

    const cm = await prisma.courseMaterial.update({
      where: { id },
      data
    });
    
    return {
      ...cm,
      file_size_bytes: cm.file_size_bytes ? Number(cm.file_size_bytes) : null
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
