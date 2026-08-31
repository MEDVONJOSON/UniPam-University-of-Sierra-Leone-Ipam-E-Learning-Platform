const { prisma } = require("../config/db");

class Module {
  static async findByCourseId(courseId) {
    return await prisma.courseModule.findMany({
      where: { course_id: courseId },
      orderBy: [
        { sort_order: 'asc' },
        { created_at: 'asc' }
      ]
    });
  }

  static async findById(id) {
    return await prisma.courseModule.findUnique({
      where: { id }
    });
  }

  static async create({ courseId, title, description = "", sortOrder = 0 }) {
    return await prisma.courseModule.create({
      data: {
        course_id: courseId,
        title,
        description,
        sort_order: sortOrder
      }
    });
  }

  static async update(id, { title, description, sortOrder }) {
    return await prisma.courseModule.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        sort_order: sortOrder !== undefined ? sortOrder : undefined
      }
    });
  }

  static async delete(id) {
    // Prisma onDelete: SetNull configuration will automatically set course_materials.module_id = NULL.
    return await prisma.courseModule.delete({
      where: { id }
    });
  }

  static async getNextSortOrder(courseId) {
    const aggregate = await prisma.courseModule.aggregate({
      where: { course_id: courseId },
      _max: { sort_order: true }
    });
    const maxVal = aggregate._max.sort_order;
    return maxVal !== null ? maxVal + 1 : 0;
  }
}

module.exports = Module;
