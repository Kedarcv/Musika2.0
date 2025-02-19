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

const deleteDuplicateAdmin = async () => {
  try {
    const result = await Admin.deleteOne({ email: 'admin@example.com' });
    if (result.deletedCount > 0) {
      console.log('Duplicate admin account deleted successfully.');
    } else {
      console.log('No duplicate admin account found.');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error deleting duplicate admin account:', error.message);
    process.exit(1);
  }
};

deleteDuplicateAdmin();
