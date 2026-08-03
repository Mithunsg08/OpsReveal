import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// PUBLIC FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyANvecmxTQfsum_1NThmFFVELCe3dlNm6g",
  authDomain: "opsreveal.firebaseapp.com",
  projectId: "opsreveal",
  storageBucket: "opsreveal.appspot.com",
  messagingSenderId: "890870101711",
  appId: "1:890870101711:web:4266246996091ea56c69ba"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Ensures user profile document exists in Firestore upon successful login/signup
 */
export async function ensureUserProfile(user, extraData = {}) {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      fullName: extraData.fullName || user.displayName || "User",
      company: extraData.company || "",
      country: extraData.country || "",
      plan: extraData.plan || "starter",
      createdAt: serverTimestamp(),
      invitedColleagues: []
    });
  }
}

/**
 * Global Logout helper
 */
window.logoutUser = async () => {
  try {
    await signOut(auth);
    window.location.replace('/login.html');
  } catch (err) {
    console.error("Logout failed:", err);
  }
};