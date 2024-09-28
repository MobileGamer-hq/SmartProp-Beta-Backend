const express = require("express");
const { db } = require("./firebaseConfig"); // Firebase config
const cors = require('cors');
const { Parser } = require('json2csv');
const app = express();
const port = 5000;

app.use(express.json());

// List of allowed domains
const allowedOrigins = ['http://localhost:3000', 'https://smartprop-beta.web.app'];

app.use(cors({
  origin: function (origin, callback) {
    // If the request is from an allowed origin, allow it
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));


// Helper functions from your original code
const { GetBestChoice, generateTerms } = require("./searchAlgorithm");

app.post("/signup", async (req, res) => {
  try {
    // Get user details from the request body
    const { email, password } = req.body;

    // Create a new user
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    console.log("Successfully created new user:", userRecord.uid);

    // Fetch all users
    const userRecords = await admin.auth().listUsers();
    const users = userRecords.users;

    // Perform your check on all users here
    // For example, log all user email addresses
    users.forEach((u) => {
      console.log("User:", u.email);
    });

    // Respond with the created user
    res.status(201).json({ user: userRecord });
  } catch (error) {
    console.error("Error creating user or fetching all users:", error);
    res.status(500).json({ error: "Failed to create user or fetch all users" });
  }
});

app.post('/signin', async (req, res) => {
    try {
      // Get user details from the request body
      const { email, password } = req.body;
  
      // Sign in the user
      const userRecord = await admin.auth().getUserByEmail(email);
  
      // Here you should verify the password. Firebase Admin SDK does not directly verify passwords.
      // Use Firebase Client SDK or custom authentication solution for password verification.
      // This example assumes that password verification is handled elsewhere.
  
      if (userRecord) {
        // Respond with the user details
        res.status(200).json({ user: userRecord });
      } else {
        res.status(401).json({ error: 'Invalid email or password' });
      }
    } catch (error) {
      console.error('Error signing in user:', error);
      res.status(500).json({ error: 'Failed to sign in user' });
    }
  });
  

app.get("/Users", async (req, res) => {
  try {
    // Fetch user data from Firebase
    const userSnapshot = await db.collection("Users").get();
    const userList = [];

    userSnapshot.forEach((doc) => userList.push(doc.data()));

    // Return the list of users fetched from the database
    res.status(200).json({ users: userList });
  } catch (error) {
    console.error("Error fetching users: ", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


// Sample route to get all users and convert to CSV
app.get('/Users/csv', async (req, res) => {
  try {
    // Fetch the users from the database
    const usersSnapshot = await db.collection('Users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });

    // If no users are found, return an empty file
    if (users.length === 0) {
      return res.status(200).send('No users found');
    }

    // Fields for the CSV
    const fields = ['id', 'name', 'login.email', 'role', 'roleData']; // Adjust fields based on your user schema
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(users);

    // Set headers to indicate that it's a file download
    res.header('Content-Type', 'text/csv');
    res.attachment('users.csv');
    res.status(200).send(csv);

  } catch (error) {
    console.error('Error converting users to CSV:', error);
    res.status(500).json({ error: 'Failed to convert users to CSV' });
  }
});

app.post("/UsersByIds", async (req, res) => {
  try {
    const userIds = req.body.userIds; // Array of user IDs passed from frontend

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "No user IDs provided" });
    }

    // Fetch user data based on IDs
    const userList = [];
    for (let id of userIds) {
      const userDoc = await db.collection("Users").doc(id).get();
      if (userDoc.exists) {
        userList.push(userDoc.data());
      }
    }

    res.status(200).json({ users: userList });
  } catch (error) {
    console.error("Error fetching users by IDs: ", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/Users/:id", async (req, res) => {
  try {
    // Get the user ID from the request parameters
    const userId = req.params.id;

    // Fetch the user document from Firebase using the provided ID
    const userDoc = await db.collection("Users").doc(userId).get();

    // Check if the user exists
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get the user data
    const userData = userDoc.data();
    console.log(userData);

    // Return the user data
    res.status(200).json({ data: userData });
  } catch (error) {
    console.error("Error fetching user: ", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});


// Route to update a specific key of a user
app.patch('/Users/:id', async (req, res) => {
  const userId = req.params.id;  // Get the user ID from the URL
  const updateData = req.body;   // Get the key-value pair to update from the request body

  try {
    // Update the specific fields provided in the request body for the user
    await db.collection('Users').doc(userId).update(updateData);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user: ', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Route to delete a user
app.delete('/Users/:id', async (req, res) => {
  const userId = req.params.id; // Get the user ID from the URL

  try {
    // Delete the user document with the specified ID
    await db.collection('Users').doc(userId).delete();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user: ', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Endpoint to get properties from Firebase and return the best matches
app.get("/Properties", async (req, res) => {
  try {
    // Fetch property data from Firebase
    const propertySnapshot = await db.collection("Properties").get();
    const propertyList = [];

    propertySnapshot.forEach((doc) => propertyList.push(doc.data()));

    // Return the list of properties fetched from the database
    res.status(200).json({ properties: propertyList });
  } catch (error) {
    console.error("Error fetching properties: ", error);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

app.post("/PropertiesByIds", async (req, res) => {
  try {
    const propertyIds = req.body.propertyIds; // Array of property IDs passed from frontend

    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      return res.status(400).json({ error: "No property IDs provided" });
    }

    // Fetch property data based on IDs
    const propertyList = [];
    for (let id of propertyIds) {
      const propertyDoc = await db.collection("Properties").doc(id).get();
      if (propertyDoc.exists) {
        propertyList.push(propertyDoc.data());
      }
    }

    res.status(200).json({ properties: propertyList });
  } catch (error) {
    console.error("Error fetching properties by IDs: ", error);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

app.get("/Properties/:id", async (req, res) => {
  try {
    // Get the property ID from the request parameters
    const propertyId = req.params.id;

    // Fetch the property document from Firebase using the provided ID
    const propertyDoc = await db.collection("Properties").doc(propertyId).get();

    // Check if the property exists
    if (!propertyDoc.exists) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Get the property data
    const propertyData = propertyDoc.data();
    console.log(propertyData);

    // Return the property data
    res.status(200).json({ data: propertyData });
  } catch (error) {
    console.error("Error fetching property: ", error);
    res.status(500).json({ error: "Failed to fetch property" });
  }
});

// Route to update a specific key of a property
app.patch('/Properties/:id', async (req, res) => {
  const propertyId = req.params.id;  // Get the property ID from the URL
  const updateData = req.body;   // Get the key-value pair to update from the request body

  try {
    // Update the specific fields provided in the request body for the property
    await db.collection('Properties').doc(propertyId).update(updateData);

    res.status(200).json({ message: 'Property updated successfully' });
  } catch (error) {
    console.error('Error updating property: ', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// Route to delete a property
app.delete('/Properties/:id', async (req, res) => {
  const propertyId = req.params.id; // Get the property ID from the URL

  try {
    // Delete the property document with the specified ID
    await db.collection('Properties').doc(propertyId).delete();

    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property: ', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// Route to add a new property document and return the document ID
app.post('/Properties/:id', async (req, res) => {
  const propertyId = req.params.id; // The custom property ID provided in the URL
  const data = req.body; // Document metadata

  try {
    // Add a new document to the Properties collection with the given custom ID
    const docRef = await db.collection('Properties').doc(propertyId).set(data);

    // Respond with the provided document ID
    res.status(201).json({ id: propertyId });
  } catch (error) {
    console.error('Error saving document:', error);
    res.status(500).json({ error: 'Failed to save document.' });
  }
});



// Route to add a new transaction document and return the transaction ID
app.post('/Transactions/:id', async (req, res) => {
  const transactionId = req.params.id; // The custom transaction ID provided in the URL
  const data = req.body; // Transaction data

  try {
    // Add a new document to the Transactions collection with the given custom ID
    const docRef = await db.collection('Transactions').doc(transactionId).set(data);

    // Respond with the provided document ID
    res.status(201).json({ id: transactionId });
  } catch (error) {
    console.error('Error saving transaction:', error);
    res.status(500).json({ error: 'Failed to save transaction.' });
  }
});






// Endpoint to process search terms and filter properties
app.post("/Search", async (req, res) => {
  try {
    const searchTerm = req.body.searchTerm.toLowerCase(); // Get search term from request body

    // Generate filter based on search term
    const { terms, filter } = generateTerms(searchTerm);

    // Fetch property data from Firebase
    const propertySnapshot = await db.collection("properties").get();
    const propertyList = [];
    propertySnapshot.forEach((doc) => propertyList.push(doc.data()));

    // Get the best matching properties based on the generated filter
    const bestProperties = GetBestChoice(propertyList, filter);

    // Return sorted properties
    res.status(200).json({ properties: bestProperties, terms, filter });
  } catch (error) {
    console.error("Error processing search: ", error);
    res.status(500).json({ error: "Failed to process search" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
