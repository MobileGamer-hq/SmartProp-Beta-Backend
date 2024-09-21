const admin = require('firebase-admin');
const serviceAccount = require('./smartprop-beta-firebase-adminsdk-zw5dv-417f27aad6.json'); // Replace with actual path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-database-url.firebaseio.com'  // Replace with your Firebase project URL
});

const db = admin.firestore();

module.exports = { db };
