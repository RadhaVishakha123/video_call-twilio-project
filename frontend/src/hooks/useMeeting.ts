import { useContext } from 'react';
import { MeetingContext } from '../contexts/MeetingContext';
export default function useMeeting() {
  return useContext(MeetingContext);
}
