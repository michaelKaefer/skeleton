import { createContext, useContext } from 'react';

export const AuthenticationContext = createContext();

export function useAuthenticationContext() {
  return useContext(AuthenticationContext);
}
