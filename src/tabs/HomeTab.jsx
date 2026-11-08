import React, { useState, useEffect } from 'react';
import { onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { getCollectionRef } from '../utils/firestoreUtils.js';
import MatchItem from '../components/MatchItem.jsx';
import AnimalMatcher from '../components/AnimalMatcher.jsx';
import { Box, Card, CardContent, Typography, Grid, Alert, Chip, Stack, Divider } from '@mui/material';

// --- Home & Leaderboard Tab Component ---
const HomeTab = ({ db }) => {
    const [topDoubles, setTopDoubles] = useState([]);
    const [recentDoubles, setRecentDoubles] = useState([]);
    const [error, setError] = useState(null);
    const [testHumanProfile, setTestHumanProfile] = useState(null);

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

    // Temporary effect to load a human profile for testing the AnimalMatcher
    useEffect(() => {
        async function loadHumanProfileForTest() {
            try {
                const humansResponse = await fetch('/humans_characterization.json');
                if (!humansResponse.ok) {
                    throw new Error('Failed to fetch human profiles for test.');
                }
                const allHumans = await humansResponse.json();
                if (allHumans && allHumans.length > 0) {
                    setTestHumanProfile(allHumans[0]); // Load the first profile (Keanu) for testing
                }
            } catch (e) {
                console.error("Error loading human profile for test:", e);
            }
        }
        loadHumanProfileForTest();
    }, []);

    const renderLeaderboardList = (matches, title) => {
        if (error) return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;
        if (!matches.length) return <Typography color="text.secondary" align="center" sx={{ my: 2, fontStyle: 'italic' }}>No {title} yet!</Typography>;

        return (
            <Stack spacing={2}>
                {matches.map((match, index) => {
                    const rankColors = {
                        0: { color: 'warning', borderColor: 'warning.main' }, // 1st place
                        1: { color: 'default', borderColor: 'grey.500' },     // 2nd place
                        2: { color: 'secondary', borderColor: 'secondary.dark' } // 3rd place
                    };
                    const rankStyle = rankColors[index] || { color: 'default', borderColor: 'grey.300' };

                    return (
                        <Card key={match.id} variant="outlined" sx={{ display: 'flex', alignItems: 'center', p: 1.5, boxShadow: 1, borderLeft: 4, borderColor: rankStyle.borderColor }}>
                            <Chip label={`#${index + 1}`} color={rankStyle.color} sx={{ fontWeight: 'bold', fontSize: '1rem', mr: 2, minWidth: '40px' }} />
                            <MatchItem match={match} isHome={true} />
                        </Card>
                    );
                })}
            </Stack>
        );
    };

    return (
        <Box id="tab-home" width="100%">
            {/* Hero Section */}
            <Card sx={{ borderRadius: 4, background: 'linear-gradient(90deg, #e0e7ff 0%, #f3e8ff 50%, #fdf2f8 100%)', boxShadow: 3, mb: 4 }}>
                <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                    <Box>
                        <Typography variant="h3" component="h1" fontWeight="bold" color="text.primary" mb={1} sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
                            🌟 Doppels Leaderboard
                        </Typography>
                        <Typography variant="h6" component="p" color="text.secondary" maxWidth={500} sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                            Discover the top look-alikes, see the latest community matches, and join the fun by voting or adding your own!
                        </Typography>
                    </Box>
                    <Stack direction={{ xs: 'row', sm: 'row' }} spacing={2} alignItems="center" flexShrink={0}>
                        <Chip label={<><span role="img" aria-label="fire">🔥</span> Top {topDoubles.length}</>} color="primary" sx={{ fontWeight: 'bold', fontSize: '1rem', px: 2, py: 2.5 }} />
                        <Chip label={<><span role="img" aria-label="new">🆕</span> {recentDoubles.length} New</>} color="secondary" sx={{ fontWeight: 'bold', fontSize: '1rem', px: 2, py: 2.5 }} />
                    </Stack>
                </CardContent>
            </Card>

            {/* Dashboard Cards */}
            <Grid container spacing={4}>
                {/* Leaderboard Card */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 4, boxShadow: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent>
                            <Typography variant="h5" fontWeight="bold" color="primary" mb={1}>
                                🥇 Top 10 Voted Doppels
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
                    <Card sx={{ borderRadius: 4, boxShadow: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent>
                            <Typography variant="h5" fontWeight="bold" color="secondary" mb={1}>
                                ✨ Recently Added Doppels
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                See the newest matches uploaded by the community.
                            </Typography>
                            {error 
                                ? <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
                                : <Stack spacing={2}>
                                    {recentDoubles.length === 0
                                        ? <Typography color="text.secondary" align="center" sx={{ fontStyle: 'italic', py: 2 }}>Loading recent matches...</Typography>
                                        : recentDoubles.map(match => (
                                            <MatchItem key={match.id} match={match} isHome={true} />
                                        ))}
                                </Stack>}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Temporary Test Section for AnimalMatcher */}
            <Divider sx={{ my: 4 }} />
            <Box>
                <Typography variant="h4" gutterBottom>Animal Matcher Test</Typography>
                {testHumanProfile ? <AnimalMatcher humanProfile={testHumanProfile} /> : <Typography>Loading test profile...</Typography>}
            </Box>

        </Box>
    );
};

export default HomeTab;
