import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider, useChat } from './context/ChatContext';
import { ChatSidebar } from './components/chat/ChatSidebar';
import { ChatArea } from './components/chat/ChatArea';
import { ConversationDetails } from './components/chat/ConversationDetails';
import { NewChatModal } from './components/chat/NewChatModal';
import { NewGroupModal } from './components/chat/NewGroupModal';
import { StatusFeed } from './components/status/StatusFeed';
import { CallModal } from './components/calls/CallModal';
import { CallHistoryModal } from './components/calls/CallHistoryModal';
import { StarredMessagesModal } from './components/chat/StarredMessagesModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './components/landing/LandingPage';

const MainAppContent: React.FC = () => {
  const { user, isLiveMode, firebaseUser } = useAuth();
  const { activeConversation, selectConversation, isDetailsOpen, setIsDetailsOpen } = useChat();

  // Navigation & Modals State
  const [showLanding, setShowLanding] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showStatusFeed, setShowStatusFeed] = useState(false);
  const [showCallsModal, setShowCallsModal] = useState(false);
  const [showStarredModal, setShowStarredModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // If visitor is on landing view and explicitly requested it or has no active session
  if (showLanding) {
    return <LandingPage onEnterApp={() => setShowLanding(false)} />;
  }

  // If in Live mode and not authenticated with Firebase
  if (isLiveMode && !firebaseUser && !user) {
    return (
      <>
        <LandingPage onEnterApp={() => setShowAuthModal(true)} />
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
      </>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100 dark:bg-[#0C1317] font-sans antialiased text-gray-900 dark:text-gray-100">
      {/* Sidebar: Visible on desktop, or mobile when no conversation is active */}
      <div
        className={`h-full ${
          activeConversation ? 'hidden md:flex' : 'flex'
        } flex-shrink-0 w-full md:w-[380px] lg:w-[420px]`}
      >
        <ChatSidebar
          onOpenNewChat={() => setShowNewChatModal(true)}
          onOpenNewGroup={() => setShowNewGroupModal(true)}
          onOpenStatusFeed={() => setShowStatusFeed(true)}
          onOpenCalls={() => setShowCallsModal(true)}
          onOpenStarred={() => setShowStarredModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenAdmin={() => setShowAdminModal(true)}
          onOpenProfile={() => setShowSettingsModal(true)}
        />
      </div>

      {/* Main Chat Area: Visible on desktop, or mobile when conversation is active */}
      <div
        className={`flex-1 h-full ${
          !activeConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        <ChatArea
          onBack={() => selectConversation(null)}
          onOpenNewChat={() => setShowNewChatModal(true)}
        />
      </div>

      {/* Right Details Drawer */}
      {isDetailsOpen && activeConversation && (
        <ConversationDetails onClose={() => setIsDetailsOpen(false)} />
      )}

      {/* Calling Overlay */}
      <CallModal />

      {/* Interactive Modals */}
      {showNewChatModal && (
        <NewChatModal onClose={() => setShowNewChatModal(false)} />
      )}

      {showNewGroupModal && (
        <NewGroupModal onClose={() => setShowNewGroupModal(false)} />
      )}

      {showStatusFeed && (
        <StatusFeed onClose={() => setShowStatusFeed(false)} />
      )}

      {showCallsModal && (
        <CallHistoryModal onClose={() => setShowCallsModal(false)} />
      )}

      {showStarredModal && (
        <StarredMessagesModal onClose={() => setShowStarredModal(false)} />
      )}

      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}

      {showAdminModal && (
        <AdminDashboard onClose={() => setShowAdminModal(false)} />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <MainAppContent />
      </ChatProvider>
    </AuthProvider>
  );
}
