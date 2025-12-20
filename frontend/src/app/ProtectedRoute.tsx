import { useEffect } from "react";
import useUser from "..//hooks/useUser";
import { useNavigate } from "react-router-dom";

export default function Protected({ children }: { children: React.ReactNode }) {
  const { currentLoggedInUserData } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
  
    if (!currentLoggedInUserData) {
      navigate("/");
    }
  }, [currentLoggedInUserData]);

  if (!currentLoggedInUserData) return null;
  if(!currentLoggedInUserData?.accessToken) return null;
  return children;
}
