import React, { useState, useCallback } from 'react';
import { saveNewMatch, handleVote, THEMES } from '../utils/firestoreUtils.js';
import { fileToGenerativePart, fetchWithRetry } from '../utils/apiUtils.js';

// --- Configuration Constants ---
const API_KEY = ""; // Placeholder for Gemini API Key
const SIMILARITY_MODEL = 'gemini-2.5-flash-preview-05-20';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${SIMILARITY_MODEL}:generateContent?key=${API_KEY}`;


// --- Create Your Double Tab Component (AI Matcher) ---
const CreateDoubleTab = ({ db, userId, authReady }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [themeId, setThemeId] = useState('celebrity');
    const [votes, setVotes] = useState(0);

    const generateSimilarity = useCallback(async (imagePart, themeConfig) => {
        const payload = {
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: themeConfig.prompt },
                        imagePart
                    ]
                }
            ],
            systemInstruction: {
                parts: [{ text: themeConfig.systemInstruction }]
            },
            config: { temperature: 0.7 }
        };

        const result = await fetchWithRetry(API_URL, payload);
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("Could not extract text from similarity analysis.");

        const firstSentence = text.split('. ')[0].trim();
        const comparisonMatch = firstSentence.replace(/^(The person in this image strongly resembles|The person looks like|You look like|The match is|You resemble|The resemblance is to|The match is)\s*/i, '').replace(/\.$/, '').trim();
        
        return {
            celebrityMatch: comparisonMatch,
            analysis: text,
            themeName: themeConfig.name,
            themeId: themeId,
        };
    }, [themeId]);

    const handleFindDouble = useCallback(async () => {
        if (!file || !authReady) {
            setError(authReady ? "Please select an image." : "Database not ready.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setVotes(0);

        try {
            const imagePart = await fileToGenerativePart(file);
            const base64Image = imagePart.inlineData.data;
            const themeConfig = THEMES[themeId];

            // 1. Find Match (API Call)
            const similarityData = await generateSimilarity(imagePart, themeConfig);
            
            // 2. Save Match to Firestore and get ID
            const matchId = await saveNewMatch(db, userId, authReady, {
                ...similarityData,
                image: base64Image,
            });

            if (!matchId) throw new Error("Failed to save match data. Check Firestore write permissions.");

            setResult({
                ...similarityData,
                matchId,
                imageURL: URL.createObjectURL(file),
            });
            setVotes(1);

        } catch (err) {
            console.error("AI Matcher Operation failed:", err);
            setError(`AI/Database Error. Details: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [file, authReady, themeId, generateSimilarity, db, userId]);

    const handleVoteUp = useCallback(async () => {
        if (!result || !result.matchId || votes === 0) return;
        
        const voteResult = await handleVote(db, userId, result.matchId, votes);
        if (voteResult.success) {
            setVotes(voteResult.newVotes);
        } else {
            setError("Failed to record vote. Please check network connection.");
        }
    }, [db, userId, result, votes]);

    return (
        <div id="tab-single" className="container-card bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Create Your Double</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div id="input-section" className="p-4 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50">
                        <label htmlFor="themeSelector" className="block text-lg font-medium text-gray-700 mb-2">1. Choose a Theme</label>
                        <select 
                            id="themeSelector" 
                            className="w-full p-3 mb-4 border border-indigo-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            value={themeId}
                            onChange={(e) => { setThemeId(e.target.value); setResult(null); setError(null); }}
                        >
                            {/* Filter themes to only show those configured for AI prompting */}
                            {Object.entries(THEMES).filter(([, theme]) => theme.prompt).map(([id, theme]) => (
                                <option key={id} value={id}>{theme.name}</option>
                            ))}
                        </select>

                        <label htmlFor="imageUpload" className="block text-lg font-medium text-gray-700 mb-2">2. Upload Your Photo</label>
                        <input 
                            type="file" 
                            id="imageUpload" 
                            accept="image/*" 
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer"
                            onChange={(e) => { setFile(e.target.files[0]); setError(null); setResult(null); }}
                        />
                        
                        <button 
                            onClick={handleFindDouble} 
                            className="gradient-button w-full mt-4 py-3 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition duration-300 disabled:opacity-50" 
                            disabled={!file || loading || !authReady}
                        >
                            {loading ? 'Finding Double...' : 'Find My Double'}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    {loading && (
                        <div className="text-center py-12">
                            <div className="loading-spinner h-12 w-12 border-4 border-r-transparent rounded-full mx-auto mb-4 animate-spin"></div>
                            <p className="text-indigo-600 font-semibold">Analyzing image for similarity and generating content...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-6" role="alert">
                            <strong className="font-bold">Error:</strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {result && (
                        <div id="result-display">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Match Found!</h3>
                            
                            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-6">
                                <div className="w-full sm:w-1/3">
                                    <img 
                                        className="rounded-xl w-full h-auto object-cover shadow-md" 
                                        src={result.imageURL} 
                                        alt="Your uploaded photo" 
                                    />
                                </div>
                                <div className="w-full sm:w-2/3">
                                    <p className="text-lg text-gray-700">
                                        Your look-alike in the <span className="font-semibold text-purple-600">{result.themeName}</span> category is:
                                    </p>
                                    <p className="text-3xl font-extrabold text-purple-600 mt-1 mb-4">{result.celebrityMatch}</p>
                                    <p className="text-gray-600 italic mb-4">{result.analysis}</p>
                                    
                                    <div data-match-id={result.matchId} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg border">
                                        <span className="text-base font-semibold text-gray-700">Is this a great match?</span>
                                        <button 
                                            onClick={handleVoteUp}
                                            disabled={votes > 1}
                                            className="vote-button bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-full flex items-center shadow-md disabled:opacity-50" 
                                        >
                                            {votes > 1 ? `👍 Voted (${votes})` : `👍 Vote Up (${votes})`}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Google AdSense Unit Placeholder */}
                            <div className="p-6 bg-gray-100 rounded-xl mt-8 text-center border-4 border-dashed border-gray-300">
                                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                    Advertisement
                                </h2>
                                {/* INSERT YOUR REAL AD SENSE CODE HERE */}
                                <div id="real-adsense-unit" className="w-full max-w-lg mx-auto h-32 bg-white flex items-center justify-center text-gray-500 text-xs rounded-lg">
                                    [AdSense Display Unit Code Goes Here]
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateDoubleTab;

