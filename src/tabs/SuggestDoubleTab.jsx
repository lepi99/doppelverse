
import React, { useState, useCallback } from 'react';
import { saveUserSuggestedMatch, THEMES } from '../utils/firestoreUtils.js';
import { fileToGenerativePart } from '../utils/apiUtils.js';

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

    const canSubmit = fileA && fileB && famousName.trim() && description.trim() && tags.trim() && authReady && !loading;

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
            
        } catch (err) {
            console.error("User Submitter Operation failed:", err);
            setError(`Submission Error. Details: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [fileA, fileB, famousName, description, tags, themeId, canSubmit, db, userId, authReady]);

    return (
        <div id="tab-double" className="container-card bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Suggest a Double to the Community</h2>
            <p className="text-gray-600 mb-6">Upload photos of a famous person and their striking double, then add your tags and description for the community to vote on!</p>
            
            <div id="suggest-double-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image A: Famous Person */}
                    <div className="p-4 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50">
                        <label htmlFor="imageUploadA" className="block text-lg font-medium text-gray-700 mb-2">1. Famous Person Photo</label>
                        <input type="file" id="imageUploadA" accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer" onChange={(e) => setFileA(e.target.files[0])} />
                        {fileA && <img src={URL.createObjectURL(fileA)} className="rounded-xl mt-3 w-full h-40 object-cover shadow-md" alt="Famous Person Preview" />}
                        <input type="text" value={famousName} onChange={(e) => setFamousName(e.target.value)} placeholder="Name of the Famous Person" className="w-full p-2 border border-gray-300 rounded-lg mt-3" required />
                    </div>

                    {/* Image B: The Double Candidate */}
                    <div className="p-4 border-2 border-dashed border-pink-200 rounded-xl bg-pink-50">
                        <label htmlFor="imageUploadB" className="block text-lg font-medium text-gray-700 mb-2">2. The Candidate Double Photo</label>
                        <input type="file" id="imageUploadB" accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200 cursor-pointer" onChange={(e) => setFileB(e.target.files[0])} />
                        {fileB && <img src={URL.createObjectURL(fileB)} className="rounded-xl mt-3 w-full h-40 object-cover shadow-md" alt="Candidate Double Preview" />}
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    {/* Theme Selector (Primary Category Tag) */}
                    <div>
                        <label htmlFor="suggestThemeSelector" className="block text-lg font-medium text-gray-700 mb-2">3. Primary Category Tag (for filtering)</label>
                        <select 
                            id="suggestThemeSelector" 
                            className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            value={themeId}
                            onChange={(e) => setThemeId(e.target.value)}
                        >
                            {/* Filter themes to only show those configured for AI prompting */}
                            {Object.entries(THEMES).filter(([, theme]) => theme.prompt).map(([id, theme]) => (
                                <option key={id} value={id}>{theme.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Related Tags Input */}
                    <div>
                        <label htmlFor="famousTagsInput" className="block text-lg font-medium text-gray-700 mb-2">4. Related Tags (e.g., Football, Portugal, Funny)</label>
                        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Enter comma-separated tags related to the famous person" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="doubleDescription" className="block text-lg font-medium text-gray-700 mb-2">5. Your Description/Reason (Small description)</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" placeholder="Explain why they are a great match!" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    </div>
                </div>
                
                <button onClick={handleSubmitDouble} className="gradient-button w-full mt-6 py-3 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition duration-300 disabled:opacity-50" disabled={!canSubmit}>
                    {loading ? 'Submitting...' : 'Submit Double'}
                </button>
            </div>

            {loading && (
                <div className="text-center py-8">
                    <div className="loading-spinner h-10 w-10 border-4 border-r-transparent rounded-full mx-auto mb-3 animate-spin"></div>
                    <p className="text-purple-600 font-semibold">Submitting your double to the community...</p>
                </div>
            )}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mt-6">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl relative mt-6">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline">Your double has been submitted and is ready for voting!</span>
                </div>
            )}
        </div>
    );
};

export default SuggestDoubleTab;
