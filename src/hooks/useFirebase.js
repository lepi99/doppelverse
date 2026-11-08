// src/hooks/useFirebase.js
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';

/**
 * Custom hook to initialize Firebase and manage user authentication state.
 * @returns {{db: Firestore, user: User | null, authReady: boolean}}
 */
export const useFirebase = () => {
    const [user, setUser] = useState(() => auth.currentUser);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    return { db, user, authReady };
};
