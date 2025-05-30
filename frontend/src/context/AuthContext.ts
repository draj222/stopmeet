import { createContext } from 'react';

interface AuthContextType {
  user: any;
  login: (userData: any, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {}
});

export default AuthContext;
