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

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Global Guard for protected pages in /app/
export function initAuthGuard() {
  onAuthStateChanged(auth, async (user) => {
    const isProtectedPage = window.location.pathname.startsWith('/app/');
    
    if (isProtectedPage) {
      if (!user) {
        window.location.replace('/login.html');
        return;
      }

      // Google users are automatically verified; Email users must verify
      const isGoogleUser = user.providerData?.some(p => p.providerId === 'google.com');
      const isVerified = user.emailVerified || isGoogleUser;

      if (!isVerified) {
        alert("Please verify your email address before continuing.");
        window.location.replace('/login.html');
        return;
      }
    }
  });
}

// User Profile Creator
export async function ensureUserProfile(user, extraData = {}) {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      fullName: extraData.fullName || user.displayName || "User",
      createdAt: serverTimestamp()
    });
  }
}

// Global Logout
window.logoutUser = async () => {
  await signOut(auth);
  window.location.replace('/login.html');
};

// Initialize route guard on page load
initAuthGuard();