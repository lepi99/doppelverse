import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Custom hook to initialize Firebase and manage user authentication state.
 * It reads configuration from global __firebase_config and __initial_auth_token.
 * @returns {{db: Firestore, auth: Auth, userId: string, authReady: boolean}}
 */
export const useFirebase = () => {
    // Mock values for demo/development without Firebase
    return {
        db: null,
        auth: null,
        userId: 'mock-user-id',
        authReady: true
    };
};

