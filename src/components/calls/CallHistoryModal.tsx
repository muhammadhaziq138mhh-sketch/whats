import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../common/Avatar';
import {
  X,
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
} from 'lucide-react';
import { DEMO_USERS } from '../../data/demoData';

interface CallHistoryModalProps {
  onClose: () => void;
}

export const CallHistoryModal: React.FC<CallHistoryModalProps> = ({ onClose }) => {
  const { callHistory, startCallSession } = useChat();
  const [filter, setFilter] = useState<'all' | 'missed'>('all');

  const filtered = callHistory.filter((call) => {
    if (filter === 'missed') return call.status === 'missed';
    return true;
  });

  const formatDuration = (secs?: number) => {
    if (!secs) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const handleCallBack = (call: (typeof callHistory)[0]) => {
    const matchedUser = DEMO_USERS.find(
      (u) => u.displayName === call.receiverName || u.displayName === call.callerName
    ) || DEMO_USERS[0];

    startCallSession(matchedUser, call.type);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111B21] rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-[#202C33]">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#00A884]" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Call Logs & History
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3942] text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              filter === 'all'
                ? 'bg-[#00A884] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            All Calls ({callHistory.length})
          </button>
          <button
            onClick={() => setFilter('missed')}
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              filter === 'missed'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            Missed Calls
          </button>
        </div>

        {/* Logs list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((call) => {
              const isMissed = call.status === 'missed' || call.status === 'rejected';
              return (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#202C33] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={call.receiverPhoto || call.callerPhoto}
                      name={call.receiverName || call.callerName}
                      size="md"
                    />

                    <div>
                      <h4
                        className={`text-sm font-bold ${
                          isMissed ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {call.receiverName || call.callerName}
                      </h4>

                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {isMissed ? (
                          <PhoneMissed className="w-3.5 h-3.5 text-red-500" />
                        ) : (
                          <PhoneIncoming className="w-3.5 h-3.5 text-[#00A884]" />
                        )}
                        <span>
                          {new Date(call.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          • {formatDuration(call.duration)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCallBack(call)}
                    className="p-2.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-[#00A884] transition-colors"
                    title={`Call back (${call.type})`}
                  >
                    {call.type === 'video' ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <Phone className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-xs text-gray-400">
              No call history found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
