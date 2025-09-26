
import { collection, doc, setDoc, updateDoc, increment } from 'firebase/firestore';

// --- Configuration Constants ---
const COLLECTION_NAME = 'doubles_ratings';
const THEMES = {
    'celebrity': { name: 'Global Celebrity or Icon' },
    'football_player': { name: 'Football (Soccer) Player' },
    'politician': { name: 'Politician / Historical Figure' },
    'cartoon': { name: 'Cartoon / Animated Character' },
    'meme': { name: 'Internet Meme / Funny Concept' },
    '80s_icons': { name: '80s Rockstars & Pop Icons' },
    'fantasy_scifi': { name: 'Fantasy & Sci-Fi Characters' },
    'art_history': { name: 'Iconic Art & Historical Figures' },
    'elections_pt_2025': { name: 'Portuguese Elections 2025 (Funny Match)' },
    'world_cup_squads': { name: 'Football World Cup Squads Match' },
    'general': { name: 'General Celebrity/Character Match' },
};


/**
 * Gets the public Firestore collection reference.
 * @param {Firestore} db The Firestore instance.
 * @returns {CollectionReference}
 */
export const getCollectionRef = (db) => {
    if (!db) return null;
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-double-finder-app';
    const collectionPath = `/artifacts/${appId}/public/data/${COLLECTION_NAME}`;
    return collection(db, collectionPath);
};

/**
 * Handles voting on a match item.
 * @param {Firestore} db
 * @param {string} userId
 * @param {string} matchId
 * @param {number} currentVotes
 * @returns {Promise<{success: boolean, newVotes: number | null}>}
 */
export const handleVote = async (db, userId, matchId, currentVotes) => {
    if (!db || !userId || !matchId) {
        console.error("Database, User ID, or Match ID not ready for voting.");
        return { success: false, newVotes: null };
    }

    const matchRef = doc(getCollectionRef(db), matchId);

    try {
        await updateDoc(matchRef, {
            votes: increment(1),
        });
        return { success: true, newVotes: currentVotes + 1 };
    } catch (error) {
        console.error("Failed to update vote:", error);
        return { success: false, newVotes: null };
    }
};

/**
 * Saves an AI-generated match to Firestore.
 */
export const saveNewMatch = async (db, userId, authReady, matchData) => {
    if (!authReady || !db) throw new Error("Database not ready for saving.");

    const docRef = doc(getCollectionRef(db));
    const matchId = docRef.id;

    const dataToSave = {
        id: matchId,
        themeId: matchData.themeId,
        themeName: THEMES[matchData.themeId].name,
        celebrityName: matchData.celebrityMatch,
        analysis: matchData.analysis,
        userImageBase64: matchData.image,
        matchType: 'ai_generated',
        votes: 1,
        votedBy: [userId],
        creatorId: userId,
        timestamp: Date.now()
    };

    await setDoc(docRef, dataToSave);
    return matchId;
};

/**
 * Saves a user-suggested match to Firestore.
 */
export const saveUserSuggestedMatch = async (db, userId, authReady, famousName, candidateImageBase64, famousImageBase64, themeId, tags, description) => {
    if (!authReady || !db) throw new Error("Database not ready for saving.");

    const docRef = doc(getCollectionRef(db));
    const matchId = docRef.id;

    const dataToSave = {
        id: matchId,
        themeId: themeId,
        themeName: THEMES[themeId].name,
        celebrityName: famousName,
        analysis: description,
        customTags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        userImageBase64: candidateImageBase64,
        famousImageBase64: famousImageBase64,
        matchType: 'user_suggested',
        votes: 1,
        votedBy: [userId],
        creatorId: userId,
        timestamp: Date.now()
    };

    await setDoc(docRef, dataToSave);
    return matchId;
};

// Export themes for use in component dropdowns
export { THEMES };
