const { prisma } = require("../config/db");

class Course {
  static async findAll({ provider, category, level, query, isInternal, instructorId, instructorIds }) {
    const where = {};
    if (instructorIds && Array.isArray(instructorIds)) {
      where.instructor_id = { in: instructorIds };
    } else if (instructorId) {
      where.instructor_id = instructorId;
    }
    if (provider) {
      where.provider = {
        slug: { equals: String(provider).toLowerCase(), mode: 'insensitive' }
      };
    }
    if (category) {
      where.category = { equals: String(category).toLowerCase(), mode: 'insensitive' };
    }
    if (level) {
      where.skill_level = { equals: String(level).toLowerCase(), mode: 'insensitive' };
    }
    if (isInternal !== undefined) {
      where.is_internal = isInternal === 'true' || isInternal === true;
    }
    if (query) {
      where.OR = [
        { title: { contains: String(query), mode: 'insensitive' } },
        { description: { contains: String(query), mode: 'insensitive' } }
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        provider: true
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 200
    });

    const allInstructorIds = [...new Set(courses.map(c => c.instructor_id).filter(Boolean))];
    const instructors = await prisma.user.findMany({
      where: { id: { in: allInstructorIds } },
      include: { profile: true }
    });
    const instructorMap = Object.fromEntries(
      instructors.map(u => [
        u.id,
        {
          email: u.email,
          fullName: u.profile?.full_name || null,
          faculty: u.profile?.faculty || null,
          department: u.profile?.department || null,
          academicYear: u.profile?.current_academic_year || null
        }
      ])
    );

    return courses.map(c => ({
      ...c,
      provider_name: c.provider.name,
      provider_slug: c.provider.slug,
      instructor_email: c.instructor_id ? instructorMap[c.instructor_id]?.email : null,
      instructor_full_name: c.instructor_id ? instructorMap[c.instructor_id]?.fullName : null,
      instructor_faculty: c.instructor_id ? instructorMap[c.instructor_id]?.faculty : null,
      instructor_department: c.instructor_id ? instructorMap[c.instructor_id]?.department : null,
      instructor_academic_year: c.instructor_id ? instructorMap[c.instructor_id]?.academicYear : null
    }));
  }

  static async findById(id) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        provider: true
      }
    });
    if (!course) return null;

    let instructorEmail = null;
    let instructorProfile = null;
    if (course.instructor_id) {
      const user = await prisma.user.findUnique({
        where: { id: course.instructor_id },
        include: { profile: true }
      });
      instructorEmail = user?.email || null;
      instructorProfile = user?.profile || null;
    }

    return {
      ...course,
      provider_name: course.provider.name,
      provider_slug: course.provider.slug,
      instructor_email: instructorEmail,
      instructor_full_name: instructorProfile?.full_name || course.instructor_name || null,
      instructor_faculty: instructorProfile?.faculty || null,
      instructor_department: instructorProfile?.department || null,
      instructor_academic_year: instructorProfile?.current_academic_year || null
    };
  }

  static async create(courseData) {
    const {
      providerId,
      externalId,
      title,
      category,
      level,
      duration,
      hasCertificate,
      costType,
      externalUrl,
      description,
      isInternal = false,
      instructorId = null,
      instructorName = null,
      thumbnailUrl = null
    } = courseData;

    const course = await prisma.course.create({
      data: {
        provider_id: providerId,
        external_id: externalId,
        title,
        category,
        skill_level: level,
        duration_label: duration,
        has_certificate: hasCertificate === 'true' || hasCertificate === true,
        cost_type: costType,
        external_url: externalUrl,
        description,
        is_internal: isInternal === 'true' || isInternal === true,
        instructor_id: instructorId,
        instructor_name: instructorName,
        thumbnail_url: thumbnailUrl,
        is_active: true
      }
    });
    return course;
  }
}

module.exports = Course;
