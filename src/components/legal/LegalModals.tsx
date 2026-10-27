import React from 'react';
import { X, Shield, FileText, HelpCircle, CheckCircle } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'help';
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const content = {
    privacy: {
      title: 'Privacy Policy',
      icon: <Shield className="w-5 h-5 text-[#00A884]" />,
      body: (
        <div className="space-y-4 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            Welcome to <strong>Connectly</strong>. We believe your private conversations should remain completely private. This policy outlines how your data is handled across our web application.
          </p>
          <h5 className="font-bold text-gray-900 dark:text-gray-100 text-sm">1. Data Storage & Ownership</h5>
          <p>
            Connectly persists your messages, conversations, and user profiles inside secure Google Cloud Firestore partitions. Media files and documents are uploaded to Firebase Storage with strict security rules.
          </p>
          <h5 className="font-bold text-gray-900 dark:text-gray-100 text-sm">2. Security & Access Control</h5>
          <p>
            Access to conversation threads and subcollections is governed by Attribute-Based Access Control (ABAC) Firestore Security Rules. Only authenticated members of a conversation can read or post messages.
          </p>
          <h5 className="font-bold text-gray-900 dark:text-gray-100 text-sm">3. Presence & 24h Stories</h5>
          <p>
            Online status and typing indicators are transient. Status stories automatically expire after 24 hours. You can control your Last Seen, Online visibility, and Read Receipts anytime in Settings.
          </p>
        </div>
      ),
    },
    terms: {
      title: 'Terms of Service',
      icon: <FileText className="w-5 h-5 text-teal-600" />,
      body: (
        <div className="space-y-4 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            By using <strong>Connectly</strong>, you agree to comply with standard platform usage guidelines and community standards.
          </p>
          <h5 className="font-bold text-gray-900 dark:text-gray-100 text-sm">1. Acceptable Use</h5>
          <p>
            You may not use Connectly to transmit spam, malware, harassing material, or unauthorized automated messages.
          </p>
          <h5 className="font-bold text-gray-900 dark:text-gray-100 text-sm">2. Account Responsibility</h5>
          <p>
            You are responsible for keeping your login credentials confidential and for all actions taken under your account.
          </p>
          <h5 className="font-bold text-gray-900 dark:text-gray-100 text-sm">3. Account Deletion</h5>
          <p>
            You may terminate your account at any time via Settings &gt; Account Deletion.
          </p>
        </div>
      ),
    },
    help: {
      title: 'Help & Support',
      icon: <HelpCircle className="w-5 h-5 text-cyan-600" />,
      body: (
        <div className="space-y-4 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          <h5 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Frequently Asked Questions</h5>
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#202C33]">
              <p className="font-bold text-gray-900 dark:text-gray-100 mb-1">How do I test with multiple users?</p>
              <p>In Demo Mode, click your avatar or the mode badge to switch personas between Sarah, Alex, Elena, and Marcus. You can also sign in with multiple Google accounts in Live Mode!</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#202C33]">
              <p className="font-bold text-gray-900 dark:text-gray-100 mb-1">How do voice messages work?</p>
              <p>Click the microphone icon in the chat input to record your voice. Allow browser microphone access when prompted, then click Send.</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#202C33]">
              <p className="font-bold text-gray-900 dark:text-gray-100 mb-1">How do WebRTC calls work?</p>
              <p>Click the Phone or Video icon in any 1-on-1 chat to initiate a call. The peer connection handles voice and video streaming.</p>
            </div>
          </div>
        </div>
      ),
    },
  }[type];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111B21] rounded-3xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-[#202C33]">
          <div className="flex items-center gap-2.5">
            {content.icon}
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {content.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3942] text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">{content.body}</div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00A884] text-white hover:bg-[#008f70]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
