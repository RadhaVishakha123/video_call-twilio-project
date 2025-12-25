import { useEffect } from 'react';
import { Form, Input, Button, Typography, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import useUser from '../../../hooks/useAuth';
const { Title, Text } = Typography;
export default function Login() {
  const { isAuthenticated, loginUser } = useUser();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    const success: boolean = await loginUser(values);
    if (success) {
      form.resetFields();
    }
  };
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/Home');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <Card className="w-full max-w-md shadow-md rounded-xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-2">
            FaceLink
          </h2>
          <Title level={3}>Welcome Back</Title>
          <Text type="secondary">Login to your account</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Email required' },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password required' }]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large">
            Login
          </Button>

          <div className="text-center mt-4">
            <Text>Don’t have an account? </Text>
            <Button type="link" onClick={() => navigate('/register')}>
              Register
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
