import { useEffect, useRef } from 'react';
import useMeeting from '../../../hooks/useMeeting';
import {
  VideoCameraOutlined,
  AudioMutedOutlined,
  AudioOutlined,
} from '@ant-design/icons';
import { LocalVideoTrack } from 'twilio-video';
import useAuth from '../../../hooks/useAuth';
import { LocalParticipantProps } from '../../../helper/type';
export default function LocalParticipant({
  isCameraOn,
  isMicOn,
}: LocalParticipantProps) {
  const { localParticipant } = useMeeting();
  const videoRef = useRef<HTMLDivElement>(null);
  const { currentLoggedInUserData } = useAuth();
  const currUserName = currentLoggedInUserData?.user.username;

  useEffect(() => {
    if (!localParticipant || !videoRef.current) return;

    let currentTrack: LocalVideoTrack | null = null;

    const attach = (track: LocalVideoTrack) => {
      videoRef.current!.innerHTML = '';
      const el = track.attach();
      el.className = 'w-full h-full object-cover mirror-mode';
      videoRef.current!.appendChild(el);
    };

    // Existing track
    localParticipant.videoTracks.forEach((pub) => {
      if (pub.track) {
        currentTrack = pub.track;
        attach(pub.track);
      }
    });

    // Camera switch (new track published)
    localParticipant.on('trackPublished', (pub) => {
      if (pub.kind === 'video' && pub.track) {
        currentTrack = pub.track as LocalVideoTrack;
        attach(currentTrack);
      }
    });

    // Camera removed
    localParticipant.on('trackUnpublished', (pub) => {
      if (pub.kind === 'video') {
        pub.track?.stop();
        pub.track?.detach().forEach((el: any) => el.remove());
      }
    });
    return () => {
      currentTrack?.detach().forEach((el) => el.remove());
    };
  }, [localParticipant]);

  return (
    <div className="p-2 w-full h-full ">
      <div className="relative w-full h-full bg-black rounded-xl overflow-hidden  border-2 border-green-500 ">
        <div ref={videoRef} className=" absolute inset-0" />
        {!isCameraOn && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-gray-300 bg-black">
            <VideoCameraOutlined className="text-3xl mb-2 opacity-70" />
            <span className="text-sm">Camera Off</span>
          </div>
        )}
        <div className="absolute bottom-2 left-2 z-20 flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-lg text-xs">
          <span>{currUserName}</span>
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
