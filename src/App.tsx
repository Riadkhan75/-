import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { testFirestoreConnection } from './firebase/config';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { HomeView } from './components/HomeView';
import { CampaignsView } from './components/CampaignsView';
import { BloodDonationView } from './components/BloodDonationView';
import { HelpRequestsView } from './components/HelpRequestsView';
import { EventsView } from './components/EventsView';
import { VolunteerSection } from './components/VolunteerSection';
import { UserDashboardView } from './components/UserDashboardView';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { ApplyHelpPageView } from './components/ApplyHelpPageView';
import { DonatePageView } from './components/DonatePageView';
import { FoodClothesBankView } from './components/FoodClothesBankView';
import { ImpactReportView } from './components/ImpactReportView';
import { StoriesView } from './components/StoriesView';
import { NoticePages } from './components/NoticePages';
import { AuthModal } from './components/AuthModal';
import { HelpRequestModal } from './components/HelpRequestModal';
import { DonationModal } from './components/DonationModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { MobileAppDownloadView } from './components/MobileAppDownloadView';
import { getUserNotifications } from './services/firestoreService';
import { Campaign } from './types';

function MainAppContent() {
  const { user, isAdmin } = useAuth();
  const { settings } = useSettings();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [selectedCampaignForDonation, setSelectedCampaignForDonation] = useState<Campaign | null>(null);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  // Connection test on initial mount
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Fetch unread notifications for logged in user
  useEffect(() => {
    if (!user) {
      setUnreadNotifsCount(0);
      return;
    }

    async function checkNotifs() {
      try {
        const notifs = await getUserNotifications(user!.uid);
        const unread = notifs.filter(n => !n.isRead).length;
        setUnreadNotifsCount(unread);
      } catch (err) {
        // silent fail on network glitch
      }
    }
    checkNotifs();
    const interval = setInterval(checkNotifs, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Listen to hash for direct routes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'admin' || hash === 'adminriad') {
        setCurrentTab('admin');
      } else if ([
        'home', 'campaigns', 'blood', 'help', 'apply-help', 'donate', 'events', 
        'volunteer', 'bank', 'impact', 'stories', 'dashboard', 'download', 'app',
        'privacy', 'terms', 'faq'
      ].includes(hash)) {
        setCurrentTab(hash);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Update hash when tab changes
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenDonate = (campaign?: Campaign) => {
    setSelectedCampaignForDonation(campaign || null);
    handleTabChange('donate');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-['Hind_Siliguri',sans-serif]">
      {/* Top emergency announcement ticker */}
      <AnnouncementBanner />

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onOpenAuth={() => handleOpenAuth('login')}
        onOpenHelpModal={() => handleTabChange('apply-help')}
        onOpenNotifications={() => setNotifModalOpen(true)}
        unreadNotifsCount={unreadNotifsCount}
      />

      {/* Main Screen Content */}
      <main className="grow">
        {currentTab === 'home' && (
          <HomeView
            onNavigate={handleTabChange}
            onOpenHelpModal={() => handleTabChange('apply-help')}
            onSelectDonate={handleOpenDonate}
          />
        )}

        {currentTab === 'campaigns' && (
          <CampaignsView onSelectDonate={handleOpenDonate} />
        )}

        {currentTab === 'blood' && (
          <BloodDonationView onRequireAuth={() => handleOpenAuth('login')} />
        )}

        {currentTab === 'help' && (
          <HelpRequestsView 
            onOpenHelpModal={() => handleTabChange('apply-help')} 
            onNavigate={handleTabChange}
          />
        )}

        {currentTab === 'apply-help' && (
          <ApplyHelpPageView
            onBack={() => handleTabChange('help')}
            onRequireAuth={() => handleOpenAuth('login')}
            onNavigateToDashboard={() => handleTabChange('dashboard')}
          />
        )}

        {currentTab === 'donate' && (
          <DonatePageView
            initialCampaign={selectedCampaignForDonation}
            onBack={() => handleTabChange('campaigns')}
            onNavigateToDashboard={() => handleTabChange('dashboard')}
            onRequireAuth={() => handleOpenAuth('login')}
          />
        )}

        {currentTab === 'bank' && (
          <FoodClothesBankView onRequireAuth={() => handleOpenAuth('login')} />
        )}

        {currentTab === 'impact' && (
          <ImpactReportView />
        )}

        {currentTab === 'stories' && (
          <StoriesView onRequireAuth={() => handleOpenAuth('login')} />
        )}

        {currentTab === 'events' && (
          <EventsView onRequireAuth={() => handleOpenAuth('login')} />
        )}

        {currentTab === 'volunteer' && (
          <VolunteerSection onRequireAuth={() => handleOpenAuth('login')} />
        )}

        {currentTab === 'dashboard' && (
          <UserDashboardView
            onOpenHelpModal={() => handleTabChange('apply-help')}
            onNavigate={handleTabChange}
          />
        )}

        {currentTab === 'admin' && (
          <SuperAdminDashboard />
        )}

        {(currentTab === 'download' || currentTab === 'app') && (
          <MobileAppDownloadView settings={settings} onNavigateHome={() => handleTabChange('home')} />
        )}

        {(currentTab === 'privacy' || currentTab === 'terms' || currentTab === 'faq') && (
          <NoticePages
            type={currentTab}
            onBack={() => handleTabChange('home')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleTabChange} settings={settings} />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onOpenAuth={() => handleOpenAuth('login')}
      />

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />

      <HelpRequestModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        onRequireAuth={() => {
          setHelpModalOpen(false);
          handleOpenAuth('login');
        }}
      />

      <DonationModal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        campaign={selectedCampaignForDonation}
      />

      <NotificationCenterModal
        isOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
        onNavigate={handleTabChange}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <MainAppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}
