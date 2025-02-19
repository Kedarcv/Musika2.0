const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/adminModel');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createSuperAdmin = async () => {
  try {
    const superAdmin = await Admin.createSuperAdmin({
      name: 'Super Admin',
      email: 'admin@example.com',
      password: 'password123',
    });

    console.log('Super admin created successfully:', {
      id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role,
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error.message);
    process.exit(1);
  }
};

createSuperAdmin();
