import React, { useState, useCallback } from 'react';
import { saveNewMatch, handleVote, THEMES } from '../utils/firestoreUtils.js';
import { fileToGenerativePart, fetchWithRetry } from '../utils/apiUtils.js';
import { Typography, Box, Divider, FormControl, InputLabel, Select, MenuItem, Button, Alert, CircularProgress, Card, CardContent, Grid } from '@mui/material';

// --- Configuration Constants ---
const API_KEY = ""; // Placeholder for Gemini API Key
const SIMILARITY_MODEL = 'gemini-1.5-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${SIMILARITY_MODEL}:generateContent?key=${API_KEY}`;


// --- Create Your Double Tab Component (AI Matcher) ---
const CreateDoubleTab = ({ db, userId, authReady }) => {
    const [votes, setVotes] = useState(0);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [themeId, setThemeId] = useState('celebrity');

    const handleFindDouble = useCallback(async () => {
        if (!file || !authReady) {
            setError(authReady ? "Please select an image." : "Database not ready.");
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            if (!API_KEY) {
                throw new Error("API_KEY is not set. Please add your Gemini API key.");
            }

            const imagePart = await fileToGenerativePart(file);
            const theme = THEMES[themeId];

            const payload = {
                contents: [{
                    parts: [
                        { text: theme.prompt },
                        imagePart
                    ]
                }],
                generationConfig: {
                    responseMimeType: "application/json",
                }
            };

            const apiResponse = await fetchWithRetry(API_URL, payload);
            const responseText = apiResponse.candidates[0]?.content?.parts[0]?.text;
            if (!responseText) throw new Error("Invalid response structure from API.");

            const aiResult = JSON.parse(responseText);

            const matchId = await saveNewMatch(db, userId, authReady, {
                themeId,
                celebrityMatch: aiResult.celebrityMatch,
                analysis: aiResult.analysis,
                image: imagePart.inlineData.data,
            });

            setResult({
                imageURL: URL.createObjectURL(file),
                themeName: theme.name,
                celebrityMatch: aiResult.celebrityMatch,
                analysis: aiResult.analysis,
                matchId: matchId,
            });
            setVotes(1);

        } catch (err) {
            console.error("AI Matcher Operation failed:", err);
            setError(`Error finding double. Details: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [file, authReady, themeId, db, userId]);

    const handleVoteUp = useCallback(async () => {
        if (!result || votes > 1) return;
        const voteResult = await handleVote(db, userId, result.matchId, votes);
        if (voteResult.success) {
            setVotes(voteResult.newVotes);
        }
    }, [db, userId, result, votes]);

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary" mb={2}>
                Create Your Doppel
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
                Upload your photo and see which celebrity or theme you match with!
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'primary.lightest', border: '2px dashed', borderColor: 'primary.light', borderRadius: 3, p: 2, height: '100%' }}>
                    <CardContent>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel id="themeSelector-label">Choose a Theme</InputLabel>
                            <Select
                                labelId="themeSelector-label"
                                id="themeSelector"
                                value={themeId}
                                label="Choose a Theme"
                                onChange={e => { setThemeId(e.target.value); setResult(null); setError(null); }}
                            >
                                {Object.entries(THEMES).filter(([, theme]) => theme.prompt).map(([id, theme]) => (
                                    <MenuItem key={id} value={id}>{theme.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Box mb={2}>
                            <Button variant="contained" component="label" fullWidth>
                                Upload Your Photo
                                <input type="file" hidden accept="image/*" onChange={e => { setFile(e.target.files[0]); setError(null); setResult(null); }} />
                            </Button>
                            {file && <Typography variant="caption" display="block" mt={1} noWrap>{file.name}</Typography>}
                            {file && <Box component="img" src={URL.createObjectURL(file)} alt="Your uploaded photo" sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 2, mt: 2, boxShadow: 1 }} />}
                        </Box>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mt: 'auto', py: 1.5, fontWeight: 'bold' }}
                            onClick={handleFindDouble}
                            disabled={!file || loading || !authReady}
                        >
                            {loading ? 'Finding Double...' : 'Find My Doppel'}
                        </Button>
                    </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                    {loading && (
                        <Box display="flex" flexDirection="column" alignItems="center" py={6}>
                            <CircularProgress sx={{ mb: 2 }} />
                            <Typography color="primary" fontWeight="bold">Analyzing image for similarity and generating content...</Typography>
                        </Box>
                    )}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                    )}
                    {result && (
                        <Box id="result-display">
                            <Typography variant="h6" fontWeight="bold" color="text.primary" mb={2}>Match Found!</Typography>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} sm={4}><Box component="img" src={result.imageURL} alt="Your uploaded photo" sx={{ width: '100%', borderRadius: 3, boxShadow: 2 }} /></Grid>
                                <Box flex={1}>
                                    <Typography variant="body1" color="text.secondary">
                                        Your look-alike in the <b style={{ color: '#7c3aed' }}>{result.themeName}</b> category is:
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold" color="secondary" mt={1} mb={2}>{result.celebrityMatch}</Typography>
                                    <Typography color="text.secondary" fontStyle="italic" mb={2}>{result.analysis}</Typography>
                                    <Box display="flex" alignItems="center" gap={2} bgcolor="#f3f4f6" p={2} borderRadius={2} border={1} borderColor="#e0e7ff">
                                        <Typography fontWeight="bold" color="text.primary">Is this a great match?</Typography>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            onClick={handleVoteUp}
                                            disabled={votes > 1}
                                            sx={{ borderRadius: 5, fontWeight: 'bold' }}
                                        >
                                            {votes > 1 ? `👍 Voted (${votes})` : `👍 Vote Up (${votes})`}
                                        </Button>
                                    </Box>
                                </Box>
                            </Grid>
                            <Box p={2} bgcolor="#f3f4f6" borderRadius={2} mt={4} textAlign="center" border={1} borderColor="#e5e7eb">
                                <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase" letterSpacing={1} mb={1} display="block">
                                    Advertisement
                                </Typography>
                                <Box id="real-adsense-unit" width="100%" maxWidth={400} mx="auto" height={64} bgcolor="#fff" display="flex" alignItems="center" justifyContent="center" color="text.secondary" fontSize={12} borderRadius={1}>
                                    [AdSense Display Unit Code Goes Here]
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}

export default CreateDoubleTab;
