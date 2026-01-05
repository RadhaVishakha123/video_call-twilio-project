import { Button, Typography, Select } from 'antd';
import { useEffect, useRef, useState } from 'react';
import useMeeting from '../../../hooks/useMeeting';
import useAuth from '../../../hooks/useAuth';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  VideoCameraOutlined,
  VideoCameraFilled,
  AudioOutlined,
  AudioMutedOutlined,
} from '@ant-design/icons';
import VideoCall from '../video-call/VideoCall';
import MediaSettings from '../setting/MediaSettings';
const { Title, Text } = Typography;
export default function WaitingRoom() {
  const { roomName, twilioToken, cancelMeeting, selectedCamera, selectedMic } =
    useMeeting();
  const { currentLoggedInUserData } = useAuth();
  const userName = currentLoggedInUserData?.user.username;
  const message = App.useApp().message;
  if (!roomName || !twilioToken) {
    return <div>Invalid meeting</div>;
  }
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

  const handleJoin = async () => {
    if (!selectedCamera && !selectedMic) {
      message.error('Please select a camera and microphone');
      return;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsJoining(true);
  };
  const handleLeavewaitingRoom = () => {
    cancelMeeting();
    navigate('/Home');
  };
  if (isjoining) {
    return (
      <VideoCall
        videoEnabled={videoEnabled}
        audioEnabled={audioEnabled}
        setIsJoining={setIsJoining}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white/10 backdrop-blur-0 rounded-2xl shadow-xl p-8 w-full max-w-4xl grid  md:grid-cols-1 gap-8">
        {/* Left: Video Preview */}
        <div className="flex flex-col items-center gap-6">
          {/* Video Preview Box */}
          <div className="relative bg-black rounded-2xl overflow-hidden w-80 h-56 flex items-center justify-center shadow-xl">
            {videoEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-white text-lg">Camera Off</div>
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
            ? 'bg-white text-blue-600 hover:bg-gray-100'
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
            ? 'bg-white text-blue-600 hover:bg-gray-100'
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
        </div>

        {/* Right: Controls */}
        <div className="flex flex-col gap-5">
          <div>
            <Title level={3}>Ready to join?</Title>
            <Text type="secondary" className="!text-black">
              Room: {roomName}
            </Text>
          </div>
          <MediaSettings />

          {/* Join */}
          <div className=" flex gap-3">
            <Button
              type="primary"
              size="large"
              className="mt-4"
              onClick={handleLeavewaitingRoom}
              block
            >
              Leave Meeting
            </Button>
            <Button
              type="primary"
              size="large"
              className="mt-4"
              onClick={handleJoin}
              block
            >
              Join Meeting
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
