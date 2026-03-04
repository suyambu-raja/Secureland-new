import { initializeApp } from "firebase/app";
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA51_NedComYatnp9kXj_yyam15irSJen4",
    authDomain: "land-748e6.firebaseapp.com",
    projectId: "land-748e6",
    storageBucket: "land-748e6.firebasestorage.app",
    messagingSenderId: "477127955438",
    appId: "1:477127955438:web:a037fad06bf9d32e8ff4ff"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ============================================
// DEMO OTP SYSTEM (Free - No Billing Needed)
// Set to false when you upgrade to Firebase Blaze plan
// ============================================
export const DEMO_MODE = true;

// In demo mode, we generate a random 6-digit OTP and verify locally
// In production mode, we use Firebase Phone Auth (requires Blaze plan)

let demoOtp: string = "";

export const generateDemoOtp = (): string => {
    demoOtp = Math.floor(100000 + Math.random() * 900000).toString();
    return demoOtp;
};

export const verifyDemoOtp = (inputOtp: string): boolean => {
    return inputOtp === demoOtp;
};

// Firebase reCAPTCHA setup (for production mode)
let globalRecaptchaVerifier: RecaptchaVerifier | null = null;

export const setupRecaptcha = (elementId: string): RecaptchaVerifier => {
    if (globalRecaptchaVerifier) {
        try { globalRecaptchaVerifier.clear(); } catch (e) { /* ignore */ }
        globalRecaptchaVerifier = null;
    }
    const existing = document.getElementById(elementId);
    if (existing) existing.innerHTML = "";

    const verifier = new RecaptchaVerifier(auth, elementId, {
        size: "invisible",
        callback: () => { },
        "expired-callback": () => { globalRecaptchaVerifier = null; },
    });
    globalRecaptchaVerifier = verifier;
    return verifier;
};

export const sendOtp = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
    const formattedPhone = phoneNumber.startsWith("+91") ? phoneNumber : `+91${phoneNumber}`;
    return await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
};

export const verifyOtp = async (confirmationResult: any, otp: string) => {
    const result = await confirmationResult.confirm(otp);
    return result.user;
};

export default app;
