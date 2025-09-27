
import React, { useState, useEffect } from 'react';
import { onSnapshot, query, limit, where } from 'firebase/firestore';
import { getCollectionRef, THEMES } from '../utils/firestoreUtils.js';
import MatchItem from '../components/MatchItem.jsx';
import { Typography, Box, Stack, Divider, FormControl, InputLabel, Select, MenuItem, Paper, Alert, CircularProgress } from '@mui/material';

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
        <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary" mb={2}>
                Browse Dopples
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
                Explore all look-alike matches submitted by the community. Vote for your favorites or add your own!
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <FormControl fullWidth sx={{ mb: 4 }}>
                <InputLabel id="explorerThemeFilter-label">Filter by Theme</InputLabel>
                <Select
                    labelId="explorerThemeFilter-label"
                    id="explorerThemeFilter"
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

            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f3f4f6', maxHeight: '60vh', overflowY: 'auto' }}>
                {loading && <Box display="flex" justifyContent="center" alignItems="center" py={6}><CircularProgress /></Box>}
                {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
                {!loading && !error && matches.length === 0 && (
                    <Typography color="text.secondary" align="center" sx={{ fontStyle: 'italic', py: 4 }}>
                        No matches found for this theme. Be the first to upload!
                    </Typography>
                )}
                {!loading && !error && matches.map(match => (
                    <Box key={match.id} mb={2}>
                        <MatchItem match={match} handleVote={() => {}} />
                    </Box>
                ))}
            </Paper>
        </Box>
    );
};

export default BrowseDoublesTab;
