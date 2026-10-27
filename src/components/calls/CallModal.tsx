import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../common/Avatar';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  Maximize2,
  Radio,
} from 'lucide-react';

export const CallModal: React.FC = () => {
  const { activeCall, endCallSession } = useChat();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Setup local camera stream if video call
  useEffect(() => {
    if (!activeCall) return;

    let stream: MediaStream | null = null;
    if (activeCall.type === 'video') {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: true })
        .then((s) => {
          stream = s;
          if (localVideoRef.current) localVideoRef.current.srcObject = s;
        })
        .catch((err) => {
          console.warn('Could not acquire local camera, running in simulated mode:', err);
        });
    }

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [activeCall?.type]);

  // Duration timer when call is ongoing
  useEffect(() => {
    if (!activeCall || activeCall.status !== 'ongoing') {
      setCallDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCall?.status]);

  if (!activeCall) return null;

  const isVideo = activeCall.type === 'video';

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="relative w-full max-w-lg h-[80vh] max-h-[700px] rounded-3xl overflow-hidden flex flex-col bg-gray-900 border border-gray-800 shadow-2xl">
        {/* Top Header info */}
        <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between text-white drop-shadow-md">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium">
            <Radio className="w-3.5 h-3.5 text-[#25D366] animate-pulse" />
            <span>
              {activeCall.status === 'calling'
                ? 'Calling...'
                : activeCall.status === 'ongoing'
                ? formatDuration(callDuration)
                : 'Connecting...'}
            </span>
          </div>

          <span className="text-xs uppercase tracking-wider font-bold text-white/80 bg-black/40 px-3 py-1 rounded-full">
            {activeCall.type} Call
          </span>
        </div>

        {/* Center Calling Screen */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
          {isVideo && isVideoEnabled ? (
            /* Video stream container */
            <div className="w-full h-full relative rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-xl text-white text-xs font-semibold">
                You
              </div>
            </div>
          ) : (
            /* Voice / Audio wave interface */
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <Avatar
                  src={activeCall.receiverPhoto}
                  name={activeCall.receiverName}
                  size="2xl"
                  className="shadow-2xl ring-4 ring-[#00A884]/40"
                />
                {activeCall.status === 'calling' && (
                  <span className="absolute inset-0 rounded-full border-2 border-[#00A884] animate-ping pointer-events-none" />
                )}
              </div>

              <h3 className="text-xl font-bold text-white mb-1">
                {activeCall.receiverName}
              </h3>
              <p className="text-sm text-gray-400">
                {activeCall.status === 'calling'
                  ? 'Ringing...'
                  : activeCall.status === 'ongoing'
                  ? 'Connected • HD Audio'
                  : 'Connecting...'}
              </p>

              {/* Pulsing audio equalizer bars */}
              {activeCall.status === 'ongoing' && (
                <div className="flex items-center gap-1.5 mt-8 h-8">
                  {[40, 70, 100, 50, 85, 30, 90, 60].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-1.5 rounded-full bg-[#00A884] animate-pulse"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Call Controls Toolbar */}
        <div className="p-6 bg-black/60 backdrop-blur-md z-20 flex items-center justify-center gap-6">
          {/* Mute button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${
              isMuted ? 'bg-red-500' : 'bg-gray-800 hover:bg-gray-700'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={endCallSession}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Video Toggle */}
          {isVideo && (
            <button
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${
                !isVideoEnabled ? 'bg-red-500' : 'bg-gray-800 hover:bg-gray-700'
              }`}
              title={isVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
