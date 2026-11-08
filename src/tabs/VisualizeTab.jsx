import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Box, Grid, Card, CardMedia, CardContent, Typography, CircularProgress, Alert, Link } from '@mui/material';

const VisualizeTab = ({ db, userId }) => {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Wait for both the db connection and the user to be authenticated
        if (!db || !userId) {
            // Wait for the db connection to be established
            // If there's no user, we can't fetch data due to security rules.
            // We'll show a message instead of being stuck on loading.
            if (!userId) {
                setLoading(false);
            }
            return;
        }

        const charactersCollection = collection(db, 'characters');
        const q = query(charactersCollection, orderBy('name')); // Order by name for consistency

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedCharacters = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCharacters(fetchedCharacters);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching characters:", err);
            setError("Failed to fetch characters from the database.");
            setLoading(false);
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, [db, userId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" py={6}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading characters...</Typography>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!userId) {
        return (
            <Alert severity="warning">Please log in to view the database content.</Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary" mb={2}>
                Visualize Database
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
                Here are all the characters currently in the database.
            </Typography>
            <Grid container spacing={3}>
                {characters.length === 0 ? (
                    <Grid item xs={12}><Alert severity="info">No characters found. Use the "Upload" tab to add some!</Alert></Grid>
                ) : (
                    characters.map((char) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={char.id}>
                            <Card sx={{ height: '100%' }}>
                                <CardMedia component="img" height="200" image={char.photo} alt={char.name} sx={{ objectFit: 'cover' }} />
                                <CardContent>
                                    <Typography gutterBottom variant="h6" component="div" noWrap title={char.name}>{char.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">Type: {char.type}</Typography>
                                    {char.photo_credit && <Typography variant="caption" color="text.secondary">Credit: <Link href={char.photo_credit} target="_blank" rel="noopener">{char.photo_credit}</Link></Typography>}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );
};

export default VisualizeTab;