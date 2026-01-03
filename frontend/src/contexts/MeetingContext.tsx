import { createContext, useState } from 'react';
import { App } from 'antd';
import Video, { Room, RemoteParticipant, LocalParticipant } from 'twilio-video';
import { MeetingContextType } from '..//helper/type';
import { useEffect } from 'react';
export const MeetingContext = createContext<MeetingContextType>({
  room: null,
  roomName: null,
  twilioToken: null,
  setTwilioToken: () => {},
  setRoomName: () => {},
  localParticipant: null,
  remoteParticipants: [],
  joinRoom: async () => {},
  disconnectCall: () => {},
  cancelMeeting: () => {},
  cameras: [],
  microphones: [],
  selectedCamera: undefined,
  setSelectedCamera: () => {},
  selectedMic: undefined,
  setSelectedMic: () => {},
});
export default function MeetingContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const appMessage = App.useApp().message;
  const [roomName, setRoomName] = useState<string | null>(null);
  const [twilioToken, setTwilioToken] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [localParticipant, setLocalParticipant] =
    useState<LocalParticipant | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<
    RemoteParticipant[]
  >([]);
  // device states
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>();
  const [selectedMic, setSelectedMic] = useState<string>();

  const joinRoom = async (video: boolean, audio: boolean) => {
    try {
      if (!twilioToken || !roomName) {
        appMessage.error('Missing room name or Twilio token');
        return;
      }
      if (room) {
        console.warn('Already connected to a room');
        return;
      }
      if (selectedCamera === undefined && video) {
        appMessage.error('Please select a camera');
        return;
      }
      if (selectedMic === undefined && audio) {
        appMessage.error('Please select a microphone');
        return;
      }
      const tracks = [];
      if (selectedCamera) {
        const videoTrack = await Video.createLocalVideoTrack({
          deviceId: { exact: selectedCamera },
        });
        tracks.push(videoTrack);
      }
      if (selectedMic) {
        const audioTrack = await Video.createLocalAudioTrack({
          deviceId: { exact: selectedMic },
        });
        tracks.push(audioTrack);
      }

      const joinedRoom = await Video.connect(twilioToken as string, {
        name: roomName as string,
        tracks: tracks,
      });
      setRoom(joinedRoom);
      setLocalParticipant(joinedRoom.localParticipant);
      console.log(
        'Existing participants:',
        Array.from(joinedRoom.participants.values()).map((p) => p.identity)
      );

      if (!video) {
        joinedRoom.localParticipant.videoTracks.forEach((pub) => {
          pub.track.disable();
        });
      }
      if (!audio) {
        joinedRoom.localParticipant.audioTracks.forEach((pub) => {
          pub.track.disable();
        });
      }
      // Handle already connected participants
      setRemoteParticipants(Array.from(joinedRoom.participants.values()));
      joinedRoom.on('participantConnected', (participant) => {
        setRemoteParticipants((prev) => {
          const exists = prev.find((p) => p.sid == participant.sid);
          if (exists) return prev;
          return [...prev, participant];
        });
        // setRemoteParticipants((prev) => [...prev, participant]);
      });

      // When a participant leaves
      joinedRoom.on('participantDisconnected', (participant) => {
        setRemoteParticipants((prev) =>
          prev.filter((p) => p.sid !== participant.sid)
        );
      });
    } catch (err) {
      console.error('Error joining Twilio room:', err);
      appMessage.error('Failed to join meeting');
    }
  };
  useEffect(() => {
    if (!room || !selectedCamera) return;

    const switchCamera = async () => {
      const participant = room.localParticipant;
      const oldPub = Array.from(participant.videoTracks.values())[0];
      if (!oldPub?.track) return;

      const wasEnabled = oldPub.track.isEnabled;

      const newTrack = await Video.createLocalVideoTrack({
        deviceId: { exact: selectedCamera },
      });

      participant.unpublishTrack(oldPub.track);

      if (!wasEnabled) {
        newTrack.disable();
      } else {
        newTrack.enable(); //  important
      }

      await participant.publishTrack(newTrack);
    };

    switchCamera();
  }, [selectedCamera, room]);

  useEffect(() => {
    if (!room || !selectedMic) return;

    const switchMic = async () => {
      const participant = room.localParticipant;
      const oldPub = Array.from(participant.audioTracks.values())[0];
      if (!oldPub?.track) return;

      const wasEnabled = oldPub.track.isEnabled;

      const newTrack = await Video.createLocalAudioTrack({
        deviceId: { exact: selectedMic },
      });

      participant.unpublishTrack(oldPub.track);

      if (!wasEnabled) {
        newTrack.disable();
      } else {
        newTrack.enable();
      }

      await participant.publishTrack(newTrack);
    };

    switchMic();
  }, [selectedMic, room]);

  const disconnectCall = () => {
    if (!room) return;
    room.disconnect();
    room?.localParticipant.tracks.forEach((pub) => {
      const track = pub.track;
      if (track && (track.kind === 'video' || track.kind === 'audio')) {
        track.stop();
        track.detach().forEach((el) => el.remove());
      }
    });
    setRoom(null);
    setLocalParticipant(null);
    setRemoteParticipants([]);
  };
  const cancelMeeting = () => {
    disconnectCall();
    setRoomName(null);
    setTwilioToken(null);
  };
  useEffect(() => {
    const loadDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const cams = devices.filter((d) => d.kind === 'videoinput');
      const mics = devices.filter((d) => d.kind === 'audioinput');
      console.log('camre', cams);
      console.log('cam', cams[0].deviceId);

      setCameras(cams);
      setMicrophones(mics);
      console.log('camera:', cams);
      console.log('mics:', mics);

      setSelectedCamera(cams[0]?.deviceId);
      setSelectedMic(mics[0]?.deviceId);
    };

    loadDevices();
  }, []);
  return (
    <MeetingContext.Provider
      value={{
        room,
        roomName,
        twilioToken,
        setRoomName,
        setTwilioToken,
        localParticipant,
        remoteParticipants,
        joinRoom,
        disconnectCall,
        cancelMeeting,
        cameras,
        microphones,
        selectedCamera,
        setSelectedCamera,
        selectedMic,
        setSelectedMic,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
}
