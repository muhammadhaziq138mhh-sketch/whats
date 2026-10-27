import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { submitUserReport } from '../../services/userService';
import {
  X,
  Phone,
  Video,
  Pin,
  VolumeX,
  Archive,
  Ban,
  Flag,
  FileText,
  Image as ImageIcon,
  Users,
  Shield,
  Trash2,
  Check,
} from 'lucide-react';

interface ConversationDetailsProps {
  onClose: () => void;
}

export const ConversationDetails: React.FC<ConversationDetailsProps> = ({ onClose }) => {
  const { user } = useAuth();
  const {
    activeConversation,
    messages,
    startCallSession,
    archiveConversation,
    pinConversation,
    muteConversation,
  } = useChat();

  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'docs'>('info');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Spam or scam');
  const [reportSuccess, setReportSuccess] = useState(false);

  if (!activeConversation) return null;

  const isGroup = activeConversation.type === 'group';
  const other = activeConversation.otherMember;
  const isPinned = user && activeConversation.pinnedBy?.includes(user.id);
  const isMuted = user && activeConversation.mutedBy?.includes(user.id);
  const isArchived = user && activeConversation.isArchivedBy?.includes(user.id);

  const mediaMessages = messages.filter((m) => m.type === 'image' || m.type === 'video');
  const docMessages = messages.filter((m) => m.type === 'document');

  const handleReport = async () => {
    if (!user || !other) return;
    await submitUserReport(user.id, user.displayName, other.id, other.displayName, reportReason);
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setShowReportModal(false);
    }, 1500);
  };

  return (
    <div className="w-full md:w-80 lg:w-96 h-full bg-white dark:bg-[#111B21] border-l border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0 select-none overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-gray-50/80 dark:bg-[#202C33] border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {isGroup ? 'Group Info' : 'Contact Info'}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3942] text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Profile Info Card */}
      <div className="flex flex-col items-center p-6 text-center border-b border-gray-200 dark:border-gray-800">
        <Avatar
          src={isGroup ? activeConversation.photoURL : other?.photoURL}
          name={isGroup ? activeConversation.name : other?.displayName}
          size="2xl"
          isOnline={isGroup ? false : other?.isOnline}
          className="mb-3"
        />

        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {isGroup ? activeConversation.name : other?.displayName}
        </h2>

        {!isGroup && other?.username && (
          <p className="text-xs text-[#00A884] dark:text-[#25D366] font-medium mb-1">
            @{other.username}
          </p>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mt-1">
          {isGroup ? activeConversation.description || 'No description' : other?.about || 'Hey there! I am using Connectly.'}
        </p>

        {/* Quick Call actions if direct */}
        {!isGroup && other && (
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => startCallSession(other, 'voice')}
              className="flex flex-col items-center gap-1 text-xs font-semibold text-[#00A884] hover:opacity-80"
            >
              <div className="w-10 h-10 rounded-full bg-[#E8F8F5] dark:bg-[#005C4B]/20 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              Voice
            </button>
            <button
              onClick={() => startCallSession(other, 'video')}
              className="flex flex-col items-center gap-1 text-xs font-semibold text-[#00A884] hover:opacity-80"
            >
              <div className="w-10 h-10 rounded-full bg-[#E8F8F5] dark:bg-[#005C4B]/20 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              Video
            </button>
          </div>
        )}
      </div>

      {/* Details Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
            activeTab === 'info'
              ? 'border-[#00A884] text-[#00A884]'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
            activeTab === 'media'
              ? 'border-[#00A884] text-[#00A884]'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Media ({mediaMessages.length})
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
            activeTab === 'docs'
              ? 'border-[#00A884] text-[#00A884]'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Docs ({docMessages.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 flex-1">
        {activeTab === 'info' && (
          <div className="space-y-4">
            {/* Group Members List */}
            {isGroup && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {activeConversation.memberIds.length} Participants
                  </span>
                </div>

                <div className="space-y-2">
                  {activeConversation.memberIds.map((mId) => (
                    <div key={mId} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={mId === user?.id ? 'You' : mId} size="sm" />
                        <div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                            {mId === user?.id ? 'You' : mId.replace('user_', '').replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      {activeConversation.adminIds?.includes(mId) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-900/30 text-[#00A884] border border-teal-200 dark:border-teal-800">
                          Admin
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions List */}
            <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => muteConversation(activeConversation.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#202C33]"
              >
                <div className="flex items-center gap-3">
                  <VolumeX className="w-4 h-4 text-gray-400" />
                  Mute Notifications
                </div>
                <span className="text-[11px] text-gray-400 font-semibold">
                  {isMuted ? 'Muted' : 'Off'}
                </span>
              </button>

              <button
                onClick={() => pinConversation(activeConversation.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#202C33]"
              >
                <div className="flex items-center gap-3">
                  <Pin className="w-4 h-4 text-gray-400" />
                  Pin Chat
                </div>
                <span className="text-[11px] text-gray-400 font-semibold">
                  {isPinned ? 'Pinned' : 'Off'}
                </span>
              </button>

              <button
                onClick={() => archiveConversation(activeConversation.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#202C33]"
              >
                <div className="flex items-center gap-3">
                  <Archive className="w-4 h-4 text-gray-400" />
                  Archive Chat
                </div>
                <span className="text-[11px] text-gray-400 font-semibold">
                  {isArchived ? 'Archived' : 'Off'}
                </span>
              </button>
            </div>

            {/* Danger / Reporting Actions */}
            {!isGroup && other && (
              <div className="space-y-1 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                >
                  <Flag className="w-4 h-4" />
                  Report User
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div>
            {mediaMessages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {mediaMessages.map((m) => (
                  <div key={m.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={m.attachmentUrl}
                      alt={m.attachmentName || 'Media'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-gray-400">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No shared photos or videos
              </div>
            )}
          </div>
        )}

        {activeTab === 'docs' && (
          <div>
            {docMessages.length > 0 ? (
              <div className="space-y-2">
                {docMessages.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-[#202C33] border border-gray-200 dark:border-gray-700 text-xs"
                  >
                    <FileText className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <span className="truncate flex-1 font-medium">{m.attachmentName || 'Document.pdf'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No shared documents
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#202C33] rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
              Report User
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Help us keep Connectly safe. Reports are securely audited by administrators.
            </p>

            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 mb-4"
            >
              <option value="Spam or scam">Spam or scam</option>
              <option value="Harassment or bullying">Harassment or bullying</option>
              <option value="Inappropriate content">Inappropriate content</option>
              <option value="Impersonation">Impersonation</option>
            </select>

            {reportSuccess ? (
              <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 font-bold py-2">
                <Check className="w-4 h-4" />
                Report submitted successfully
              </div>
            ) : (
              <div className="flex justify-end gap-2 text-xs font-semibold">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white"
                >
                  Submit Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
