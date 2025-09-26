import React, { useState, useEffect } from 'react';
import { onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { getCollectionRef } from '../utils/firestoreUtils.js';
import MatchItem from '../components/MatchItem.jsx';

// --- Home & Leaderboard Tab Component ---
const HomeTab = ({ db }) => {
    const [topDoubles, setTopDoubles] = useState([]);
    const [recentDoubles, setRecentDoubles] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!db) return;

        // Top Doubles Listener
        // NOTE: We fetch 50 documents and sort client-side, matching the original implementation's constraint
        const topDoublesQuery = query(getCollectionRef(db), limit(50));
        const unsubscribeTop = onSnapshot(topDoublesQuery, (snapshot) => {
            let matches = [];
            snapshot.forEach((doc) => matches.push(doc.data()));
            matches.sort((a, b) => b.votes - a.votes);
            setTopDoubles(matches.slice(0, 10)); // Display top 10
            setError(null);
        }, (err) => {
            console.error("Top Doubles Listener Error:", err);
            setError("Error: Insufficient permissions for Leaderboard read. (Check Firestore Rules)");
        });

        // Recent Doubles Listener
        const recentDoublesQuery = query(getCollectionRef(db), orderBy("timestamp", "desc"), limit(5));
        const unsubscribeRecent = onSnapshot(recentDoublesQuery, (snapshot) => {
            let matches = [];
            snapshot.forEach((doc) => matches.push(doc.data()));
            setRecentDoubles(matches);
        }, (err) => {
            console.error("Recent Doubles Listener Error:", err);
            // Don't overwrite the main error
        });

        return () => {
            unsubscribeTop();
            unsubscribeRecent();
        };
    }, [db]);

    const renderLeaderboardList = (matches, title) => {
        if (error) return <p className="text-red-500 text-center py-4">{error}</p>;
        if (!matches.length) return <p className="text-gray-500 italic text-center py-4">No {title} yet!</p>;

        return (
            <div className="space-y-3">
                {matches.map((match, index) => (
                    <div key={match.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:bg-indigo-50 transition duration-150">
                        <span className={`text-xl font-black ${index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-500' : index === 2 ? 'text-amber-700' : 'text-gray-700'}`}>
                            #{index + 1}
                        </span>
                        <div className="flex-grow">
                            <p className="font-semibold text-gray-800">{match.celebrityName}</p>
                            <p className="text-xs text-indigo-500 italic">{match.themeName}</p>
                        </div>
                        <span className="text-lg font-bold text-indigo-600">{match.votes} Votes</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div id="tab-home" className="container-card bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Top Doubles & Community Buzz</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold text-indigo-700 mb-3">🥇 Top 10 Voted Doubles</h3>
                    <div className="text-xs text-gray-500 mb-4">Ranked by community votes across all themes.</div>
                    {renderLeaderboardList(topDoubles, 'doubles voted on')}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-purple-700 mb-3">✨ Recently Added Doubles</h3>
                    <div className="text-xs text-gray-500 mb-4">See the newest matches uploaded by the community.</div>
                    <div className="space-y-3">
                        {recentDoubles.length === 0 && !error
                            ? <p className="text-gray-500 italic text-center py-4">Loading recent matches...</p>
                            : recentDoubles.map(match => (
                                <MatchItem key={match.id} match={match} isHome={true} />
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeTab;

