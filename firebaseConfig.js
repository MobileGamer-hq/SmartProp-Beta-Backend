// Load environment variables
require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');

// Load the service account credentials from the file path set in the .env file
// const serviceAccount = JSON.parse(fs.readFileSync(process.env.FIREBASE_CREDENTIALS));
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-database-url.firebaseio.com'  // Replace with your Firebase project URL
});

// Get a Firestore instance
const db = admin.firestore();

module.exports = { db };
