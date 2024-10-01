import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  collection,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "process.env.EXPO_FIREBASE_API_KEY",
  authDomain: "process.env.EXPO_FIREBASE_AUTH_DOMAIN",
  projectId: "process.env.EXPO_FIREBASE_PROJECT_ID",
  storageBucket: "process.env.EXPO_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "process.env.EXPO_FIREBASE_MESSAGING_SENDER_ID",
  appId: "process.env.EXPO_FIREBASE_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Create a new user
export async function createUser(email, password, username) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Store user info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      username: username,
      avatar: `https://ui-avatars.com/api/?name=${username}`,
    });

    return user;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Sign in user
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get user account info
export async function getAccount() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user signed in");
  }
  const userDoc = await getDoc(doc(db, "users", user.uid));
  return userDoc.exists() ? userDoc.data() : null;
}

// Sign out user
export async function signOutUser() {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Upload file to storage
export async function uploadFile(file) {
  const fileRef = ref(storage, `files/${file.name}`);
  try {
    await uploadBytes(fileRef, file);
    const fileUrl = await getDownloadURL(fileRef);
    return fileUrl;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Create a video post
export async function createVideoPost(form) {
  const postRef = doc(collection(db, "posts"));
  try {
    const thumbnailUrl = await uploadFile(form.thumbnail);
    const videoUrl = await uploadFile(form.video);

    await setDoc(postRef, {
      title: form.title,
      thumbnail: thumbnailUrl,
      video: videoUrl,
      prompt: form.prompt,
      creator: form.userId,
      createdAt: new Date(),
    });

    return postRef.id;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get all posts
export async function getAllPosts() {
  const postsQuery = query(collection(db, "posts"));
  const postsSnapshot = await getDocs(postsQuery);
  return postsSnapshot.docs.map((doc) => doc.data());
}

// Get posts by user ID
export async function getUserPosts(userId) {
  const postsQuery = query(
    collection(db, "posts"),
    where("creator", "==", userId)
  );
  const postsSnapshot = await getDocs(postsQuery);
  return postsSnapshot.docs.map((doc) => doc.data());
}

// Get latest posts
export async function getLatestPosts() {
  const postsQuery = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(7)
  );
  const postsSnapshot = await getDocs(postsQuery);
  return postsSnapshot.docs.map((doc) => doc.data());
}
