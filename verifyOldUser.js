const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function verifyAllUsers(nextPageToken) {
  try {
    // List users in batches of 1000
    const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
    
    const updatePromises = listUsersResult.users.map(async (user) => {
      if (!user.emailVerified) {
        await admin.auth().updateUser(user.uid, {
          emailVerified: true
        });
        console.log(`✅ Verified user: ${user.email}`);
      } else {
        console.log(`ℹ️ User ${user.email} already verified.`);
      }
    });

    await Promise.all(updatePromises);

    if (listUsersResult.pageToken) {
      // List next batch
      await verifyAllUsers(listUsersResult.pageToken);
    } else {
      console.log('✨ All existing users have been verified!');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error updating users:', error);
    process.exit(1);
  }
}

console.log("🚀 Starting bulk verification migration...");
verifyAllUsers();