
import React, { useState } from 'react';
import { useFirebase } from './hooks/useFirebase.js';

// --- Tab Components ---
import HomeTab from './tabs/HomeTab.jsx';
import BrowseDoublesTab from './tabs/BrowseDoublesTab.jsx';
import CreateDoubleTab from './tabs/CreateDoubleTab.jsx';
import SuggestDoubleTab from './tabs/SuggestDoubleTab.jsx';

// --- STYLING CONSTANTS ---
const LOGO_ICON_STYLE = {
    fontSize: '1.25em',
    fontWeight: '900',
    display: 'inline-block',
    color: '#9333EA', // Purple accent
    lineHeight: '0.8',
    marginRight: '-0.1em', // Pulls 'o' closer to the mirrored 'D'
    transform: 'scaleX(-1)', // Mirrored D effect
};

const TAB_BASE_STYLE = "py-3 px-4 font-semibold transition-colors cursor-pointer border-b-4 border-transparent text-gray-700 hover:text-indigo-600 hover:border-indigo-300";
const TAB_ACTIVE_STYLE = "text-indigo-700 border-indigo-700 bg-white";

// --- Main Application Component (Router) ---
const App = () => {
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
        <div className="min-h-screen p-4 sm:p-8 flex items-start justify-center bg-gray-50">
            <div className="w-full max-w-6xl">
                {/* LOGO */}
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center">
                    <span style={LOGO_ICON_STYLE}>D</span>o<span className="text-indigo-600">ppel</span>&nbsp;Verse
                </h1>
                <p id="auth-status" className="text-xs text-gray-500 mb-6">
                    {userId ? `User ID: ${userId} | Database Ready` : 'Connecting to database...'}
                </p>

                {/* TAB NAVIGATION */}
                <div className="flex border-b border-gray-200 mb-6 bg-gray-100 rounded-t-xl">
                    {['home', 'explorer', 'single', 'double'].map(tabId => (
                        <button
                            key={tabId}
                            className={`${TAB_BASE_STYLE} ${activeTab === tabId ? TAB_ACTIVE_STYLE : ''}`}
                            onClick={() => setActiveTab(tabId)}
                        >
                            {tabId === 'home' ? 'Home & Leaderboard' :
                             tabId === 'explorer' ? 'Browse Community Doubles' :
                             tabId === 'single' ? 'Create Your Double' :
                             'Suggest a Double'}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {renderTab()}
            </div>
        </div>
    );
};

export default App;
