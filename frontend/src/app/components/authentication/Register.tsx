import { Form, Input, Button, Typography, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
const { Title, Text } = Typography;

export default function Register() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const onFinish = async (values: any) => {
    const { confirmPassword, ...payload } = values;
    const success: boolean = await registerUser(payload);
    if (success) {
      form.resetFields();
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <Card className="w-full max-w-md shadow-md rounded-xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-2">
            FaceLink
          </h2>
          <Title level={3}>Create Account</Title>
          <Text type="secondary">Join FaceLink today</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Username required' }]}
          >
            <Input size="large" />
          </Form.Item>

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
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large">
            Register
          </Button>

          <div className="text-center mt-4">
            <Text>Already have an account? </Text>
            <Button type="link" onClick={() => navigate('/login')}>
              Login
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
