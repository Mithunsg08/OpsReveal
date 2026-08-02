import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// PUBLIC FIREBASE CONFIG
// Public API keys are safe in client code when locked down with Firebase Authorized Domains.
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

// Global Logout Utility
window.logoutUser = async () => {
  await signOut(auth);
  window.location.href = '/login.html';
};

// Route Guard execution
onAuthStateChanged(auth, (user) => {
  const currentPath = window.location.pathname;
  const isAuthPage = currentPath.includes('login.html') || currentPath.includes('signup.html');

  if (!user && !isAuthPage) {
    // 1. Unauthenticated users get booted to login
    window.location.href = '/login.html';
  } else if (user && !user.emailVerified && !isAuthPage) {
    // 2. Unverified email users get booted to login with notice
    alert("Please verify your email address via the link sent to your inbox before continuing.");
    signOut(auth);
    window.location.href = '/login.html';
  } else if (user && user.emailVerified && isAuthPage) {
    // 3. Authenticated & verified users trying to see login/signup get sent directly to app
    window.location.href = '/app/index.html';
  }
});