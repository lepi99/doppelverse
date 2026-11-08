

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useFirebase } from './hooks/useFirebase.js';
import HomeTab from './tabs/HomeTab.jsx';
import BrowseDoublesTab from './tabs/BrowseDoublesTab.jsx';
import CreateDoubleTab from './tabs/CreateDoubleTab.jsx';
import SuggestDoubleTab from './tabs/SuggestDoubleTab.jsx';
import CharacterUploader from './components/CharacterUploader.jsx';
import VisualizeTab from './tabs/VisualizeTab.jsx';
import Auth from './components/Auth.jsx';
import { Tabs, Tab, Box, Paper, useMediaQuery, useTheme, CircularProgress, Typography, Menu, MenuItem, useEventCallback, ListItemIcon, ListItemText } from '@mui/material';

// --- Admin Configuration ---
const ADMIN_UID = 'Wz8DmY5ixvQ4e4jaBWPkk2B0cty2'; // 👈 Replace with your actual Firebase User ID

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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    const { db, user, authReady } = useFirebase();

    // --- Responsive Tabs with Dropdown ---
    const [anchorEl, setAnchorEl] = useState(null);
    const [visibleTabs, setVisibleTabs] = useState(4);
    const tabsRef = React.useRef(null);
    
    const TABS_CONFIG_BASE = [
        { value: 'home', label: 'Home & Leaderboard', mobileLabel: 'Home', icon: '🏆' },
        { value: 'explorer', label: 'Browse Doppels', mobileLabel: 'Browse', icon: '🔍' },
        { value: 'single', label: 'Create Your Doppel', mobileLabel: 'Create', icon: '✨' },
        { value: 'double', label: 'Suggest a Doppel', mobileLabel: 'Suggest', icon: '💡' },
        { value: 'upload', label: 'Upload', mobileLabel: 'Upload', icon: '📤', adminOnly: true },
        { value: 'visualize', label: 'Visualize DB', mobileLabel: 'Visualize', icon: '📊', adminOnly: true },
    ];

    const TABS_CONFIG = React.useMemo(() => 
        TABS_CONFIG_BASE.filter(tab => !tab.adminOnly || (user && user.uid === ADMIN_UID))
    , [user]);

    const updateVisibleTabs = useEventCallback(() => {
        if (isMobile || !tabsRef.current) {
            setVisibleTabs(TABS_CONFIG.length);
            return;
        }

        const tabsContainer = tabsRef.current;
        const containerWidth = tabsContainer.clientWidth;
        const tabElements = Array.from(tabsContainer.querySelectorAll('.MuiTab-root'));
        const moreButtonWidth = tabElements[tabElements.length - 1]?.clientWidth || 100;

        let totalWidth = moreButtonWidth;
        let newVisibleTabs = 0;

        for (let i = 0; i < TABS_CONFIG.length; i++) {
            const tabWidth = tabElements[i]?.clientWidth || 200; // Fallback width
            if (totalWidth + tabWidth > containerWidth) {
                break;
            }
            totalWidth += tabWidth;
            newVisibleTabs++;
        }
        setVisibleTabs(Math.max(1, newVisibleTabs));
    });

    useEffect(() => {
        window.addEventListener('resize', updateVisibleTabs);
        return () => window.removeEventListener('resize', updateVisibleTabs);
    }, [updateVisibleTabs]);

    // Run the calculation after the initial render and when mobile state changes
    useLayoutEffect(() => {
        updateVisibleTabs();
    }, [isMobile, updateVisibleTabs]);

    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleMenuItemClick = (value) => {
        setActiveTab(value);
        handleMenuClose();
    };

    const showMoreButton = !isMobile && visibleTabs < TABS_CONFIG.length;
    const isTabInMenu = (value) => showMoreButton && TABS_CONFIG.findIndex(t => t.value === value) >= visibleTabs;

    const renderTab = () => {
        if (!authReady) {
            return (
                <Box textAlign="center" py={8}>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography color="text.secondary" fontWeight="medium">Initializing database and user authentication...</Typography>
                </Box>
            );
        }

        const tabProps = { db, userId: user ? user.uid : null, authReady };

        switch (activeTab) {
            case 'home':
                return <HomeTab {...tabProps} />;
            case 'explorer':
                return <BrowseDoublesTab {...tabProps} />;
            case 'single':
                return <CreateDoubleTab {...tabProps} />;
            case 'double':
                return <SuggestDoubleTab {...tabProps} />;
            case 'upload':
                return <CharacterUploader {...tabProps} />;
            case 'visualize':
                return <VisualizeTab {...tabProps} />;
            default:
                return <HomeTab {...tabProps} />;
        }
    };

    return (
        <Box minHeight="100vh" p={{ xs: 2, sm: 4 }} display="flex" justifyContent="center" alignItems="flex-start" bgcolor="linear-gradient(135deg, #f3f4f6 0%, #e0e7ff 100%)">
            <Box width="100%" maxWidth={1200} boxShadow={6} borderRadius={4} bgcolor="#fff" p={{ xs: 2, sm: 4 }}>
                {/* LOGO */}
                <Box display="flex" alignItems="center" mb={2}>
                    <Typography component="h1" variant="h3" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', fontSize: { xs: '2rem', sm: '2.5rem' } }}>
                        <span style={{ ...LOGO_ICON_BASE, transform: `scaleX(-1) rotate(${dAngle}deg)` }}>D</span>&nbsp;o<span style={{ color: '#6366f1' }}>ppel</span>&nbsp;Verse
                    </Typography>
                    <Box flexGrow={1} />
                    {authReady && <Auth user={user} />}
                </Box>
                <Box id="auth-status" color="text.secondary" fontSize={12} mb={4}>
                    {user ? `User ID: ${user.uid} | Database Ready` : 'Connecting to database...'}
                </Box>

                {/* MUI Tabs Navigation */}
                <Box>
                    <Tabs
                        ref={tabsRef}
                        value={isTabInMenu(activeTab) ? 'more' : activeTab}
                        onChange={(_, v) => { if (v !== 'more') setActiveTab(v); }}
                        variant={isMobile ? "fullWidth" : "scrollable"}
                        scrollButtons="auto"
                        textColor="primary"
                        indicatorColor="primary"
                        aria-label="Doppelverse Tabs"
                        sx={{ mb: 4 }}
                    >
                        {TABS_CONFIG.slice(0, visibleTabs).map(tab => (
                            <Tab
                                key={tab.value}
                                icon={<span role="img" aria-label={tab.label}>{tab.icon}</span>}
                                iconPosition={isMobile ? 'top' : 'start'}
                                label={isMobile ? tab.mobileLabel : tab.label}
                                sx={{ minWidth: 0 }} // Allow tabs to shrink on mobile
                                value={tab.value}
                            />
                        ))}
                        {showMoreButton && (
                            <Tab
                                icon={<span role="img" aria-label="More">🔽</span>}
                                iconPosition="start"
                                label="More"
                                value="more"
                                onClick={handleMenuClick}
                            />
                        )}
                    </Tabs>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        {TABS_CONFIG.slice(visibleTabs).map(tab => (
                            <MenuItem
                                key={tab.value}
                                selected={tab.value === activeTab}
                                onClick={() => handleMenuItemClick(tab.value)}
                                sx={{
                                    color: tab.value === activeTab ? 'primary.main' : 'text.secondary',
                                    fontWeight: tab.value === activeTab ? 'bold' : 'medium',
                                }}
                            >
                                <ListItemIcon sx={{
                                    minWidth: 36,
                                    color: 'inherit' // Inherit color from MenuItem
                                }}>
                                    <span role="img" aria-label={tab.label}>{tab.icon}</span>
                                </ListItemIcon>
                                <ListItemText>
                                    {tab.label}
                                </ListItemText>
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>

                {/* Tab Content: wrap all tab pages in consistent Paper/Card styling */}
                <Paper elevation={1} sx={{ borderRadius: 2, boxShadow: 1, bgcolor: '#fff', p: { xs: 2, sm: 4 }, minHeight: 300 }}>
                    {renderTab()}
                </Paper>
            </Box>
        </Box>
    );
};

export default App;
