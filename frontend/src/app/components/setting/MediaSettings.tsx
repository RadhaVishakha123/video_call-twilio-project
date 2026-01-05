import { Select, Typography } from 'antd';
import useMeeting from '../../../hooks/useMeeting';
const { Text } = Typography;
const { Option } = Select;

export default function MediaSettings() {
  const {
    cameras,
    microphones,
    selectedCamera,
    setSelectedCamera,
    selectedMic,
    setSelectedMic,
  } = useMeeting();

  return (
    <div className="flex flex-col gap-4">
      {/* Camera select */}
      <div>
        <Text strong>Camera</Text>
        <Select
          className="w-full mt-1"
          value={selectedCamera}
          onChange={setSelectedCamera}
        >
          {cameras?.map((cam) => (
            <Option key={cam?.deviceId} value={cam?.deviceId}>
              {cam?.label || 'Camera'}
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
          {microphones?.map((mic) => (
            <Option key={mic?.deviceId} value={mic?.deviceId}>
              {mic?.label || 'Microphone'}
            </Option>
          ))}
        </Select>
      </div>
    </div>
  );
}
