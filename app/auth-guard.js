import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
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

// Helper to guarantee individual user record exists in Firestore
export async function ensureUserProfile(user, additionalData = {}) {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      fullName: additionalData.fullName || user.displayName || "",
      company: additionalData.company || "",
      country: additionalData.country || "",
      position: additionalData.position || "",
      plan: "starter", // Default Plan
      createdAt: new Date().toISOString()
    });
  }
}

// Global Logout Utility
window.logoutUser = async () => {
  await signOut(auth);
  window.location.replace('/login.html');
};

// Route Protection Logic
onAuthStateChanged(auth, async (user) => {
  const path = window.location.pathname.replace(/\/$/, ""); // Normalize path
  const isProtectedArea = path.includes('/app');
  const isAuthPage = path.endsWith('/login') || path.endsWith('/signup') || path.endsWith('login.html') || path.endsWith('signup.html');

  if (isProtectedArea && (!user || !user.emailVerified)) {
    // 1. Kick unauthenticated or unverified users back to login
    window.location.replace('/login.html');
  } else if (user && user.emailVerified) {
    await ensureUserProfile(user);
    if (isAuthPage || path === '') {
      // 2. Verified users landing on auth pages get redirected directly to dashboard
      window.location.replace('/app/dashboard');
    }
  }
});