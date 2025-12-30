import { Layout, Avatar, Dropdown } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import type { MenuProps } from "antd";

const { Header: AntHeader } = Layout;

export default function Header() {
  const { currentLoggedInUserData, logoutUser } = useAuth();
  const username = currentLoggedInUserData?.user?.username || "User";

  const menuItems: MenuProps["items"] = [
    {
      key: "username",
      label: (
        <div className="px-3 py-1 text-purple-700 font-semibold">
          {username}
        </div>
      ),
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: (
        <span className="text-red-500 font-medium flex items-center gap-2">
          <LogoutOutlined />
          Logout
        </span>
      ),
      onClick: logoutUser,
    },
  ];

  return (
    <AntHeader className="relative z-50 flex items-center justify-between px-6 bg-white/10 backdrop-blur-md shadow-md">

  {/* Left */}
  <div className="text-black font-bold text-xl tracking-wide">
    FaceLink
  </div>

  {/* Center */}
  {/* <nav>
    <NavLink
      to="/home"
      className={({ isActive }) =>
        `px-4 py-2 rounded-full transition-all duration-200 ${
          isActive
            ? "bg-white text-purple-700 font-semibold shadow"
            : "text-purple-100 hover:bg-white/20"
        }`
      }
    >
      Home
    </NavLink>
  </nav> */}

  {/* Right */}
  <Dropdown
    menu={{ items: menuItems }}
    placement="bottomRight"
    trigger={["click"]}
  >
    <div className="flex items-center gap-3 cursor-pointer px-3 py-1 rounded-full hover:bg-white/20 transition-all">
      <Avatar
        size="large"
        icon={<UserOutlined />}
        className="bg-white text-black"
      />
      <span className="text-black font-medium hidden sm:block">
        {username}
      </span>
    </div>
  </Dropdown>
</AntHeader>

  );
}
