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

    const renderImages = () => {
        if (match.matchType === 'user_suggested' && match.famousImageBase64) {
            return (
                <Stack direction="row" spacing={1}>
                    <Box position="relative">
                        <Box component="img" src={`data:image/jpeg;base64,${match.famousImageBase64}`} alt="Famous Person" onError={(e) => e.target.src = 'https://placehold.co/80x80/6366F1/FFFFFF?text=Famous'} sx={{ width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 }, objectFit: 'cover', borderRadius: 1.5, boxShadow: 1 }} />
                        <Chip label="Famous" size="small" sx={{ position: 'absolute', top: -8, left: -8, bgcolor: 'primary.main', color: 'white', height: 18, fontSize: '0.65rem' }} />
                    </Box>
                    <Box position="relative">
                        <Box component="img" src={`data:image/jpeg;base64,${match.userImageBase64}`} alt="Candidate Double" onError={(e) => e.target.src = 'https://placehold.co/80x80/EC4899/FFFFFF?text=Double'} sx={{ width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 }, objectFit: 'cover', borderRadius: 1.5, boxShadow: 1 }} />
                        <Chip label="Double" size="small" sx={{ position: 'absolute', top: -8, left: -8, bgcolor: 'secondary.main', color: 'white', height: 18, fontSize: '0.65rem' }} />
                    </Box>
                </Stack>
            );
        }
        return (
            <Box component="img" src={`data:image/jpeg;base64,${match.userImageBase64}`} alt="User Match" onError={(e) => e.target.src = 'https://placehold.co/80x80/EEEEEE/AAAAAA?text=Image'} sx={{ width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 }, objectFit: 'cover', borderRadius: 1.5, boxShadow: 1 }} />
        );
    };

    const renderTags = () => {
        if (match.customTags && match.customTags.length > 0) {
            return (
                <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
                    {match.customTags.map(tag => <Chip key={tag} label={tag} size="small" sx={{ bgcolor: 'grey.200', color: 'text.secondary', fontSize: '0.7rem' }} />)}
                </Stack>
            );
        }
        return null;
    };

    const title = match.matchType === 'user_suggested' ? `${match.celebrityName} vs. Candidate` : match.celebrityName;
    const description = match.analysis ? (match.analysis.length > 100 ? match.analysis.substring(0, 100) + '...' : match.analysis) : 'No description provided.';

    if (isHome) {
        // Simplified view for Home/Leaderboard
        return (
            <Stack direction="row" alignItems="center" spacing={2} flexGrow={1}>
                {renderImages()}
                <Box flexGrow={1}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>{title}</Typography>
                    <Typography variant="caption" color="primary" fontStyle="italic">Theme: {match.themeName} | Votes: {votes}</Typography>
                    {renderTags()}
                </Box>
            </Stack>
        );
    }

    // Detailed view for Browse/Explorer tab
    return (
        <Card variant="outlined" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, p: 2, gap: 2 }}>
            <Box flexShrink={0}>
                {renderImages()}
            </Box>
            <Box flexGrow={1}>
                <Typography variant="h6" fontWeight="bold" color="primary.dark">{title}</Typography>
                <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ mb: 1 }}>{description}</Typography>
                {renderTags()}
                <Divider sx={{ my: 1.5 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">Category: <Box component="span" fontWeight="bold">{match.themeName}</Box></Typography>
                    <Button onClick={voteHandler} disabled={voted} variant="contained" color="success" size="small" sx={{ borderRadius: 5, px: 1.5 }}>
                        {voted ? `👍 Voted (${votes})` : `👍 Vote Up (${votes})`}
                    </Button>
                </Stack>
            </Box>
        </Card>
    );
};

export default MatchItem;
