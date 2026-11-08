
import React, { useState, useEffect } from 'react';
import { onSnapshot, query, limit, where, orderBy } from 'firebase/firestore';
import { getCollectionRef, THEMES } from '../utils/firestoreUtils.js';
import MatchItem from '../components/MatchItem.jsx';
import { Typography, Box, Divider, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress, Grid, Stack } from '@mui/material';

// --- Browse Community Doubles Tab Component ---
const BrowseDoublesTab = ({ db }) => {
    const [selectedTheme, setSelectedTheme] = useState('all');
    const [sortBy, setSortBy] = useState('votes'); // 'votes' or 'timestamp'
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!db) return;

        setLoading(true);
        setError(null);

        const baseCollectionRef = getCollectionRef(db);
        const queryConstraints = [orderBy(sortBy, 'desc'), limit(50)];

        if (selectedTheme === 'all') {
            queryConstraints.unshift(where('themeId', '==', selectedTheme));
        }

        // Note: This requires composite indexes in Firestore for each theme + sort combination.
        // e.g., (themeId, votes, desc) and (themeId, timestamp, desc)
        const matchesQuery = query(baseCollectionRef, ...queryConstraints);

        const unsubscribe = onSnapshot(matchesQuery, (snapshot) => {
            const fetchedMatches = [];
            snapshot.forEach((doc) => fetchedMatches.push(doc.data()));
            setMatches(fetchedMatches);
            setLoading(false);
        }, (err) => {
            console.error("Browse/Explorer Listener Error:", err);
            setError("Error reading matches. You may need to create a composite index in Firestore. Check the console for a link.");
            setLoading(false);
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, [db, selectedTheme, sortBy]);

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary" mb={2}>
                Browse Doppels
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
                Explore all look-alike matches submitted by the community. Vote for your favorites or add your own!
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                <FormControl fullWidth>
                    <InputLabel id="explorer-theme-filter-label">Filter by Theme</InputLabel>
                    <Select
                        labelId="explorer-theme-filter-label"
                        value={selectedTheme}
                        label="Filter by Theme"
                        onChange={(e) => setSelectedTheme(e.target.value)}
                    >
                        <MenuItem value="all">Show All Themes</MenuItem>
                        {Object.entries(THEMES).map(([id, theme]) => (
                            <MenuItem key={id} value={id}>{theme.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id="explorer-sort-by-label">Sort By</InputLabel>
                    <Select labelId="explorer-sort-by-label" value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
                        <MenuItem value="votes">Most Voted</MenuItem>
                        <MenuItem value="timestamp">Most Recent</MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            {loading && <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>}
            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
            {!loading && !error && (
                matches.length === 0 ? (
                    <Typography color="text.secondary" align="center" sx={{ fontStyle: 'italic', py: 4 }}>No matches found for this filter. Be the first to create one!</Typography>
                ) : (
                    <Grid container spacing={3}>
                        {matches.map(match => (
                            <Grid item xs={12} sm={6} md={4} key={match.id}>
                                <MatchItem match={match} />
                            </Grid>
                        ))}
                    </Grid>
                )
            )}
        </Box>
    );
};

export default BrowseDoublesTab;
