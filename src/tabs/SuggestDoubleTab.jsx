
import React, { useState, useCallback } from 'react';
import { saveUserSuggestedMatch, THEMES } from '../utils/firestoreUtils.js';
import { fileToGenerativePart } from '../utils/apiUtils.js';
import { Box, Typography, Divider, Grid, Card, CardContent, TextField, Button, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress } from '@mui/material';

// --- Suggest a Double Tab Component (User Submitter) ---
const SuggestDoubleTab = ({ db, userId, authReady }) => {
    const [fileA, setFileA] = useState(null);
    const [fileB, setFileB] = useState(null);
    const [famousName, setFamousName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [themeId, setThemeId] = useState('celebrity');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const canSubmit = fileA && fileB && famousName.trim() && description.trim() && authReady && !loading;

    const handleSubmitDouble = useCallback(async () => {
        if (!canSubmit) return;
 
        setLoading(true);
        setError(null);
        setSuccess(false);
 
        try {
            // Convert both files to Base64
            const famousImagePart = await fileToGenerativePart(fileA);
            const candidateImagePart = await fileToGenerativePart(fileB);
 
            const matchId = await saveUserSuggestedMatch(
                db,
                userId,
                authReady,
                famousName,
                candidateImagePart.inlineData.data,
                famousImagePart.inlineData.data,
                themeId,
                tags,
                description
            );
 
            if (!matchId) throw new Error("Failed to save match data. Check Firestore write permissions.");
 
            setSuccess(true);
            // Reset form fields
            setFileA(null);
            setFileB(null);
            setFamousName('');
            setDescription('');
            setTags('');
            setThemeId('celebrity');
 
        } catch (err) {
            console.error("User Submitter Operation failed:", err);
            setError(`Submission Error. Details: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [fileA, fileB, famousName, description, tags, themeId, db, userId, authReady, canSubmit]);

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary" mb={2}>
                Suggest a Doppel
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
                Know a great look-alike? Suggest a new match for the community to vote on!
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: 'secondary.lightest', border: '2px dashed', borderColor: 'secondary.light', borderRadius: 3, p: 2 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2}>1. Famous Person</Typography>
                            <Button variant="contained" component="label" fullWidth>
                                Upload Photo
                                <input type="file" hidden accept="image/*" onChange={(e) => setFileA(e.target.files[0])} />
                            </Button>
                            {fileA && <Typography variant="caption" display="block" mt={1} noWrap>{fileA.name}</Typography>}
                            {fileA && <Box component="img" src={URL.createObjectURL(fileA)} alt="Famous person preview" sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 2, mt: 2, boxShadow: 1 }} />}
                            <TextField label="Name of Famous Person" value={famousName} onChange={(e) => setFamousName(e.target.value)} fullWidth margin="normal" required />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: 'primary.lightest', border: '2px dashed', borderColor: 'primary.light', borderRadius: 3, p: 2 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2}>2. The Doppel Match</Typography>
                            <Button variant="contained" component="label" fullWidth>
                                Upload Photo
                                <input type="file" hidden accept="image/*" onChange={(e) => setFileB(e.target.files[0])} />
                            </Button>
                            {fileB && <Typography variant="caption" display="block" mt={1} noWrap>{fileB.name}</Typography>}
                            {fileB && <Box component="img" src={URL.createObjectURL(fileB)} alt="Candidate double preview" sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 2, mt: 2, boxShadow: 1 }} />}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box mt={4}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel id="suggest-theme-label">3. Primary Category</InputLabel>
                            <Select labelId="suggest-theme-label" value={themeId} label="3. Primary Category" onChange={(e) => setThemeId(e.target.value)}>
                                {Object.entries(THEMES).map(([id, theme]) => (
                                    <MenuItem key={id} value={id}>{theme.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="4. Related Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} fullWidth placeholder="e.g., Football, Portugal, Funny" />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="5. Your Description/Reason" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={3} placeholder="Explain why they are a great match!" required />
                    </Grid>
                </Grid>
            </Box>

            <Button onClick={handleSubmitDouble} variant="contained" size="large" fullWidth sx={{ mt: 4, py: 1.5, fontWeight: 'bold' }} disabled={!canSubmit}>
                {loading ? 'Submitting...' : 'Submit Double for Voting'}
            </Button>

            {/* --- Feedback Section --- */}
            {loading && (
                <Box textAlign="center" py={4}>
                    <CircularProgress />
                    <Typography color="primary" fontWeight="bold" mt={2}>Submitting your double to the community...</Typography>
                </Box>
            )}
            {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 3 }}>Success! Your double has been submitted and is ready for voting!</Alert>}
        </Box>
    );
};

export default SuggestDoubleTab;
