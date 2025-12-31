import Home from './components/home/Home';
import Login from './components/authentication/Login';
import Register from './components/authentication/Register';
import LayoutProject from './LayoutProject';
import { Route, Routes } from 'react-router-dom';
import WaitingRoom from './components/waiting-room/WaitingRoom';
export default function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route element={<LayoutProject />}>
          <Route path="/home" element={<Home />}></Route>
          <Route path="/waiting-room" element={<WaitingRoom />}></Route>
        </Route>
      </Routes>
    </>
  );
}
