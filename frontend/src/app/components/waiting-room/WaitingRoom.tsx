import { Button, Typography, Avatar, Select, Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
import useMeeting from '../../../hooks/useMeeting';
import useAuth from '../../../hooks/useAuth';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../../../socket/Socket';
import {
  VideoCameraOutlined,
  VideoCameraFilled,
  AudioOutlined,
  AudioMutedOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { RoomUser } from '../../../helper/type';
import { getInitials } from '../../../helper/utility';
import { API_BASE_URL } from '../../../config';
import axios from 'axios';
import VideoCall from '../video-call/VideoCall';
import MediaSettings from '../setting/MediaSettings';

const { Title, Text } = Typography;
export default function WaitingRoom() {
  const { roomName, twilioToken, cancelMeeting, selectedCamera, selectedMic } =
    useMeeting();
  
  const [joinedUsers, setJoinedUsers] = useState<RoomUser[]>([]);
  const { currentLoggedInUserData } = useAuth();
  const accessToken = currentLoggedInUserData?.accessToken as string;
  const userName = currentLoggedInUserData?.user.username;
  const message = App.useApp().message;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isjoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const startPreview = async () => {
      try {
        if (!videoEnabled && !audioEnabled) {
          streamRef.current?.getTracks().forEach((t) => t.stop());
          if (videoRef.current) videoRef.current.srcObject = null;
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled
            ? selectedCamera
              ? { deviceId: { exact: selectedCamera } }
              : true
            : false,
          audio: audioEnabled
            ? selectedMic
              ? { deviceId: { exact: selectedMic } }
              : true
            : false,
        });

        const oldStream = streamRef.current;
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        oldStream?.getTracks().forEach((t) => t.stop());
      } catch (err) {
        console.error('Preview error:', err);
      }
    };

    startPreview();

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [selectedCamera, selectedMic, videoEnabled, audioEnabled]);
  useEffect(() => {
    const socket = getSocket();

    //  Attach listener FIRST
    socket.on('room-users-updated', ({ roomName: rName, users }) => {
      if (rName === roomName) {
        console.log('users from socket:', users);
        setJoinedUsers(users);
        console.log('users from socket2', joinedUsers);
      }
    });

    //  Fetch initial users via API
    const fetchJoinUser = async () => {
      if (!roomName || !accessToken) return;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/api/room/joinuser`,
          { roomName: roomName },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (res.data?.users) {
          setJoinedUsers(res.data.users);
        }
      } catch (err) {
        console.error('joinuser error:', err);
      }
    };

    fetchJoinUser();

    return () => {
      socket.off('room-users-updated');
    };
  }, [roomName]);

  const handleJoin = async () => {
    if (!selectedCamera && !selectedMic) {
      message.error('Please select a camera and microphone');
      return;
    }
    const res = await axios.post(
      `${API_BASE_URL}/api/room/participant`,
      { roomName: roomName },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const result = await res.data;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    message.success(`${result.message}`);
    setIsJoining(true);
  };
  const handleLeavewaitingRoom = async () => {
    cancelMeeting();
    navigate('/Home');
  };
  if (!roomName || !twilioToken) {
    return <div>Invalid meeting</div>;
  }
  if (isjoining) {
    return (
      <VideoCall
        videoEnabled={videoEnabled}
        audioEnabled={audioEnabled}
        setIsJoining={setIsJoining}
        joinedUsers={joinedUsers}
      />
    );
  }

  return (
    <div className="w-full flex items-center justify-center mt-20">
      <div className="bg-white rounded-2xl  p-8 w-full max-w-full mx-20 grid grid-cols-1 lg:grid-cols-2  md:grid-cols-2  gap-8">
        <div className="flex flex-col items-center gap-6">
          {/* Video Preview Box */}
          <div
            className="
    relative bg-black rounded-2xl overflow-hidden shadow-xl
    w-full
    max-w-full
    lg:max-w-[900px]
    xl:max-w-[1100px]
    2xl:max-w-[1400px]
    aspect-video
    flex items-center justify-center
  "
          >
            {videoEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-white flex flex-col items-center gap-2">
                {/* <VideoCameraOutlined className="text-3xl opacity-70" /> */}
                <span className="text-sm">Camera Off</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-6">
            {/* Camera Button */}
            <button
              onClick={() => setVideoEnabled((v) => !v)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all
        ${
          videoEnabled
            ? 'bg-slate-700 text-white hover:bg-slate-900'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
            >
              {videoEnabled ? (
                <VideoCameraFilled style={{ fontSize: 22 }} />
              ) : (
                <VideoCameraOutlined style={{ fontSize: 22 }} />
              )}
            </button>

            {/* Mic Button */}
            <button
              onClick={() => setAudioEnabled((a) => !a)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all
        ${
          audioEnabled
            ? 'bg-slate-700 text-white hover:bg-slate-900'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
            >
              {audioEnabled ? (
                <AudioOutlined style={{ fontSize: 22 }} />
              ) : (
                <AudioMutedOutlined style={{ fontSize: 22 }} />
              )}
            </button>
          </div>
          <div className="mt-3 flex flex-col items-center">
            <Text strong className="mb-2">
              Joined users
            </Text>

            {joinedUsers.length === 0 ? (
              <Text type="secondary">No one has joined yet</Text>
            ) : (
              <Avatar.Group
                size="large"
                max={{
                  count: 3,
                  style: {
                    color: '#f56a00',
                    backgroundColor: '#fde3cf',
                    cursor: 'pointer',
                  },
                }}
              >
                {joinedUsers?.map((user, index) => (
                  <Tooltip title={user?.username} key={index} placement="top">
                    <Avatar
                      style={{
                        backgroundColor: '#1890ff',
                        fontWeight: 1200,
                      }}
                    >
                      {getInitials(user.username)}
                    </Avatar>
                  </Tooltip>
                ))}
              </Avatar.Group>
            )}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-col max-w-4xl  xl:mx-20  gap-5">
          <div>
            <Title level={3}>Ready to join?</Title>
            <Text type="secondary" className="!text-black">
              Room: {roomName}
            </Text>
          </div>
          <MediaSettings />

          {/* Join */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              type="primary"
              size="large"
              className="mt-4 w-full sm:flex-1"
              onClick={handleLeavewaitingRoom}
            >
              Leave Meeting
            </Button>

            <Button
              type="primary"
              size="large"
              className="mt-4 w-full sm:flex-1"
              onClick={handleJoin}
            >
              Join Meeting
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
