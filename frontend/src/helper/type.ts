import type { Dispatch, SetStateAction } from "react";
export interface User {
    accessToken:string
    user:any
  }
  export interface UserContextInterface {
    currentLoggedInUserData: User|null;
    setCurrentLoggedInUserData: React.Dispatch<React.SetStateAction<User|null>>
  }