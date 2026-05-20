const bcrypt = require("bcryptjs");
const User = require("./src/models/user.model");
require("dotenv").config();

async function createAdmin() {
  const adminData = {
    email: "admin@usl.edu.sl",
    password: "adminpassword123",
    fullName: "USL Registry Admin",
    role: "admin"
  };

  try {
    const existing = await User.findByEmail(adminData.email);
    if (existing) {
      console.log("Admin user already exists.");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(adminData.password, 10);
    await User.create({
      email: adminData.email,
      passwordHash,
      role: adminData.role,
      fullName: adminData.fullName
    });

    console.log("Admin account created successfully!");
    console.log("Email: " + adminData.email);
    console.log("Password: " + adminData.password);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
