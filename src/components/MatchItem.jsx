import React, { useState, useCallback } from 'react';
import { handleVote } from '../utils/firestoreUtils.js';
import { useFirebase } from '../hooks/useFirebase.js';
import { Card, CardContent, Typography, Chip, Box, Stack, Button, Divider } from '@mui/material';

/**
 * Component for displaying a single match item.
 * @param {object} match - The match data object.
 * @param {boolean} isHome - If true, renders a simplified view for the home/recent lists.
 */
const MatchItem = ({ match, isHome = false }) => {
    const [votes, setVotes] = useState(match.votes);
    const [voted, setVoted] = useState(false);
    const { db, userId } = useFirebase();

    // Memoized handler for voting
    const voteHandler = useCallback(async () => {
        if (voted || !db || !userId) return;
        setVoted(true);
        const result = await handleVote(db, userId, match.id, votes);
        if (result.success) {
            setVotes(result.newVotes);
        } else {
            setVoted(false); // Re-enable if the vote failed
        }
    }, [db, userId, match.id, votes, voted]);

    let imageHtml;
    let title;
    let description = match.analysis ? match.analysis.substring(0, 100) + '...' : 'No description provided.';
    let tagsHtml = '';

    if (match.matchType === 'user_suggested' && match.famousImageBase64) {
        // User Suggested Double (two images)
        imageHtml = (
            <div className="flex space-x-2">
                <div className="relative">
                    <img src={`data:image/jpeg;base64,${match.famousImageBase64}`} className="w-20 h-20 object-cover rounded-lg shadow-md" onError={(e) => e.target.src = 'https://placehold.co/80x80/6366F1/FFFFFF?text=Famous'} alt="Famous Person" />
                    <span className="absolute -top-2 -left-2 bg-indigo-600 text-white text-xs px-1 rounded">Famous</span>
                </div>
                <div className="relative">
                    <img src={`data:image/jpeg;base64,${match.userImageBase64}`} className="w-20 h-20 object-cover rounded-lg shadow-md" onError={(e) => e.target.src = 'https://placehold.co/80x80/EC4899/FFFFFF?text=Double'} alt="Candidate Double" />
                    <span className="absolute -top-2 -left-2 bg-pink-500 text-white text-xs px-1 rounded">Double</span>
                </div>
            </div>
        );
        title = `${match.celebrityName} vs. Candidate`;
        description = match.analysis;

        if (match.customTags && match.customTags.length > 0) {
            tagsHtml = <div className="mt-1 flex flex-wrap gap-1">{match.customTags.map(tag => <span key={tag} className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{tag}</span>)}</div>;
        }
    } else {
        // AI Generated Double (one image)
        imageHtml = (
            <img src={`data:image/jpeg;base64,${match.userImageBase64}`} className="w-20 h-20 object-cover rounded-lg mr-4 mb-2 sm:mb-0 shadow-md" onError={(e) => e.target.src = 'https://placehold.co/80x80/EEEEEE/AAAAAA?text=Image'} alt="User Match" />
        );
        title = match.celebrityName;
    }

    if (isHome) {
        // MUI Card for Home/Recent Doubles
        return (
            <Card variant="outlined" sx={{ mb: 1, borderRadius: 2, boxShadow: 1 }}>
                <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box flexGrow={1}>
                            <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
                            <Typography variant="caption" color="primary" fontStyle="italic">Theme: {match.themeName} | Votes: {votes}</Typography>
                            {tagsHtml && <Box mt={1}>{tagsHtml}</Box>}
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        );
    }
    // Detailed view for Explorer (keep Tailwind for now)
    return (
        <div className="flex flex-col sm:flex-row p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex-shrink-0 mr-4 mb-2 sm:mb-0">
                {imageHtml}
            </div>
            <div className="flex-grow">
                <p className="text-xl font-extrabold text-purple-600">{title}</p>
                <p className="text-sm text-gray-700 italic">{description}</p>
                {tagsHtml}
                <div className="mt-2 text-xs text-gray-500 flex justify-between items-center">
                    <span>Category: <span className="font-semibold">{match.themeName}</span></span>
                    <button
                        onClick={voteHandler}
                        disabled={voted}
                        className="vote-button bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded-full flex items-center shadow-md disabled:opacity-50 text-sm"
                    >
                        {voted ? `👍 Voted (${votes})` : `👍 Vote Up (${votes})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatchItem;

