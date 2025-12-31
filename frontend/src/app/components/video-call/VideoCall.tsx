import React, { useEffect, useRef, useState } from 'react';
import {
  AudioMutedOutlined,
  AudioOutlined,
  VideoCameraOutlined,
  VideoCameraFilled,
  PhoneFilled,
} from '@ant-design/icons';
import useMeeting from '../../../hooks/useMeeting';
import type { VideoCallProps } from '../../../helper/type';
import { useNavigate } from 'react-router-dom';
export default function VideoCall({
  videoEnabled,
  audioEnabled,
  selectedCamera,
  selectedMic,
  setIsJoining,
}: VideoCallProps) {
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(videoEnabled);
  const [isMicOn, setIsMicOn] = useState(audioEnabled);
  const navigate = useNavigate();
  const {
    localParticipant,
    remoteParticipants,
    joinRoom,
    roomName,
    disconnectCall,
  } = useMeeting();

  useEffect(() => {
    if (!localParticipant || !localVideoRef.current) return;
    localVideoRef.current.innerHTML = '';

    if (localParticipant && localVideoRef.current) {
      localParticipant.videoTracks.forEach((pub) => {
        if (pub.track && pub.track.isEnabled) {
          const el = pub.track.attach();
          el.className = 'w-full h-full object-cover mirror-mode';
          localVideoRef.current!.appendChild(el);
        }
      });
    }
  }, [localParticipant, isCameraOn]);

  useEffect(() => {
    if (!remoteParticipants || remoteParticipants.length === 0) return;
    remoteVideoRef.current!.innerHTML = '';
    if (remoteVideoRef.current) {
      remoteParticipants.forEach((participant) => {
        const tile = document.createElement('div');
        tile.className =
          'relative aspect-video bg-black rounded-xl overflow-hidden border border-gray-700 flex items-center justify-center';
        const placeholder = document.createElement('div');
        placeholder.className =
          'flex flex-col items-center justify-center text-gray-300';
        placeholder.innerHTML = `
      <div style="font-size:14px;margin-top:6px">Camera Off</div>
    `;
        let hasVideo = false;
        participant.tracks.forEach((pub) => {
          if (
            (pub.isSubscribed && pub.track?.kind === 'video') ||
            pub.track?.kind === 'audio'
          ) {
            if (pub.track.kind === 'video' || pub.track.kind === 'audio') {
              const el = pub.track.attach();
              el.className = 'w-full h-full object-cover';
              tile.appendChild(el);
              hasVideo = true;
            }
            pub.track.on('disabled', () => {
              if (pub.track?.kind === 'video') {
                tile.innerHTML = '';
                tile.appendChild(placeholder);
              }
            });
            pub.track.on('enabled', () => {
              if (pub.track?.kind === 'video') {
                tile.innerHTML = '';
                const el = pub.track.attach();
                el.className = 'w-full h-full object-cover';
                tile.appendChild(el);
              }
            });
            if (!hasVideo) {
              tile.appendChild(placeholder);
            }
          }
        });
        participant.on('trackSubscribed', (track) => {
          if (track.kind === 'video' || track.kind === 'audio') {
            const el = track.attach();
            el.className = 'w-full h-full object-cover';
            tile.appendChild(el);
          }
        });

        participant.on('trackUnsubscribed', (track) => {
          if (track.kind === 'video' || track.kind === 'audio') {
            track.detach().forEach((el) => el.remove());
          }
        });
        remoteVideoRef.current!.appendChild(tile);
      });
    }
  }, [remoteParticipants]);
  const handleToggleCamera = () => {
    if (!localParticipant) return;
    localParticipant.videoTracks.forEach((pub) => {
      //if(!pub.track) return;
      if (pub.track.isEnabled) {
        pub.track.disable();
        setIsCameraOn(false);
      } else {
        pub.track.enable();
        setIsCameraOn(true);
      }
    });
  };

  const handleToggleMic = () => {
    if (!localParticipant) return;
    localParticipant.audioTracks.forEach((pub) => {
      //if(!pub.track) return;
      if (pub.track.isEnabled) {
        pub.track.disable();
        setIsMicOn(false);
      } else {
        pub.track.enable();
        setIsMicOn(true);
      }
    });
  };
  function handleLeaveRoom() {
    disconnectCall();
    setIsJoining(false);
    navigate('/waiting-room');
  }
  useEffect(() => {
    joinRoom(videoEnabled, audioEnabled, selectedCamera, selectedMic);
    return () => {
      disconnectCall();
    };
  }, []);
  const totalParticipants = remoteParticipants.length + 1;

  const gridCols =
    totalParticipants === 1
      ? 'grid-cols-1'
      : totalParticipants === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : totalParticipants <= 4
      ? 'grid-cols-2'
      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  return (
    <div className="relative w-full h-screen bg-black">
      <div className="w-full h-full p-4">
        <div className={`grid gap-4 w-full h-full ${gridCols}`}>
          {/* REMOTE PARTICIPANTS */}
          <div ref={remoteVideoRef} className="contents" />

          {/* LOCAL PARTICIPANT */}
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-gray-700 flex items-center justify-center">
            {isCameraOn ? (
              <div ref={localVideoRef} className="w-full h-full" />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-300">
                <VideoCameraOutlined className="text-3xl mb-2 opacity-70" />
                <span className="text-sm tracking-wide">Camera Off</span>
              </div>
            )}

            <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-1 rounded">
              You {!isMicOn && ' (Muted)'}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-20 bg-gray-900 flex items-center justify-center gap-8">
        {/* Camera */}
        <button
          onClick={handleToggleCamera}
          className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center"
        >
          {isCameraOn ? (
            <VideoCameraFilled className="text-white text-xl" />
          ) : (
            <VideoCameraOutlined className="text-red-500 text-xl" />
          )}
        </button>

        {/* Mic */}
        <button
          onClick={handleToggleMic}
          className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center"
        >
          {isMicOn ? (
            <AudioOutlined className="text-white text-xl" />
          ) : (
            <AudioMutedOutlined className="text-red-500 text-xl" />
          )}
        </button>

        {/* Leave */}
        <button
          onClick={handleLeaveRoom}
          className="w-14 h-12 rounded-full bg-red-600 flex items-center justify-center"
        >
          <PhoneFilled className="text-white text-xl rotate-135" />
        </button>
      </div>
    </div>
  );
}
