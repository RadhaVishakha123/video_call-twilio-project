import { Outlet } from "react-router-dom";
import Header from "./components/header/Header";
import Protected from "./ProtectedRoute";
import bg from "..//assets/bg.png"
export default function LayoutProject() {
  return (
    <Protected>
      {/* <div
        className="relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
           //backgroundImage: `url(${bg})`, 
           backgroundColor:"whitesmoke"
        }}
      > */}
        {/* Dark overlay */}
        {/* <div className="absolute inset-0" /> */}

        {/* App content */}
        {/* <div className="relative z-10"> */}
          <Header />
          <main className="px-6  ">
            <Outlet />
          </main>
        {/* </div> */}
      {/* </div> */}
    </Protected>
  );
}
