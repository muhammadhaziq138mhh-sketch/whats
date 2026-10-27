import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { AuthModal } from '../auth/AuthModal';
import { LegalModal } from '../legal/LegalModals';
import {
  MessageSquare,
  Phone,
  Video,
  Shield,
  CircleDot,
  Mic,
  Moon,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Lock,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'help' | null>(null);

  const handleOpenAuth = (tab: 'signin' | 'signup') => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-[#0B141A] dark:via-[#111B21] dark:to-[#0C1317] text-gray-900 dark:text-gray-100 flex flex-col font-sans select-none">
      {/* Top Navigation */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-200/80 dark:border-gray-800/80 backdrop-blur-md sticky top-0 z-40 bg-white/80 dark:bg-[#111B21]/80">
        <Logo size="md" />

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenAuth('signin')}
            className="text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-[#00A884] dark:hover:text-[#25D366] px-3 py-1.5 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={onEnterApp}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f70] text-white shadow-md shadow-[#00A884]/20 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Launch App
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-[#005C4B]/20 text-[#0F534C] dark:text-[#25D366] text-xs font-semibold mb-6 border border-teal-200/50 dark:border-teal-800/50 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-Time Messaging • Firebase & WebRTC Backed</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.15] mb-6">
          Connect seamlessly with{' '}
          <span className="bg-gradient-to-r from-[#0F534C] via-[#00A884] to-[#25D366] bg-clip-text text-transparent">
            Connectly
          </span>
        </h1>

        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mb-8 leading-relaxed">
          Experience ultra-responsive 1-on-1 and group chats, voice notes, media and file sharing, 24-hour status stories, and WebRTC calls with enterprise-grade Firestore security rules.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-14">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#00A884] hover:bg-[#008f70] text-white text-sm font-bold shadow-lg shadow-[#00A884]/25 transition-all hover:scale-105 active:scale-95"
          >
            <span>Launch Web App</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenAuth('signup')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#202C33] text-sm font-bold text-gray-800 dark:text-gray-200 transition-colors"
          >
            Create Free Account
          </button>
        </div>

        {/* Hero Interactive App Mock Preview */}
        <div className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-gray-200/90 dark:border-gray-800 bg-[#EFEAE2] dark:bg-[#0B141A] p-4 md:p-6 text-left relative">
          <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shadow-sm">
                SJ
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Sarah Jenkins</p>
                <p className="text-xs text-[#00A884] font-medium">online • typing...</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#00A884]">
              <div className="p-2 rounded-full bg-white/70 dark:bg-[#202C33] shadow-xs">
                <Phone className="w-4 h-4" />
              </div>
              <div className="p-2 rounded-full bg-white/70 dark:bg-[#202C33] shadow-xs">
                <Video className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Sample Chat Bubbles */}
          <div className="space-y-3">
            <div className="flex justify-start">
              <div className="bg-white dark:bg-[#202C33] rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-xs max-w-sm text-xs text-gray-800 dark:text-gray-200">
                Hey Haziq! The WebRTC audio and video calling sync looks stunning 🚀
                <div className="text-[10px] text-gray-400 text-right mt-1">10:42 AM</div>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="bg-[#D9FDD3] dark:bg-[#005C4B] rounded-2xl rounded-tr-xs px-4 py-2.5 shadow-xs max-w-sm text-xs text-gray-900 dark:text-gray-100">
                Thanks Sarah! The 24h stories and group chats are running with verified Firestore security rules too.
                <div className="text-[10px] text-gray-500 dark:text-gray-300 text-right mt-1 flex items-center justify-end gap-1">
                  10:44 AM <span className="text-[#53BDEB] font-bold">✓✓</span>
                </div>
              </div>
            </div>

            <div className="flex justify-start">
              <div className="bg-white dark:bg-[#202C33] rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-xs max-w-sm text-xs text-gray-800 dark:text-gray-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00A884] text-white flex items-center justify-center">
                  ▶
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-[#00A884]" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">0:14 Voice Note</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#182229] border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-[#005C4B]/20 text-[#00A884] flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1.5">
              Real-Time Messaging
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Live updates with Firestore subscriptions. Includes reply references, emoji reactions, message editing, soft-deletion, and read receipts.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#182229] border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-[#005C4B]/20 text-[#00A884] flex items-center justify-center mb-4">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1.5">
              Voice Notes & Media Sharing
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Record voice messages in the browser with live waveforms, upload photos & documents to Firebase Storage, and preview in high resolution.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#182229] border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-[#005C4B]/20 text-[#00A884] flex items-center justify-center mb-4">
              <CircleDot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1.5">
              24-Hour Stories & Status
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Post text and photo stories that automatically expire after 24 hours. Includes progress bar animation, viewer tracking, and story replies.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#182229] border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-[#005C4B]/20 text-[#00A884] flex items-center justify-center mb-4">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1.5">
              WebRTC Voice & Video Calls
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Peer-to-peer calling with authentic camera streams, microphone muting, duration tracking, and comprehensive call logs.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#182229] border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-[#005C4B]/20 text-[#00A884] flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1.5">
              ABAC Security Architecture
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Strict Zero-Trust access control where only conversation members can read messages, prevent shadow updates, and isolate private data.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#182229] border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-[#005C4B]/20 text-[#00A884] flex items-center justify-center mb-4">
              <Moon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1.5">
              Light & Dark Modes
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Tailored color palettes: deep teal `#0F534C`, emerald `#00A884`, crisp light gray `#F0F2F5`, and WhatsApp dark mode `#111B21`.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 px-6 py-8 mt-12 bg-white dark:bg-[#111B21]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span>© 2026 Connectly. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <button
              onClick={() => setActiveLegalModal('privacy')}
              className="hover:text-[#00A884] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveLegalModal('terms')}
              className="hover:text-[#00A884] transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => setActiveLegalModal('help')}
              className="hover:text-[#00A884] transition-colors"
            >
              Help & FAQ
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          defaultTab={authTab}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {activeLegalModal && (
        <LegalModal
          type={activeLegalModal}
          onClose={() => setActiveLegalModal(null)}
        />
      )}
    </div>
  );
};
