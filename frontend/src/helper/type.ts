export interface User {
  accessToken: string;
  user: any;
}
export interface UserContextInterface {
  currentLoggedInUserData: User | null;
  setCurrentLoggedInUserData: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  registerUser: (data: RegisterInterface) => Promise<boolean>;
  loginUser: (data: LoginInterface) => Promise<boolean>;
}
export interface RegisterInterface {
  username: string;
  email: string;
  password: string;
}
export interface LoginInterface {
  email: string;
  password: string;
}
