const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function testOrgRequest() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find a user with pending requests
    const user = await User.findOne({ 'reqorg.status': 'pending' })
      .populate({
        path: 'reqorg.orgId',
        select: 'companyProfile firstName lastName'
      })
      .populate({
        path: 'reqorg.requestedBy',
        select: 'firstName lastName email'
      });

    if (user) {
      console.log('Found user with pending requests:');
      console.log('User ID:', user._id);
      console.log('User Name:', user.firstName, user.lastName);
      console.log('Pending requests:', user.reqorg.filter(req => req.status === 'pending'));
    } else {
      console.log('No users with pending requests found');
      
      // Let's check all users with reqorg array
      const usersWithReqorg = await User.find({ 'reqorg.0': { $exists: true } })
        .select('firstName lastName reqorg');
      
      console.log('Users with reqorg array:', usersWithReqorg.length);
      usersWithReqorg.forEach(u => {
        console.log(`${u.firstName} ${u.lastName}: ${u.reqorg.length} requests`);
        u.reqorg.forEach(req => {
          console.log(`  - Status: ${req.status}, ID: ${req._id}`);
        });
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testOrgRequest();