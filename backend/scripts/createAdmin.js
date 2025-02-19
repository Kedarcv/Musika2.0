const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/adminModel');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const admin = await Admin.create({
      name: 'Michael Nkomo',
      email: 'cvlised360@gmail.com',
      password: 'Cvlised@360',
      permissions: 'all',
    });

    console.log('Admin created:', admin);
    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
