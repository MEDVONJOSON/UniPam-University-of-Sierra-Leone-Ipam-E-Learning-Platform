const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Legacy pool wrapper to support raw SQL queries on the actual PostgreSQL database
const pool = {
  query: async (text, params) => {
    try {
      // Normalize parameter syntax from postgres-style $1, $2 to array values
      // Prisma $queryRawUnsafe expects binding parameters to be passed in params array
      const formattedParams = params || [];
      const rows = await prisma.$queryRawUnsafe(text, ...formattedParams);
      return { rows, rowCount: rows.length };
    } catch (err) {
      console.error("Raw SQL Query Error:", text, err);
      throw err;
    }
  }
};

async function healthCheckDb() {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() AS now`;
    return result[0];
  } catch (err) {
    console.error("Database health check failed:", err);
    throw err;
  }
}

module.exports = {
  prisma,
  pool,
  healthCheckDb
};
