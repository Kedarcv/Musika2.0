const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const deleteDuplicateUser = async () => {
  try {
    const result = await User.deleteOne({ email: 'user@example.com' });
    if (result.deletedCount > 0) {
      console.log('Duplicate user account deleted successfully.');
    } else {
      console.log('No duplicate user account found.');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error deleting duplicate user account:', error.message);
    process.exit(1);
  }
};

deleteDuplicateUser();
