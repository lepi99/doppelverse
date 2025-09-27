import React, { useState, useEffect } from 'react';
import { onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { getCollectionRef } from '../utils/firestoreUtils.js';
import MatchItem from '../components/MatchItem.jsx';
import { Box, Card, CardContent, Typography, Grid, Alert, Chip, Stack, Divider } from '@mui/material';

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
        if (error) return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;
        if (!matches.length) return <Typography color="text.secondary" align="center" sx={{ my: 2, fontStyle: 'italic' }}>No {title} yet!</Typography>;

        return (
            <Stack spacing={2}>
                {matches.map((match, index) => (
                    <Card key={match.id} variant="outlined" sx={{ display: 'flex', alignItems: 'center', p: 1, boxShadow: 1, borderLeft: 4, borderColor: index === 0 ? 'warning.main' : index === 1 ? 'grey.500' : index === 2 ? 'secondary.main' : 'grey.300' }}>
                        <Chip label={`#${index + 1}`} color={index === 0 ? 'warning' : index === 1 ? 'default' : index === 2 ? 'secondary' : 'default'} sx={{ fontWeight: 'bold', fontSize: 18, mr: 2 }} />
                        <Box flexGrow={1}>
                            <Typography variant="subtitle1" fontWeight="bold">{match.celebrityName}</Typography>
                            <Typography variant="caption" color="primary" fontStyle="italic">{match.themeName}</Typography>
                        </Box>
                        <Typography variant="h6" color="primary.main">{match.votes} Votes</Typography>
                    </Card>
                ))}
            </Stack>
        );
    };

    return (
        <Box id="tab-home" width="100%">
            {/* Hero Section */}
            <Card sx={{ borderRadius: 4, background: 'linear-gradient(90deg, #e0e7ff 0%, #f3e8ff 50%, #fdf2f8 100%)', boxShadow: 6, mb: 6 }}>
                <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                    <Box>
                        <Typography variant="h3" fontWeight="bold" color="text.primary" mb={1}>
                            🌟 Doppels Leaderboard
                        </Typography>
                        <Typography variant="h6" color="text.secondary" maxWidth={500}>
                            Discover the top look-alikes, see the latest community matches, and join the fun by voting or adding your own double!
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Chip label={<><span role="img" aria-label="fire">🔥</span> {topDoubles.length} Top Doubles</>} color="primary" sx={{ fontWeight: 'bold', fontSize: 18, px: 2, py: 1 }} />
                        <Chip label={<><span role="img" aria-label="new">🆕</span> {recentDoubles.length} New</>} color="secondary" sx={{ fontWeight: 'bold', fontSize: 18, px: 2, py: 1 }} />
                    </Stack>
                </CardContent>
            </Card>

            {/* Dashboard Cards */}
            <Grid container spacing={4}>
                {/* Leaderboard Card */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 4, boxShadow: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent>
                            <Typography variant="h5" fontWeight="bold" color="primary" mb={1}>
                                🥇 Top 10 Voted Doubles
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Ranked by community votes across all themes.
                            </Typography>
                            {renderLeaderboardList(topDoubles, 'doubles voted on')}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Doubles Card */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 4, boxShadow: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent>
                            <Typography variant="h5" fontWeight="bold" color="secondary" mb={1}>
                                ✨ Recently Added Doubles
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                See the newest matches uploaded by the community.
                            </Typography>
                            <Stack spacing={2}>
                                {recentDoubles.length === 0 && !error
                                    ? <Typography color="text.secondary" align="center" sx={{ fontStyle: 'italic' }}>Loading recent matches...</Typography>
                                    : recentDoubles.map(match => (
                                        <MatchItem key={match.id} match={match} isHome={true} />
                                    ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default HomeTab;

