import { useEffect, useRef, useState } from 'react';
import {
  RemoteParticipant as TwilioRemoteParticipant,
  RemoteVideoTrack,
  RemoteAudioTrack,
} from 'twilio-video';
import {
  VideoCameraOutlined,
  AudioMutedOutlined,
  AudioOutlined,
} from '@ant-design/icons';

type Props = {
  participant: TwilioRemoteParticipant;
  username:string
};

export default function RemoteParticipant({ participant,username }: Props) {
  const videoRef = useRef<HTMLDivElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  useEffect(() => {
    if (!participant) return;

    const attachVideo = (track: RemoteVideoTrack) => {
      if (!videoRef.current) return;
      videoRef.current.innerHTML = '';
      const el = track.attach();
      el.className = 'w-full h-full object-cover';
      videoRef.current.appendChild(el);

      setIsCameraOn(track.isEnabled);

      // LISTEN HERE (IMPORTANT)
      track.on('enabled', () => setIsCameraOn(true));
      track.on('disabled', () => setIsCameraOn(false));
    };

    const detachVideo = (track: RemoteVideoTrack) => {
      track?.detach().forEach((el) => el.remove());
      setIsCameraOn(false);
    };

    const handleAudioTrack = (track: RemoteAudioTrack) => {
      setIsMicOn(track.isEnabled);

      track.on('enabled', () => setIsMicOn(true));
      track.on('disabled', () => setIsMicOn(false));
    };

    // Existing tracks
    participant?.videoTracks.forEach(
      (pub) => pub.track && attachVideo(pub.track)
    );
    participant?.audioTracks.forEach(
      (pub) => pub.track && handleAudioTrack(pub.track)
    );

    // Track events (THIS IS THE FIX)
    const onTrackSubscribed = (track: any) => {
      if (track.kind === 'video') attachVideo(track);
      if (track.kind === 'audio') handleAudioTrack(track);
    };

    const onTrackUnsubscribed = (track: any) => {
      if (track.kind === 'video') detachVideo(track);
      if (track.kind === 'audio') setIsMicOn(false);
    };

    participant.on('trackSubscribed', onTrackSubscribed);
    participant.on('trackUnsubscribed', onTrackUnsubscribed);

    return () => {
      participant.off('trackSubscribed', onTrackSubscribed);
      participant.off('trackUnsubscribed', onTrackUnsubscribed);
      videoRef.current?.querySelectorAll('video').forEach((el) => el.remove());
    };
  }, [participant]);

  return (
    <div className="p-2 w-full h-full">
      <div className="relative w-full h-full bg-black rounded-xl overflow-hidden border">
        <div ref={videoRef} className="absolute inset-0" />

        {!isCameraOn && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-gray-300 bg-black">
            <VideoCameraOutlined className="text-3xl mb-2 opacity-70" />
            <span className="text-sm">Camera Off</span>
          </div>
        )}

        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded text-xs">
          <span>{username }</span>
          {!isMicOn ? (
            <AudioMutedOutlined className="text-red-400" />
          ) : (
            <AudioOutlined className="text-green-400" />
          )}
        </div>
      </div>
    </div>
  );
}

