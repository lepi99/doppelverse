
import React, { useState, useEffect } from 'react';
import { onSnapshot, query, limit, where } from 'firebase/firestore';
import { getCollectionRef, THEMES } from '../utils/firestoreUtils.js';
import MatchItem from '../components/MatchItem.jsx';

// --- Browse Community Doubles Tab Component ---
const BrowseDoublesTab = ({ db }) => {
    const [selectedTheme, setSelectedTheme] = useState('all');
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!db) return;

        setLoading(true);
        setError(null);
        let matchesQuery;

        if (selectedTheme === 'all') {
            // NOTE: orderBy is removed here to avoid complex index requirements, matching the original implementation's constraint.
            matchesQuery = query(getCollectionRef(db), limit(50));
        } else {
            matchesQuery = query(getCollectionRef(db), where('themeId', '==', selectedTheme), limit(50));
        }

        const unsubscribe = onSnapshot(matchesQuery, (snapshot) => {
            const fetchedMatches = [];
            snapshot.forEach((doc) => fetchedMatches.push(doc.data()));
            setMatches(fetchedMatches);
            setLoading(false);
        }, (err) => {
            console.error("Explorer Listener Error:", err);
            setError("Error: Insufficient permissions for Browse read. (Check Firestore Rules)");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [db, selectedTheme]);

    return (
        <div id="tab-explorer" className="container-card bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Browse Community Doubles</h2>
            
            <div className="mb-4">
                <label htmlFor="explorerThemeFilter" className="block text-lg font-medium text-gray-700 mb-2">Filter by Theme</label>
                <select 
                    id="explorerThemeFilter" 
                    className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                >
                    <option value="all">Show All Themes</option>
                    {Object.entries(THEMES).map(([id, theme]) => (
                        <option key={id} value={id}>{theme.name}</option>
                    ))}
                </select>
            </div>

            <div id="explorer-list" className="space-y-4 max-h-[60vh] overflow-y-auto p-2 border rounded-xl bg-gray-50">
                {loading && <p className="text-gray-500 italic text-center py-8">Loading matches...</p>}
                {error && <p className="text-red-500 italic text-center py-8">{error}</p>}
                {!loading && !error && matches.length === 0 && <p className="text-gray-500 italic text-center py-8">No matches found for this theme. Be the first to upload!</p>}
                
                {!loading && !error && matches.map(match => (
                    // We pass a dummy handleVote since the MatchItem component requires it, but voting happens here.
                    <MatchItem key={match.id} match={match} handleVote={() => {}} /> 
                ))}
            </div>
        </div>
    );
};

export default BrowseDoublesTab;
