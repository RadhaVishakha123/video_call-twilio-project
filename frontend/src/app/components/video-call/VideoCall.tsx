import React, { useEffect, useRef, useState } from 'react';
import LocalParticipant from './LocalParticipant';
import RemoteParticipant from './RemoteParticipant';
import {
  AudioMutedOutlined,
  AudioOutlined,
  VideoCameraOutlined,
  VideoCameraFilled,
  PhoneFilled,
  SettingOutlined,
} from '@ant-design/icons';
import useMeeting from '../../../hooks/useMeeting';
import type { VideoCallProps } from '../../../helper/type';
import { useNavigate } from 'react-router-dom';
import { Avatar, Dropdown } from 'antd';
import MediaSettings from '../setting/MediaSettings';
import useAuth from '../../../hooks/useAuth';
import { API_BASE_URL } from '../../../config';
import { App } from 'antd';
import axios from 'axios';
export default function VideoCall({
  videoEnabled,
  audioEnabled,
  setIsJoining,
}: VideoCallProps) {
  const [isCameraOn, setIsCameraOn] = useState(videoEnabled);
  const [isMicOn, setIsMicOn] = useState(audioEnabled);
  const navigate = useNavigate();
  const message = App.useApp().message;
  const { currentLoggedInUserData } = useAuth();
  const accessToken = currentLoggedInUserData?.accessToken;
  const {
    localParticipant,
    remoteParticipants,
    joinRoom,
    roomName,
    disconnectCall,
  } = useMeeting();
  useEffect(() => {
    if (!localParticipant) return;
    localParticipant?.videoTracks.forEach((pub) =>
      setIsCameraOn(pub.track.isEnabled)
    );
    localParticipant?.audioTracks.forEach((pub) =>
      setIsMicOn(pub.track.isEnabled)
    );
  }, [localParticipant]);
  const handleToggleCamera = () => {
    if (!localParticipant) return;
    localParticipant?.videoTracks.forEach((pub) => {
      if (!pub.track) return;
      if (pub.track.isEnabled) {
        pub?.track.disable();
        setIsCameraOn(false);
      } else {
        pub?.track.enable();
        setIsCameraOn(true);
      }
    });
  };

  const handleToggleMic = () => {
    if (!localParticipant) return;
    localParticipant?.audioTracks.forEach((pub) => {
      if (!pub.track) return;
      if (pub.track.isEnabled) {
        pub?.track.disable();
        setIsMicOn(false);
      } else {
        pub?.track.enable();
        setIsMicOn(true);
      }
    });
  };
  async function handleLeaveRoom() {
    await disconnectCall();
    setIsJoining(false);
    const res = await axios.post(
      `${API_BASE_URL}/api/room/leave`,
      { roomName: roomName },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const result = res.data;
    message.success(`${result.message}`);
    navigate('/waiting-room');
  }

  const joinedRef = useRef(false);

  useEffect(() => {
    if (joinedRef.current) return;
    joinedRef.current = true;

    const joinVideo = async () => {
      await joinRoom(videoEnabled as boolean, audioEnabled as boolean);
      console.log('joinRoom called', Date.now());
    };
    joinVideo();

    // return () => {
    //   disconnectCall();
    // };
  }, []);

  const totalParticipants = remoteParticipants.length + 1;
  const gridCols =
    totalParticipants === 1
      ? 'grid-cols-1 place-items-center'
      : totalParticipants === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : totalParticipants <= 4
      ? 'grid-cols-2'
      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  return (
    <div className="w-full h-screen bg-black flex flex-col">
      {/* VIDEO AREA */}
      <div className="flex-1 overflow-hidden">
        <div className={`grid gap-4 w-full h-full ${gridCols}`}>
          {remoteParticipants?.map((p) => (
            <RemoteParticipant key={p.sid} participant={p} />
          ))}

          <LocalParticipant isCameraOn={isCameraOn} isMicOn={isMicOn} />
        </div>
      </div>

      {/* BOTTOM CONTROLS (ALWAYS VISIBLE) */}
      <div className="h-20 bg-gray-900 flex items-center justify-center gap-8 shrink-0">
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

        {/* Settings */}
        <Dropdown
          trigger={['click']}
          popupRender={() => (
            <div className="bg-white p-4 rounded-xl shadow-lg w-72">
              <MediaSettings />
            </div>
          )}
        >
          <Avatar
            size="large"
            icon={<SettingOutlined />}
            className="text-white cursor-pointer"
          />
        </Dropdown>

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
