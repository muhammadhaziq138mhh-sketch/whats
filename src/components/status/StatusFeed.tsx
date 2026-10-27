import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusStory } from '../../types';
import { Avatar } from '../common/Avatar';
import { DEMO_STATUSES } from '../../data/demoData';
import { StatusViewerModal } from './StatusViewerModal';
import { CreateStatusModal } from './CreateStatusModal';
import { X, Plus, CircleDot, Sparkles } from 'lucide-react';

interface StatusFeedProps {
  onClose: () => void;
}

export const StatusFeed: React.FC<StatusFeedProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<StatusStory[]>(DEMO_STATUSES);
  const [activeViewerStories, setActiveViewerStories] = useState<StatusStory[] | null>(null);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Separate my status vs contacts statuses
  const myStatuses = statuses.filter((s) => s.userId === user?.id);
  const otherStatuses = statuses.filter((s) => s.userId !== user?.id);

  const handleOpenStories = (stories: StatusStory[], index: number = 0) => {
    setActiveViewerStories(stories);
    setViewerStartIndex(index);
  };

  const handleStatusCreated = (newStory: StatusStory) => {
    setStatuses((prev) => [newStory, ...prev]);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111B21] rounded-3xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-[#202C33]">
          <div className="flex items-center gap-2.5">
            <CircleDot className="w-6 h-6 text-[#00A884]" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Status Stories
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3942] text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Lists Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* My Status Card */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                My Status
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#202C33] border border-gray-100 dark:border-gray-800">
              <div
                onClick={() =>
                  myStatuses.length > 0
                    ? handleOpenStories(myStatuses, 0)
                    : setShowCreateModal(true)
                }
                className="flex items-center gap-3.5 cursor-pointer flex-1"
              >
                <div className="relative">
                  <Avatar
                    src={user?.photoURL}
                    name={user?.displayName}
                    size="lg"
                    hasStory={myStatuses.length > 0}
                  />
                  {myStatuses.length === 0 && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#00A884] text-white flex items-center justify-center text-xs font-bold border-2 border-white dark:border-[#111B21]">
                      +
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {myStatuses.length > 0 ? 'My Status' : 'Add to my status'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {myStatuses.length > 0
                      ? `${myStatuses.length} active updates`
                      : 'Share a story that disappears in 24 hours'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2.5 rounded-xl bg-[#00A884] hover:bg-[#008f70] text-white transition-colors"
                title="Create story"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Recent Updates from Contacts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Recent Updates ({otherStatuses.length})
              </span>
            </div>

            <div className="space-y-1.5">
              {otherStatuses.map((story, idx) => (
                <div
                  key={story.id}
                  onClick={() => handleOpenStories(otherStatuses, idx)}
                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-[#202C33] cursor-pointer transition-colors"
                >
                  <Avatar
                    src={story.userPhoto}
                    name={story.userName}
                    size="lg"
                    hasStory
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                      {story.userName}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {new Date(story.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {story.caption ? ` • ${story.caption}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Story Viewer Modal */}
      {activeViewerStories && (
        <StatusViewerModal
          stories={activeViewerStories}
          initialIndex={viewerStartIndex}
          onClose={() => setActiveViewerStories(null)}
        />
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <CreateStatusModal
          onClose={() => setShowCreateModal(false)}
          onStatusCreated={handleStatusCreated}
        />
      )}
    </div>
  );
};
