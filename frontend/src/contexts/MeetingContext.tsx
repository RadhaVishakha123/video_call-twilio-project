import { createContext, useState } from 'react';
import { App } from 'antd';
import Video, { Room, RemoteParticipant, LocalParticipant } from 'twilio-video';
import { MeetingContextType } from '..//helper/type';
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

  const joinRoom = async (
    video: boolean,
    audio: boolean,
    cameraId?: string,
    micId?: string
  ) => {
    try {
      if (!twilioToken || !roomName) {
        appMessage.error('Missing room name or Twilio token');
        return;
      }
      if (room) {
        console.warn('Already connected to a room');
        return;
      }

      const joinedRoom = await Video.connect(twilioToken as string, {
        name: roomName as string,
        video: video ? { deviceId: cameraId } : false,
        audio: audio ? { deviceId: micId } : false,
      });
      setRoom(joinedRoom);
      setLocalParticipant(joinedRoom.localParticipant);

      // Handle already connected participants
      setRemoteParticipants(Array.from(joinedRoom.participants.values()));
      joinedRoom.on('participantConnected', (participant) => {
        setRemoteParticipants((prev) => [...prev, participant]);
      });

      // When a participant leaves
      joinedRoom.on('participantDisconnected', (participant) => {
        setRemoteParticipants((prev) =>
          prev.filter((p) => p.sid !== participant.sid)
        );
      });
    } catch (err) {
      console.error('Error joining Twilio room:', err);
    }
  };
  const disconnectCall = () => {
    room?.localParticipant.tracks.forEach((pub) => {
      const track = pub.track;
      if (track && (track.kind === 'video' || track.kind === 'audio')) {
        track.stop();
        track.detach().forEach((el) => el.remove());
      }
    });
    room?.disconnect();
    setRoom(null);
    setLocalParticipant(null);
    setRemoteParticipants([]);
  };
  const cancelMeeting = () => {
    disconnectCall();
    setRoomName(null);
    setTwilioToken(null);
  };
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
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
}
