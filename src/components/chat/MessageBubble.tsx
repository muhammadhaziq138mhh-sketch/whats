import React, { useState, useRef } from 'react';
import { Message, MessageType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import {
  Check,
  CheckCheck,
  Clock,
  Play,
  Pause,
  FileText,
  Download,
  Smile,
  Reply,
  Star,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isGroup: boolean;
  onImageClick?: (url: string) => void;
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isGroup,
  onImageClick,
}) => {
  const { user } = useAuth();
  const {
    reactToMessage,
    toggleStar,
    setReplyingTo,
    editUserMessage,
    deleteUserMessage,
  } = useChat();

  const isMe = user?.id === message.senderId;
  const isStarred = user && message.starredBy?.includes(user.id);

  // State for voice note audio playback
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // State for hover action bar & menu
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);

  // Audio playback handler
  const handleTogglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration || message.duration || 1;
    setAudioProgress((current / total) * 100);
  };

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
    setAudioProgress(0);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    await editUserMessage(message.id, editText.trim());
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setShowMenu(false);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (secs?: number) => {
    if (!secs) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // If system message
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="px-3 py-1 text-[11px] font-medium bg-gray-200/80 dark:bg-[#182229] text-gray-600 dark:text-gray-300 rounded-lg shadow-xs select-none">
          {message.text}
        </span>
      </div>
    );
  }

  // Group reactions by count
  const reactionCounts: Record<string, { count: number; users: string[] }> = {};
  if (message.reactions) {
    Object.entries(message.reactions).forEach(([uId, emoji]) => {
      if (!reactionCounts[emoji]) reactionCounts[emoji] = { count: 0, users: [] };
      reactionCounts[emoji].count += 1;
      reactionCounts[emoji].users.push(uId);
    });
  }

  const renderStatusTicks = () => {
    if (!isMe) return null;
    if (message.status === 'sending') {
      return <Clock className="w-3 h-3 text-gray-400 inline ml-1" />;
    }
    if (message.status === 'read') {
      return <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB] inline ml-1" />;
    }
    if (message.status === 'delivered') {
      return <CheckCheck className="w-3.5 h-3.5 text-gray-400 inline ml-1" />;
    }
    return <Check className="w-3.5 h-3.5 text-gray-400 inline ml-1" />;
  };

  return (
    <div
      className={`group relative flex flex-col mb-1.5 ${
        isMe ? 'items-end' : 'items-start'
      }`}
    >
      {/* Floating Action toolbar on hover */}
      <div
        className={`absolute -top-7 ${
          isMe ? 'right-2' : 'left-2'
        } hidden group-hover:flex items-center gap-0.5 bg-white dark:bg-[#202C33] border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5 shadow-md z-10 transition-opacity`}
      >
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="p-1 hover:text-[#00A884] text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-[#2A3942]"
          title="React"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setReplyingTo(message)}
          className="p-1 hover:text-[#00A884] text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-[#2A3942]"
          title="Reply"
        >
          <Reply className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => toggleStar(message.id)}
          className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#2A3942] ${
            isStarred ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400'
          }`}
          title={isStarred ? 'Unstar' : 'Star'}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
        </button>
        <button
          onClick={() => setShowMenu((prev) => !prev)}
          className="p-1 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-[#2A3942]"
          title="More"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Popover Emoji list */}
      {showEmojiPicker && (
        <div
          className={`absolute -top-14 ${
            isMe ? 'right-0' : 'left-0'
          } flex items-center gap-1 bg-white dark:bg-[#202C33] p-1.5 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 z-20 animate-in fade-in`}
        >
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                reactToMessage(message.id, emoji);
                setShowEmojiPicker(false);
              }}
              className="text-lg hover:scale-125 transition-transform px-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* More actions dropdown menu */}
      {showMenu && (
        <div
          className={`absolute top-0 ${
            isMe ? 'right-12' : 'left-12'
          } bg-white dark:bg-[#233138] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-30 min-w-[130px] text-xs text-gray-700 dark:text-gray-200`}
        >
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#182229]"
          >
            <Copy className="w-3.5 h-3.5 text-gray-400" />
            Copy
          </button>
          {isMe && !message.isDeleted && (
            <button
              onClick={() => {
                setIsEditing(true);
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#182229]"
            >
              <Edit2 className="w-3.5 h-3.5 text-gray-400" />
              Edit
            </button>
          )}
          {isMe && !message.isDeleted && (
            <button
              onClick={() => {
                deleteUserMessage(message.id);
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-red-500 hover:bg-gray-100 dark:hover:bg-[#182229]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          )}
        </div>
      )}

      {/* Main Message Bubble */}
      <div
        className={`relative max-w-[85%] md:max-w-[70%] rounded-2xl px-3.5 py-2 shadow-xs transition-colors ${
          isMe
            ? 'bg-[#D9FDD3] dark:bg-[#005C4B] text-gray-900 dark:text-gray-100 rounded-tr-xs'
            : 'bg-white dark:bg-[#202C33] text-gray-900 dark:text-gray-100 rounded-tl-xs'
        }`}
      >
        {/* Sender Name for group chats if not me */}
        {!isMe && isGroup && (
          <p className="text-xs font-bold text-[#00A884] dark:text-[#25D366] mb-1 tracking-tight">
            {message.senderName}
          </p>
        )}

        {/* Reply Quote preview */}
        {message.replyTo && (
          <div className="mb-1.5 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-black/20 border-l-4 border-[#00A884] text-xs">
            <span className="font-semibold text-[#00A884] block truncate">
              {message.replyTo.senderName}
            </span>
            <span className="text-gray-600 dark:text-gray-300 truncate block">
              {message.replyTo.text}
            </span>
          </div>
        )}

        {/* Content based on type */}
        {message.isDeleted ? (
          <p className="italic text-gray-400 dark:text-gray-400 text-[13px] flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" />
            This message was deleted
          </p>
        ) : isEditing ? (
          <div className="flex flex-col gap-2 min-w-[200px]">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="px-2 py-1 text-sm rounded bg-white dark:bg-[#182229] border border-gray-300 dark:border-gray-600 focus:outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-1.5 text-xs">
              <button
                onClick={() => setIsEditing(false)}
                className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-2 py-0.5 rounded bg-[#00A884] text-white font-medium"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Image message */}
            {message.type === 'image' && message.attachmentUrl && (
              <div className="mb-1.5 rounded-xl overflow-hidden cursor-pointer hover:opacity-95">
                <img
                  src={message.attachmentUrl}
                  alt={message.attachmentName || 'Attachment'}
                  onClick={() => onImageClick && onImageClick(message.attachmentUrl!)}
                  className="max-h-72 w-full object-cover rounded-xl"
                  loading="lazy"
                />
              </div>
            )}

            {/* Video message */}
            {message.type === 'video' && message.attachmentUrl && (
              <div className="mb-1.5 rounded-xl overflow-hidden max-h-72">
                <video
                  src={message.attachmentUrl}
                  controls
                  className="w-full max-h-72 rounded-xl bg-black"
                />
              </div>
            )}

            {/* Voice note message */}
            {message.type === 'voice' && (
              <div className="flex items-center gap-3 py-1 min-w-[220px]">
                {message.attachmentUrl && (
                  <audio
                    ref={audioRef}
                    src={message.attachmentUrl}
                    onTimeUpdate={handleAudioTimeUpdate}
                    onEnded={handleAudioEnded}
                    className="hidden"
                  />
                )}
                <button
                  onClick={handleTogglePlayAudio}
                  className="w-9 h-9 rounded-full bg-[#00A884] text-white flex items-center justify-center flex-shrink-0 shadow-sm hover:scale-105 transition-transform"
                >
                  {isPlayingAudio ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div className="flex-1 flex flex-col justify-center gap-1">
                  {/* Waveform visual simulation */}
                  <div className="relative h-4 flex items-center gap-0.5">
                    {[40, 70, 95, 30, 80, 60, 45, 90, 100, 35, 75, 50, 85, 40, 65, 80].map((h, i) => (
                      <span
                        key={i}
                        style={{ height: `${h}%` }}
                        className={`w-1 rounded-full transition-colors ${
                          (i / 16) * 100 <= audioProgress
                            ? 'bg-[#00A884]'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[11px] text-gray-500 dark:text-gray-300 font-mono">
                    {formatDuration(message.duration || 14)}
                  </span>
                </div>
              </div>
            )}

            {/* Document message */}
            {message.type === 'document' && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/5 dark:bg-black/20 mb-1">
                <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-xs font-semibold truncate text-gray-900 dark:text-white">
                    {message.attachmentName || 'Document.pdf'}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {formatFileSize(message.attachmentSize)}
                  </p>
                </div>
                {message.attachmentUrl && message.attachmentUrl !== '#' && (
                  <a
                    href={message.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={message.attachmentName}
                    className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[#00A884]"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}

            {/* Text message */}
            {message.text && message.type !== 'voice' && (
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words font-sans">
                {message.text}
              </p>
            )}
          </>
        )}

        {/* Timestamp and footer info */}
        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-500 dark:text-gray-400 select-none">
          {message.isEdited && <span className="italic mr-0.5">(edited)</span>}
          {isStarred && <Star className="w-3 h-3 text-amber-500 fill-current mr-0.5" />}
          <span>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {renderStatusTicks()}
        </div>
      </div>

      {/* Reaction Badges below bubble */}
      {Object.keys(reactionCounts).length > 0 && (
        <div
          className={`flex items-center gap-1 -mt-2 z-10 ${
            isMe ? 'mr-2' : 'ml-2'
          }`}
        >
          {Object.entries(reactionCounts).map(([emoji, data]) => (
            <button
              key={emoji}
              onClick={() => reactToMessage(message.id, emoji)}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-white dark:bg-[#202C33] border border-gray-200 dark:border-gray-700 shadow-xs hover:scale-110 transition-transform"
            >
              <span>{emoji}</span>
              {data.count > 1 && (
                <span className="text-[10px] text-gray-600 dark:text-gray-300 font-bold">
                  {data.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
