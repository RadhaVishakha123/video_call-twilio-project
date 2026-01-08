import Video, { Room, RemoteParticipant, LocalParticipant } from 'twilio-video';

export interface User {
  accessToken: string;
  user: any;
}
export interface UserContextInterface {
  currentLoggedInUserData: User | null;
  setCurrentLoggedInUserData: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  registerUser: (data: RegisterInterface) => Promise<boolean>;
  loginUser: (data: LoginInterface) => Promise<boolean>;
  logoutUser: () => void;
}
export interface RegisterInterface {
  username: string;
  email: string;
  password: string;
}
export interface LoginInterface {
  email: string;
  password: string;
}
export interface RoomUser {
  userId: string;
  username: string;
}
export interface VideoCallProps {
  videoEnabled: boolean;
  audioEnabled: boolean;
  joinedUsers: RoomUser[];
}
export interface MeetingContextType {
  room: Room | null;
  roomName: string | null;
  twilioToken: string | null;
  setTwilioToken: React.Dispatch<React.SetStateAction<string | null>>;
  setRoomName: React.Dispatch<React.SetStateAction<string | null>>;
  localParticipant: LocalParticipant | null;
  remoteParticipants: RemoteParticipant[];
  joinRoom: (video: boolean, audio: boolean) => Promise<void>;
  disconnectCall: () => void;
  cancelMeeting: () => void;
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  selectedCamera: string | undefined;
  setSelectedCamera: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedMic: string | undefined;
  setSelectedMic: React.Dispatch<React.SetStateAction<string | undefined>>;
  isjoining: boolean;
  setIsJoining: React.Dispatch<React.SetStateAction<boolean>>;
}
export interface LocalParticipantProps {
  isCameraOn: boolean;
  isMicOn: boolean;
}

