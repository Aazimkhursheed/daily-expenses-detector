const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./db");

const createAdmin = async () => {
    await connectDB();

    try {
        const adminEmail = "admin@test.com";

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log("Admin user already exists");
            process.exit(0);
        }

        // Create admin user
        const admin = new User({
            name: "Super Admin",
            email: adminEmail,
            password: "admin123", // In a real app, this should be hashed
            phone: "0000000000",
            role: "admin",
            provider: "local"
        });

        await admin.save();
        console.log("✅ Admin user created successfully");
        console.log("Email: admin@test.com");
        console.log("Password: admin123");
    } catch (error) {
        console.error("❌ Error creating admin:", error.message);
    } finally {
        mongoose.connection.close();
    }
};

createAdmin();
