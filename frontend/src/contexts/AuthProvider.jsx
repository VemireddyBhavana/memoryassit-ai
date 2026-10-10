import { useEffect, useMemo, useState } from "react";
import { getCurrentUser, logIn, logOut, signUp } from "../services/api.js";
import { AuthContext } from "./authContext.js";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((result) => setUser(result.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    setUser,
    async login(credentials) {
      const result = await logIn(credentials);
      setUser(result.user);
      return result.user;
    },
    async signup(credentials) {
      const result = await signUp(credentials);
      setUser(result.user);
      return result.user;
    },
    async logout() {
      await logOut();
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
