const { User, Property, Buyer, Seller, Admin } = require("./data");

const auth = getAuth();
const db = getFirestore();

const signUp = async (username, email, password, role) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    const newUser = {
      name: username,
      login: {
        email: email,
        password: password
      },
      role: password === adminKey ? "admin" : role,
      roleData: password === adminKey ? "Admin" : (role === "seller" ? Seller: Buyer),
      id: userId
    };

    await setDoc(doc(db, "Users", userId), newUser);
    console.log(`User ${username} created successfully.`);
  } catch (error) {
    console.error('Error signing up:', error.code, error.message);
  }
};

const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    console.log(`User signed in with ID: ${userId}`);
    return userId;
  } catch (error) {
    console.error('Error signing in:', error.code, error.message);
  }
};

module.exports = { signUp, signIn };