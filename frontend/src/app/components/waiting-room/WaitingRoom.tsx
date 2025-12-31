import { Button, Typography, Select, Switch } from 'antd';
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
const { Title, Text } = Typography;
const { Option } = Select;

export default function WaitingRoom() {
  const { roomName, twilioToken, cancelMeeting } = useMeeting();
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
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>();
  const [selectedMic, setSelectedMic] = useState<string>();
  const [isjoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  //  Load devices + preview
  useEffect(() => {
    const initDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const cams = devices.filter((d) => d.kind === 'videoinput');
      const mics = devices.filter((d) => d.kind === 'audioinput');

      setCameras(cams);
      setMicrophones(mics);

      setSelectedCamera(cams[0]?.deviceId);
      setSelectedMic(mics[0]?.deviceId);
    };

    initDevices();
  }, []);

  // Start preview
  useEffect(() => {
    const startPreview = async () => {
      if (!videoEnabled && !audioEnabled) {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        return;
      }

      if (!selectedCamera && !selectedMic) {
        message.error('Please select a camera and microphone');
        return;
      }

      streamRef.current?.getTracks().forEach((t) => t.stop());

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled ? { deviceId: selectedCamera } : false,
        audio: audioEnabled ? { deviceId: selectedMic } : false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    };

    startPreview();

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [selectedCamera, selectedMic, videoEnabled, audioEnabled]);
  const handleJoin = async () => {
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
        selectedCamera={selectedCamera}
        selectedMic={selectedMic}
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

          {/* Camera select */}
          <div>
            <Text strong>Camera</Text>
            <Select
              className="w-full mt-1"
              value={selectedCamera}
              onChange={setSelectedCamera}
            >
              {cameras.map((cam) => (
                <Option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || 'Camera'}
                </Option>
              ))}
            </Select>
          </div>

          {/* Mic select */}
          <div>
            <Text strong>Microphone</Text>
            <Select
              className="w-full mt-1"
              value={selectedMic}
              onChange={setSelectedMic}
            >
              {microphones.map((mic) => (
                <Option key={mic.deviceId} value={mic.deviceId}>
                  {mic.label || 'Microphone'}
                </Option>
              ))}
            </Select>
          </div>
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
