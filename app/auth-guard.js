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
  apiKey: "AIzaSyANvecmxTQfsum_1NThmFFVELCe3dlNm6g",
  authDomain: "opsreveal.firebaseapp.com",
  projectId: "opsreveal",
  storageBucket: "opsreveal.firebasestorage.app",
  messagingSenderId: "890870101711",
  appId: "1:890870101711:web:4266246996091ea56c69ba",
  measurementId: "G-LCWJSW9SKY"
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

      // Google Provider users bypass mandatory email verification checks
      const isGoogleUser = user.providerData?.some(p => p.providerId === 'google.com');
      const isVerified = user.emailVerified || isGoogleUser;

      if (!isVerified) {
        alert("Please verify your email address before continuing.");
        window.location.replace('/login.html');
        return;
      }

      // Automatically guarantee profile exists before rendering dashboard
      await ensureUserProfile(user);
    }
  });
}

// User Profile Creator & Self-Healing Sync
export async function ensureUserProfile(user, extraData = {}) {
  if (!user) return;
  
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    // Create Default Company Reference
    const companyRef = doc(db, "companies", user.uid);
    await setDoc(companyRef, {
      companyName: extraData.companyName || `${user.displayName || 'Default'}'s Workspace`,
      domain: extraData.domain || "",
      ownerUid: user.uid,
      createdAt: serverTimestamp()
    }, { merge: true });

    // Create User Document
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      fullName: extraData.fullName || user.displayName || "OpsReveal User",
      role: extraData.role || "Owner",
      companyId: user.uid,
      onboardingCompleted: true,
      createdAt: serverTimestamp()
    }, { merge: true });
  }
}

// Global Logout Handler
window.logoutUser = async () => {
  await signOut(auth);
  window.location.replace('/login.html');
};

// Auto-run route guard on load
initAuthGuard();
