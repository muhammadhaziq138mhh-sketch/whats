import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { uploadMediaFile } from '../../services/storageService';
import {
  Smile,
  Paperclip,
  Mic,
  Send,
  X,
  Image as ImageIcon,
  FileText,
  Camera,
  Square,
  Trash2,
} from 'lucide-react';

const EMOJI_LIST = [
  '😀', '😂', '😍', '🔥', '👍', '❤️', '🎉', '🙌',
  '😎', '🤔', '😊', '🥳', '✨', '☕', '💡', '🚀',
  '💪', '🙏', '💯', '👋', '👀', '🌟', '😴', '😭',
];

export const MessageInput: React.FC = () => {
  const {
    sendChatMessage,
    sendTypingIndicator,
    replyingTo,
    setReplyingTo,
  } = useChat();

  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const typingTimerRef = useRef<number | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  // Handle typing indicator
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    sendTypingIndicator(true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      sendTypingIndicator(false);
    }, 2000);
  };

  // Send message
  const handleSend = async () => {
    if (!text.trim() && !isRecording) return;
    const messageText = text.trim();
    setText('');
    sendTypingIndicator(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendChatMessage({
      type: 'text',
      text: messageText,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice recording logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied or unavailable, using simulated voice note:', err);
      // Fallback voice recording simulation
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopAndSendRecording = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const duration = Math.max(recordingSeconds, 2);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/ogg; codecs=opus' });
        setIsUploading(true);
        try {
          const uploaded = await uploadMediaFile(audioBlob, 'chat_attachments');
          await sendChatMessage({
            type: 'voice',
            text: 'Voice note',
            attachmentUrl: uploaded.url,
            attachmentName: uploaded.name,
            attachmentSize: uploaded.size,
            attachmentType: uploaded.type,
            duration,
          });
        } finally {
          setIsUploading(false);
          setIsRecording(false);
          setRecordingSeconds(0);
        }
      };
      mediaRecorderRef.current.stop();
    } else {
      // Simulation send
      setIsRecording(false);
      await sendChatMessage({
        type: 'voice',
        text: 'Voice note',
        attachmentUrl: 'https://actions.google.com/sounds/v1/water/rain_heavy.ogg',
        attachmentName: `voice_note_${Date.now()}.ogg`,
        attachmentSize: 96000,
        attachmentType: 'audio/ogg',
        duration,
      });
      setRecordingSeconds(0);
    }
  };

  const cancelRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // File upload handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowAttachMenu(false);
    setIsUploading(true);

    try {
      const uploaded = await uploadMediaFile(file, 'chat_attachments');
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      await sendChatMessage({
        type: isImage ? 'image' : isVideo ? 'video' : 'document',
        text: isImage ? '' : file.name,
        attachmentUrl: uploaded.url,
        attachmentName: uploaded.name,
        attachmentSize: uploaded.size,
        attachmentType: uploaded.type,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative border-t border-gray-200 dark:border-gray-800 bg-gray-50/90 dark:bg-[#202C33] px-3 py-2 flex flex-col">
      {/* Replying banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-white dark:bg-[#182229] rounded-xl border-l-4 border-[#00A884] shadow-xs">
          <div className="text-xs truncate pr-2">
            <span className="font-bold text-[#00A884] block truncate">
              Replying to {replyingTo.senderName}
            </span>
            <span className="text-gray-500 dark:text-gray-400 truncate block">
              {replyingTo.text || 'Attachment'}
            </span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Popovers */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 bg-white dark:bg-[#202C33] p-3 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-30 grid grid-cols-8 gap-2">
          {EMOJI_LIST.map((em) => (
            <button
              key={em}
              onClick={() => {
                setText((prev) => prev + em);
                setShowEmojiPicker(false);
                textareaRef.current?.focus();
              }}
              className="text-xl hover:scale-125 transition-transform p-1"
            >
              {em}
            </button>
          ))}
        </div>
      )}

      {showAttachMenu && (
        <div className="absolute bottom-16 left-12 bg-white dark:bg-[#233138] p-2 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-30 flex flex-col gap-1 min-w-[160px] text-xs font-medium text-gray-700 dark:text-gray-200">
          <label className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#182229] cursor-pointer">
            <ImageIcon className="w-4 h-4 text-emerald-500" />
            Photos & Videos
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          <label className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#182229] cursor-pointer">
            <FileText className="w-4 h-4 text-teal-500" />
            Document
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          <label className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#182229] cursor-pointer">
            <Camera className="w-4 h-4 text-cyan-500" />
            Camera
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Main input controls */}
      <div className="flex items-end gap-2">
        {isRecording ? (
          /* Live Voice Recording Bar */
          <div className="flex-1 flex items-center justify-between bg-white dark:bg-[#182229] rounded-2xl px-4 py-2 border border-red-300 dark:border-red-900/50 shadow-inner">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-red-500">
                {Math.floor(recordingSeconds / 60)}:
                {recordingSeconds % 60 < 10 ? '0' : ''}
                {recordingSeconds % 60}
              </span>
              <span className="text-xs text-gray-400">Recording voice note...</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={cancelRecording}
                className="p-1.5 rounded-full text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Cancel"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={stopAndSendRecording}
                disabled={isUploading}
                className="px-3 py-1 bg-[#00A884] text-white rounded-xl text-xs font-bold hover:bg-[#008f70] transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {isUploading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        ) : (
          /* Regular Text & Media input */
          <>
            <div className="flex items-center gap-1 pb-1">
              <button
                onClick={() => {
                  setShowEmojiPicker((p) => !p);
                  setShowAttachMenu(false);
                }}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-[#00A884] rounded-full hover:bg-gray-200/60 dark:hover:bg-[#2A3942]"
                title="Emojis"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setShowAttachMenu((p) => !p);
                  setShowEmojiPicker(false);
                }}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-[#00A884] rounded-full hover:bg-gray-200/60 dark:hover:bg-[#2A3942]"
                title="Attach"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-white dark:bg-[#2A3942] rounded-2xl px-3.5 py-2 shadow-xs border border-gray-200 dark:border-transparent">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="w-full bg-transparent resize-none text-[14px] text-gray-900 dark:text-gray-100 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 max-h-32"
              />
            </div>

            <div className="pb-1">
              {text.trim() ? (
                <button
                  onClick={handleSend}
                  className="w-10 h-10 rounded-full bg-[#00A884] hover:bg-[#008f70] text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
                  title="Send message"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="w-10 h-10 rounded-full bg-[#00A884] hover:bg-[#008f70] text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
                  title="Record voice note"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {isUploading && (
        <div className="text-[11px] text-[#00A884] font-medium pt-1 animate-pulse">
          Uploading media attachment...
        </div>
      )}
    </div>
  );
};
