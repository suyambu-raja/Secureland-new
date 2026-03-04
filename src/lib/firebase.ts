import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
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

// Setup invisible reCAPTCHA for phone auth
export const setupRecaptcha = (elementId: string): RecaptchaVerifier => {
    const verifier = new RecaptchaVerifier(auth, elementId, {
        size: "invisible",
        callback: () => {
            // reCAPTCHA solved
        },
    });
    return verifier;
};

// Send OTP to phone number
export const sendOtp = async (
    phoneNumber: string,
    recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
    const formattedPhone = phoneNumber.startsWith("+91") ? phoneNumber : `+91${phoneNumber}`;
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    return confirmationResult;
};

// Verify OTP
export const verifyOtp = async (
    confirmationResult: ConfirmationResult,
    otp: string
) => {
    const result = await confirmationResult.confirm(otp);
    return result.user;
};

export default app;
