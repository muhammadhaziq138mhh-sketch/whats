import React, { useState, useEffect } from 'react';
import { StatusStory } from '../../types';
import { Avatar } from '../common/Avatar';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { X, ChevronLeft, ChevronRight, Eye, Send } from 'lucide-react';

interface StatusViewerModalProps {
  stories: StatusStory[];
  initialIndex?: number;
  onClose: () => void;
}

export const StatusViewerModal: React.FC<StatusViewerModalProps> = ({
  stories,
  initialIndex = 0,
  onClose,
}) => {
  const { user } = useAuth();
  const { sendChatMessage, startDirectChatWithUser } = useChat();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (!currentStory || isPaused) return;

    setProgress(0);
    const durationMs = 5000;
    const intervalMs = 50;
    const step = (intervalMs / durationMs) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((c) => c + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, currentStory, stories.length, onClose]);

  if (!currentStory) return null;

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((c) => c + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((c) => c - 1);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    const textToSend = `Replied to status: "${currentStory.caption || 'Story'}"\n\n${replyText}`;
    setReplyText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2 md:p-6 select-none">
      <div className="relative w-full max-w-md h-[90vh] max-h-[820px] rounded-3xl overflow-hidden flex flex-col bg-gray-900 shadow-2xl border border-gray-800">
        {/* Progress Bars on top */}
        <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5">
          {stories.map((story, idx) => (
            <div key={story.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                style={{
                  width:
                    idx < currentIndex
                      ? '100%'
                      : idx === currentIndex
                      ? `${progress}%`
                      : '0%',
                }}
                className="h-full bg-white transition-all duration-75 ease-linear"
              />
            </div>
          ))}
        </div>

        {/* Story Header */}
        <div className="absolute top-6 inset-x-4 z-30 flex items-center justify-between text-white drop-shadow-md">
          <div className="flex items-center gap-2.5">
            <Avatar src={currentStory.userPhoto} name={currentStory.userName} size="sm" />
            <div>
              <p className="text-xs font-bold leading-tight">{currentStory.userName}</p>
              <p className="text-[10px] text-white/80">
                {new Date(currentStory.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Story Content Container */}
        <div
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex-1 relative flex items-center justify-center overflow-hidden"
          style={{
            backgroundColor: currentStory.backgroundColor || '#0F534C',
          }}
        >
          {currentStory.type === 'image' && currentStory.mediaUrl ? (
            <div className="w-full h-full relative">
              <img
                src={currentStory.mediaUrl}
                alt="Story"
                className="w-full h-full object-cover"
              />
              {currentStory.caption && (
                <div className="absolute bottom-16 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-center">
                  <p className="text-sm font-medium text-white drop-shadow-md">
                    {currentStory.caption}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center max-w-sm">
              <p className="text-xl md:text-2xl font-bold text-white leading-relaxed drop-shadow-lg">
                {currentStory.caption}
              </p>
            </div>
          )}

          {/* Navigation Click Zones */}
          <div
            onClick={handlePrev}
            className="absolute left-0 top-16 bottom-16 w-1/3 cursor-pointer z-20"
          />
          <div
            onClick={handleNext}
            className="absolute right-0 top-16 bottom-16 w-1/3 cursor-pointer z-20"
          />
        </div>

        {/* Footer / Reply Bar */}
        <div className="p-3 bg-black/70 backdrop-blur-md z-30 flex items-center gap-2">
          {currentStory.userId === user?.id ? (
            <div className="flex items-center gap-1.5 text-xs text-white/90 mx-auto py-1">
              <Eye className="w-4 h-4 text-[#25D366]" />
              <span>{currentStory.viewers?.length || 1} views</span>
            </div>
          ) : (
            <div className="flex-1 flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 border border-white/20">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                placeholder={`Reply to ${currentStory.userName}...`}
                className="w-full bg-transparent text-xs text-white placeholder-white/60 focus:outline-none"
              />
              {replyText.trim() && (
                <button
                  onClick={handleSendReply}
                  className="text-[#25D366] hover:scale-110 transition-transform"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
