import AuthLoginRegister from "./components/authentication/AuthLoginRegister";
import UserContextProvider from "..//contexts/UserContext";
import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import LayoutProeject from "./LayoutProject";
import Home from "./components/home/Home"
// import UserProfile from "./Components/userProfile/UserProfile";
 import TokenRefresher from "./components/token/TokenRefresher";
function App() {
  const router = createBrowserRouter([
    { path: "/", element: <AuthLoginRegister /> },
    {
      element: <LayoutProeject />,
      children: [
        { path: "Home", element: <Home /> },
        // { path: "UserProfile", element: <UserProfile /> },
      ],
    },
  ]);
  return (
    <>
      <UserContextProvider>
        <TokenRefresher/>
          <RouterProvider router={router}></RouterProvider>
      </UserContextProvider>   
{/* <UserContextProvider><AuthLoginRegister/></UserContextProvider>
       */}
    </>
  );
}

export default App;
