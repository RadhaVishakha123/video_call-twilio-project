import { createContext, useState, useEffect } from "react";
import type { UserContextInterface } from "..//helper/type";

export const UserContext = createContext<UserContextInterface>({
  currentLoggedInUserData: null,
  setCurrentLoggedInUserData: () => {},
});

export default function UserContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentLoggedInUserData, setCurrentLoggedInUserData] = useState<any>(null);

  useEffect(()=>{},[currentLoggedInUserData])

  return (
    <UserContext.Provider
      value={{
        currentLoggedInUserData,
        setCurrentLoggedInUserData,
      
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
