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
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        try {
            const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
            const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

            if (Object.keys(firebaseConfig).length === 0) {
                console.error("Firebase config not found.");
                return;
            }

            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const firebaseAuth = getAuth(app);

            setDb(firestore);
            setAuth(firebaseAuth);

            const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    try {
                        if (initialAuthToken) {
                            await signInWithCustomToken(firebaseAuth, initialAuthToken);
                        } else {
                            await signInAnonymously(firebaseAuth);
                        }
                    } catch (e) {
                        console.error("Auth failed, assigning temporary ID:", e);
                        setUserId(crypto.randomUUID()); // Fallback
                    }
                }
                setAuthReady(true);
            });

            // Cleanup function for the effect
            return () => unsubscribe();

        } catch (e) {
            console.error("Error initializing Firebase:", e);
        }
    }, []);

    return { db, auth, userId, authReady };
};

