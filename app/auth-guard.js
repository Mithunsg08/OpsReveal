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

// Helper to check user profile
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
      plan: "starter",
      createdAt: new Date().toISOString()
    });
  }
}

window.logoutUser = async () => {
  await signOut(auth);
  window.location.replace('/login.html');
};

// Unified Route Guard
let isInitialAuthCheck = true;

onAuthStateChanged(auth, async (user) => {
  const path = window.location.pathname.replace(/\/$/, "");
  const isProtectedArea = path.includes('/app');
  const isAuthPage = path.endsWith('/login') || path.endsWith('/signup') || path.endsWith('login.html') || path.endsWith('signup.html');

  if (isProtectedArea) {
    if (!user || !user.emailVerified) {
      // Redirect to login ONLY if Firebase explicitly confirms no valid session exists
      window.location.replace('/login.html');
    } else {
      // Valid session found: display page body
      document.body.style.display = 'block';
    }
  } else if (isAuthPage && user && user.emailVerified) {
    window.location.replace('/app/dashboard');
  }

  isInitialAuthCheck = false;
});