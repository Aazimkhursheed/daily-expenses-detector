const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./db');

const createTestUser = async () => {
    await connectDB();

    try {
        const testUser = {
            email: 'test@example.com',
            password: 'password123',
            role: 'user',
            name: 'Test User'
        };

        // Delete if exists
        await User.deleteOne({ email: testUser.email });

        // Create
        await User.create(testUser);
        console.log('Test user created successfully');
    } catch (err) {
        console.error('Error creating test user:', err);
    } finally {
        mongoose.connection.close();
    }
};

createTestUser();
