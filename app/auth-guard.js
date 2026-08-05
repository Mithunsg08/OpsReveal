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

export const SUPER_ADMIN_EMAIL = "mithun@preventloss.org";

export function isSuperAdmin(user) {
  return user && user.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

// Global Guard for protected pages in /app/
export function initAuthGuard() {
  onAuthStateChanged(auth, async (user) => {
    const isProtectedPage = window.location.pathname.startsWith('/app/');
    
    if (isProtectedPage) {
      if (!user) {
        window.location.replace('/login.html');
        return;
      }

      const isGoogleUser = user.providerData?.some(p => p.providerId === 'google.com');
      const isVerified = user.emailVerified || isGoogleUser;

      if (!isVerified) {
        alert("Please verify your email address before continuing.");
        window.location.replace('/login.html');
        return;
      }

      // Check profile & enforce status
      const profile = await ensureUserProfile(user);
      
      // If profile exists and status is NOT active, block access and log out
      if (profile && profile.status !== "active") {
        alert("Your account is currently inactive. Access has been restricted.");
        await signOut(auth);
        window.location.replace('/login.html?reason=account_inactive');
        return;
      }
    }
  });
}

// User Profile Creator & Self-Healing Sync
export async function ensureUserProfile(user, extraData = {}) {
  if (!user) return null;
  
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  const isAdmin = isSuperAdmin(user);

  if (!snap.exists()) {
    // 1. Create Company Workspace
    const companyRef = doc(db, "companies", user.uid);
    await setDoc(companyRef, {
      companyName: extraData.companyName || (isAdmin ? "OpsReveal Admin Workspace" : `${user.displayName || 'User'}'s Workspace`),
      domain: extraData.domain || "",
      ownerUid: user.uid,
      createdAt: serverTimestamp()
    }, { merge: true });

    // 2. Create Default User Document
    const newUserData = {
      uid: user.uid,
      email: user.email,
      fullName: extraData.fullName || user.displayName || "OpsReveal User",
      role: isAdmin ? "SuperAdmin" : (extraData.role || "Owner"),
      companyId: user.uid,
      plan: extraData.plan || "starter",     // Default plan: 'starter'
      status: extraData.status || "active",  // Default status: 'active'
      onboardingCompleted: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(userRef, newUserData, { merge: true });
    return newUserData;
  }

  return snap.data();
}

// Global Logout Handler
window.logoutUser = async () => {
  await signOut(auth);
  window.location.replace('/login.html');
};

initAuthGuard();
