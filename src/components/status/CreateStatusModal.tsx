import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createStatusStory } from '../../services/statusService';
import { uploadMediaFile } from '../../services/storageService';
import { X, Type, Image as ImageIcon, Sparkles } from 'lucide-react';
import { StatusStory } from '../../types';

interface CreateStatusModalProps {
  onClose: () => void;
  onStatusCreated: (story: StatusStory) => void;
}

const PALETTES = [
  '#0F534C',
  '#1E3A8A',
  '#7C2D12',
  '#581C87',
  '#065F46',
  '#831843',
  '#111827',
];

export const CreateStatusModal: React.FC<CreateStatusModalProps> = ({
  onClose,
  onStatusCreated,
}) => {
  const { user, isLiveMode } = useAuth();
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [caption, setCaption] = useState('');
  const [backgroundColor, setBackgroundColor] = useState(PALETTES[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMode('image');
    }
  };

  const handleSubmit = async () => {
    if (!user || (!caption.trim() && !selectedFile)) return;
    setIsSubmitting(true);

    try {
      let mediaUrl = '';
      if (selectedFile) {
        const uploaded = await uploadMediaFile(selectedFile, 'statuses');
        mediaUrl = uploaded.url;
      }

      if (isLiveMode) {
        await createStatusStory(
          user.id,
          user.displayName,
          user.photoURL,
          mode,
          caption.trim(),
          mediaUrl,
          backgroundColor
        );
      }

      // Trigger local callback for immediate UI responsiveness
      const now = new Date();
      const newStory: StatusStory = {
        id: `status_${Date.now()}`,
        userId: user.id,
        userName: user.displayName,
        userPhoto: user.photoURL,
        type: mode,
        caption: caption.trim(),
        mediaUrl: mediaUrl || previewUrl || '',
        backgroundColor,
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        viewers: [user.id],
      };

      onStatusCreated(newStory);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#202C33] rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00A884]" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Create 24h Story
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex p-3 gap-2 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setMode('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-colors ${
              mode === 'text'
                ? 'bg-[#00A884] text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Type className="w-4 h-4" />
            Text Story
          </button>
          <label
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              mode === 'image'
                ? 'bg-[#00A884] text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Photo Story
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        {/* Live Story Canvas Preview */}
        <div className="p-4 flex flex-col items-center">
          <div
            className="w-full h-72 rounded-2xl flex items-center justify-center p-6 text-center relative overflow-hidden shadow-inner transition-colors"
            style={{
              backgroundColor: mode === 'text' ? backgroundColor : '#000',
            }}
          >
            {mode === 'image' && previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Type your story here..."
                maxLength={250}
                className="w-full bg-transparent text-white text-lg md:text-xl font-bold text-center focus:outline-none placeholder-white/50 resize-none"
                rows={4}
              />
            )}
          </div>

          {/* Color palette picker for text stories */}
          {mode === 'text' && (
            <div className="flex items-center gap-2 mt-4">
              {PALETTES.map((color) => (
                <button
                  key={color}
                  onClick={() => setBackgroundColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    backgroundColor === color ? 'scale-125 ring-2 ring-white shadow-md' : ''
                  }`}
                />
              ))}
            </div>
          )}

          {/* Caption for image story */}
          {mode === 'image' && (
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="w-full mt-3 px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none"
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={(!caption.trim() && !selectedFile) || isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00A884] hover:bg-[#008f70] text-white disabled:opacity-50 transition-colors shadow-md"
          >
            {isSubmitting ? 'Sharing...' : 'Share to Story'}
          </button>
        </div>
      </div>
    </div>
  );
};
