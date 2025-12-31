import React, { use, useEffect, useState } from 'react';
import {
  Card,
  Input,
  Button,
  List,
  message,
  Typography,
  Space,
  Divider,
} from 'antd';
import {
  VideoCameraAddOutlined,
  ArrowRightOutlined,
  HistoryOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import useAuth from '../../../hooks/useAuth';
import useMeeting from '../../../hooks/useMeeting';
import { API_BASE_URL } from '../../../config';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface Room {
  name: string;
}

const Home: React.FC = () => {
  const { currentLoggedInUserData } = useAuth();
  const navigate = useNavigate();
  const [roomValue, setRoomValue] = useState('');
  const {setRoomName,setTwilioToken}=useMeeting();
  const [rooms, setRooms] = useState<Room[]>([]);
  const accessToken = currentLoggedInUserData?.accessToken as string;
  const userName = currentLoggedInUserData?.user.username;
  const currLogedInUserId = currentLoggedInUserData?.user.id;

  const handleJoinRoom = async (targetRoomName?: string) => {
    const finalRoomName = targetRoomName || roomValue.trim();
    if (!finalRoomName) {
      message.warning('Please enter a room name');
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/room`,
        { roomName: finalRoomName },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const tokenRes = await axios.post(
        `${API_BASE_URL}/api/token`,
        { identity: String(currLogedInUserId) },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const token = tokenRes.data.accessToken;
      setRoomName(finalRoomName);
      setTwilioToken(token);
      navigate('/waiting-room');
      message.success(`Joined room: ${finalRoomName}`);
    } catch (error) {
      message.error('Failed to join room');
    }
  };
  useEffect(() => {
    const fetchRooms = async () => {
      const res = await axios.get(`${API_BASE_URL}/api/room`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setRooms(res.data.rooms);
    };
    fetchRooms();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-screen " />

      <div className="max-w-7xl mx-auto px-6 pt-16 ">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT: CTA Section */}
          <div className="lg:col-span-7 bg-white/10 backdrop-blur-3 rounded-xl p-6">
            <Title level={1} className="text-5xl font-extrabold mb-4 ">
              Premium video meetings. <br />
              <span className="text-blue-600">Now free for everyone.</span>
            </Title>
            <Text className="text-lg text-white block mb-10 max-w-xl">
              We re-engineered the service we built for secure business
              meetings, VideoConnect, to make it free and available for all.
            </Text>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-72">
                <Input
                  size="large"
                  placeholder="Enter room name"
                  prefix={<TeamOutlined className="text-gray-900" />}
                  value={roomValue}
                  onChange={(e) => setRoomValue(e.target.value)}
                  className="h-12 rounded-lg border-gray-300 "
                />
              </div>
              <Button
                type="primary"
                size="large"
                icon={<VideoCameraAddOutlined />}
                onClick={() => handleJoinRoom()}
                className="h-12 px-8 rounded-lg bg-blue-600 font-bold shadow-lg shadow-blue-200"
              >
                Start Meeting
              </Button>
            </div>

            <Divider className="my-10" />
            <div className="flex gap-8">
              <div>
                <Title level={4} className="m-0">
                  100%
                </Title>
                <Text className="text-white">Encrypted</Text>
              </div>
              <div>
                <Title level={4} className="m-0">
                  HD
                </Title>
                <Text className="text-white">Quality</Text>
              </div>
            </div>
          </div>

          {/* RIGHT: Active Rooms List */}
          <div className="lg:col-span-5  bg-white/10 backdrop-blur-3 rounded-xl ">
            <Card
              className="rounded-2xl border-none shadow-2xl bg-white/10 backdrop-blur-3 lg:h- "
              title={
                <Space>
                  <HistoryOutlined className="text-blue-800" />
                  <span className="font-bold ">Active & Recent Rooms</span>
                </Space>
              }
            >
              <List
                dataSource={rooms}
                locale={{ emptyText: "You haven't joined any rooms yet." }}
                renderItem={(room) => (
                  <List.Item
                    key={room.name}
                    className="group cursor-pointer bg-blue-50 hover:bg-blue-100 p-4 rounded-xl transition-all border-none mb-2"
                    onClick={() => handleJoinRoom(room.name)}
                  >
                    <List.Item.Meta
                      avatar={
                        <div className="w-10 h-10 bg-blue-200 text-blue-600 rounded-full flex items-center justify-center">
                          <VideoCameraAddOutlined />
                        </div>
                      }
                      title={
                        <span className="font-bold text-gray-700">
                          {room.name}
                        </span>
                      }
                      description={
                        <Text type="secondary">Ready to rejoin</Text>
                      }
                    />
                    <ArrowRightOutlined className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
