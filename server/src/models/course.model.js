const { prisma } = require("../config/db");

class Course {
  static async findAll({ provider, category, level, query, isInternal, instructorId }) {
    const where = {};
    if (instructorId) {
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

    const instructorIds = [...new Set(courses.map(c => c.instructor_id).filter(Boolean))];
    const instructors = await prisma.user.findMany({
      where: { id: { in: instructorIds } },
      select: { id: true, email: true }
    });
    const instructorMap = Object.fromEntries(instructors.map(u => [u.id, u.email]));

    return courses.map(c => ({
      ...c,
      provider_name: c.provider.name,
      provider_slug: c.provider.slug,
      instructor_email: c.instructor_id ? instructorMap[c.instructor_id] : null
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
    if (course.instructor_id) {
      const user = await prisma.user.findUnique({
        where: { id: course.instructor_id },
        select: { email: true }
      });
      instructorEmail = user?.email || null;
    }

    return {
      ...course,
      provider_name: course.provider.name,
      provider_slug: course.provider.slug,
      instructor_email: instructorEmail
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
