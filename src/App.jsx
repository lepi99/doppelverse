

import React, { useState, useEffect } from 'react';
import { useFirebase } from './hooks/useFirebase.js';
import HomeTab from './tabs/HomeTab.jsx';
import BrowseDoublesTab from './tabs/BrowseDoublesTab.jsx';
import CreateDoubleTab from './tabs/CreateDoubleTab.jsx';
import SuggestDoubleTab from './tabs/SuggestDoubleTab.jsx';
import { Tabs, Tab, Box, Paper } from '@mui/material';
const LOGO_ICON_BASE = {
    fontSize: '1.25em',
    fontWeight: '900',
    display: 'inline-block',
    color: '#9333EA',
    lineHeight: '0.8',
    marginRight: '-0.2em',
    transform: 'scaleX(-1)',
    transition: 'transform 0.5s cubic-bezier(0.4,2,0.3,1)',
};

// --- Main Application Component (Router) ---
const App = () => {
    // --- Animated D rotation ---
    const [dAngle, setDAngle] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            // 1 in 3 chance to rotate, else stay
            if (Math.random() < 0.33) {
                // Pick a random angle between -30 and 30
                setDAngle(Math.floor(Math.random() * 61) - 30);
            } else {
                setDAngle(0);
            }
        }, 2000 + Math.random() * 2000); // 2-4 seconds
        return () => clearInterval(interval);
    }, []);
    const [activeTab, setActiveTab] = useState('home');
    const { db, userId, authReady } = useFirebase();

    const renderTab = () => {
        if (!authReady) {
            return (
                <div className="text-center py-16">
                    <div className="loading-spinner h-16 w-16 border-8 border-r-transparent rounded-full mx-auto mb-4 animate-spin"></div>
                    <p className="text-gray-600 font-semibold">Initializing database and user authentication...</p>
                </div>
            );
        }

        const tabProps = { db, userId, authReady };

        switch (activeTab) {
            case 'home':
                return <HomeTab {...tabProps} />;
            case 'explorer':
                return <BrowseDoublesTab {...tabProps} />;
            case 'single':
                return <CreateDoubleTab {...tabProps} />;
            case 'double':
                return <SuggestDoubleTab {...tabProps} />;
            default:
                return <HomeTab {...tabProps} />;
        }
    };

    return (
        <Box minHeight="100vh" p={{ xs: 2, sm: 4 }} display="flex" justifyContent="center" alignItems="flex-start" bgcolor="linear-gradient(135deg, #f3f4f6 0%, #e0e7ff 100%)">
            <Box width="100%" maxWidth={1200} boxShadow={6} borderRadius={4} bgcolor="#fff" p={{ xs: 2, sm: 6 }}>
                {/* LOGO */}
                <Box display="flex" alignItems="center" mb={2}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center' }}>
                        <span style={{ ...LOGO_ICON_BASE, transform: `scaleX(-1) rotate(${dAngle}deg)` }}>D</span>&nbsp;o<span style={{ color: '#6366f1' }}>ppel</span>&nbsp;Verse
                    </h1>
                </Box>
                <Box id="auth-status" color="text.secondary" fontSize={12} mb={4}>
                    {userId ? `User ID: ${userId} | Database Ready` : 'Connecting to database...'}
                </Box>

                {/* MUI Tabs Navigation - no Paper, custom tab color */}
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant="fullWidth"
                    textColor="primary"
                    indicatorColor="primary"
                    aria-label="Doppelverse Tabs"
                    sx={{ borderRadius: 2, mb: 4, minHeight: 48, alignItems: 'center' }}
                    TabIndicatorProps={{
                        style: {
                            height: 0,
                            background: 'transparent',
                        }
                    }}
                >
                    <Tab label="🏆 Home & Leaderboard" value="home" sx={{ minWidth: 150, fontWeight: 600, fontSize: 15, borderRadius: 2, mx: 1, bgcolor: '#e0e7ff', color: '#3730a3', border: '2px solid #c7d2fe', boxShadow: 1, height: 40, px: 3, transition: 'background 0.2s, border 0.2s', '&:hover': { bgcolor: '#c7d2fe', borderColor: '#a5b4fc' } }} />
                    <Tab label="🔍 Browse Dopples" value="explorer" sx={{ minWidth: 180, fontWeight: 600, fontSize: 15, borderRadius: 2, mx: 1, bgcolor: '#e0e7ff', color: '#3730a3', border: '2px solid #c7d2fe', boxShadow: 1, height: 40, px: 3, transition: 'background 0.2s, border 0.2s', '&:hover': { bgcolor: '#c7d2fe', borderColor: '#a5b4fc' } }} />
                    <Tab label="✨ Create Your Dopple" value="single" sx={{ minWidth: 150, fontWeight: 600, fontSize: 15, borderRadius: 2, mx: 1, bgcolor: '#e0e7ff', color: '#3730a3', border: '2px solid #c7d2fe', boxShadow: 1, height: 40, px: 3, transition: 'background 0.2s, border 0.2s', '&:hover': { bgcolor: '#c7d2fe', borderColor: '#a5b4fc' } }} />
                    <Tab label="💡 Suggest a Dopple" value="double" sx={{ minWidth: 150, fontWeight: 600, fontSize: 15, borderRadius: 2, mx: 1, bgcolor: '#e0e7ff', color: '#3730a3', border: '2px solid #c7d2fe', boxShadow: 1, height: 40, px: 3, transition: 'background 0.2s, border 0.2s', '&:hover': { bgcolor: '#c7d2fe', borderColor: '#a5b4fc' } }} />
                </Tabs>

                {/* Tab Content: wrap all tab pages in consistent Paper/Card styling */}
                <Paper elevation={1} sx={{ borderRadius: 2, boxShadow: 1, bgcolor: '#fff', p: { xs: 2, sm: 4 }, minHeight: 300 }}>
                    {renderTab()}
                </Paper>
            </Box>
        </Box>
    );
};

export default App;
