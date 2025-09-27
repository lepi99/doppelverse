import React, { useState, useCallback } from 'react';
import { saveNewMatch, handleVote, THEMES } from '../utils/firestoreUtils.js';
import { fileToGenerativePart, fetchWithRetry } from '../utils/apiUtils.js';
import { Typography, Box, Divider, FormControl, InputLabel, Select, MenuItem, Button, Alert, CircularProgress, Card, CardContent } from '@mui/material';

// --- Configuration Constants ---
const API_KEY = ""; // Placeholder for Gemini API Key
const SIMILARITY_MODEL = 'gemini-2.5-flash-preview-05-20';
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
        try {
            // Simulate image analysis and result
            // Replace this with your actual logic as needed
            setTimeout(() => {
                setResult({
                    imageURL: URL.createObjectURL(file),
                    themeName: THEMES[themeId]?.name || '',
                    celebrityMatch: 'Sample Celebrity',
                    analysis: 'Sample analysis text.',
                    matchId: 'mock-id',
                });
                setVotes(1);
                setLoading(false);
            }, 1500);
        } catch (err) {
            setError('Error finding double.');
            setLoading(false);
        }
    }, [file, authReady, themeId]);
    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary" mb={2}>
                Create Your Double
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
                Upload your photo and see which celebrity or theme you match with!
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
                <Card sx={{ flex: 1, bgcolor: 'indigo.50', border: '2px dashed #a5b4fc', borderRadius: 3 }}>
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
                            <Typography variant="subtitle1" fontWeight="bold" mb={1}>Upload Your Photo</Typography>
                            <input
                                type="file"
                                id="imageUpload"
                                accept="image/*"
                                style={{ display: 'block', marginBottom: 8 }}
                                onChange={e => { setFile(e.target.files[0]); setError(null); setResult(null); }}
                            />
                            {file && <Typography variant="caption" color="text.secondary">{file.name}</Typography>}
                        </Box>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mt: 2, py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
                            onClick={handleFindDouble}
                            disabled={!file || loading || !authReady}
                        >
                            {loading ? 'Finding Double...' : 'Find My Double'}
                        </Button>
                    </CardContent>
                </Card>
                <Box flex={2}>
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
                            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="center" gap={4} mb={4}>
                                <Box width={{ xs: '100%', sm: 180 }}>
                                    <img
                                        style={{ borderRadius: 16, width: '100%', height: 'auto', objectFit: 'cover', boxShadow: '0 2px 8px #e0e7ff' }}
                                        src={result.imageURL}
                                        alt="Your uploaded photo"
                                    />
                                </Box>
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
                                            sx={{ borderRadius: 2, fontWeight: 'bold' }}
                                        >
                                            {votes > 1 ? `👍 Voted (${votes})` : `👍 Vote Up (${votes})`}
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                            <Box p={4} bgcolor="#f3f4f6" borderRadius={2} mt={4} textAlign="center" border={2} borderColor="#e0e7ff" borderStyle="dashed">
                                <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase" letterSpacing={1} mb={1} display="block">
                                    Advertisement
                                </Typography>
                                <Box id="real-adsense-unit" width="100%" maxWidth={400} mx="auto" height={64} bgcolor="#fff" display="flex" alignItems="center" justifyContent="center" color="text.secondary" fontSize={12} borderRadius={1}>
                                    [AdSense Display Unit Code Goes Here]
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

export default CreateDoubleTab;

