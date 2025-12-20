import { useState, useEffect } from "react";
import { Form, Input, Button, Typography, Card, App } from "antd";
import { useNavigate } from "react-router-dom";
import useUser from "../../../hooks/useUser";
import { API_BASE_URL } from "../../../config";

const { Title, Text } = Typography;

export default function AuthLoginRegister() {
  const message = App.useApp().message;
  const { setCurrentLoggedInUserData, currentLoggedInUserData } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Register user
  async function registerUser(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  // Login user
  async function loginUser(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  // Form submit
  const onFinish = async (values: any) => {
    if (isLogin) {
      const response: any = await loginUser({
        email: values.email,
        password: values.password,
      });

      if (response.message !== "Login success") {
        message.error(response.message);
        return;
      }

      message.success("Welcome!");
      setCurrentLoggedInUserData({
        accessToken: response.accessToken,
        user: response.user,
      });

      document.cookie = `refreshToken=${response.refreshToken}; Path=/; Max-Age=${
        7 * 24 * 60 * 60
      }`;

      form.resetFields();
      navigate("/Home");
    } else {
      const { confirmPassword, ...rest } = values;
      const response: any = await registerUser(rest);

      if (response.message !== "User registered") {
        message.error(response.message);
        return;
      }

      message.success("Registration successful!");
      form.resetFields();
      setIsLogin(true);
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (currentLoggedInUserData) {
      navigate("/Home");
    }
  }, [currentLoggedInUserData, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <Card className="w-full max-w-md border border-gray-200 shadow-md rounded-xl">
        <div className="text-center mb-8">
          {/* App Name */}
          <h2
            className="text-4xl font-extrabold text-gray-800 tracking-wide mb-2"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            FaceLink
          </h2>

          {/* Header */}
          <Title level={3} className="!mb-2 !text-gray-800">
            {isLogin ? "Welcome Back" : "Create an Account"}
          </Title>

          {/* Subtext */}
          <Text className="!text-gray-500">
            {isLogin
              ? "Login to your FaceLink account"
              : "Create your FaceLink account"}
          </Text>
        </div>

        <Form
          name="auth-form"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="on"
        >
          {!isLogin && (
            <Form.Item
              label={<span className="text-gray-700">Username</span>}
              name="username"
              rules={[{ required: true, message: "Please enter your name!" }]}
            >
              <Input placeholder="John32" size="large" />
            </Form.Item>
          )}

          <Form.Item
            label={<span className="text-gray-700">Email</span>}
            name="email"
            rules={[
              { required: true, message: "Please enter your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="example@mail.com" size="large" />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-700">Password</span>}
            name="password"
            rules={[
              { required: true, message: "Please enter your password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password placeholder="••••••••" size="large" />
          </Form.Item>

          {!isLogin && (
            <Form.Item
              label={<span className="text-gray-700">Confirm Password</span>}
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Passwords do not match!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="••••••••" size="large" />
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              className="rounded-lg bg-blue-600 hover:bg-blue-700 border-none"
            >
              {isLogin ? "Login" : "Register"}
            </Button>
          </Form.Item>

          <div className="text-center">
            <Text className="!text-gray-500">
              {isLogin ? "Don't have an account? " : "Already a member? "}
            </Text>
            <Button
              type="link"
              onClick={() => setIsLogin(!isLogin)}
              className="p-0 text-blue-600 hover:text-blue-500"
            >
              {isLogin ? "Register" : "Login"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
