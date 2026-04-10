import { useState, useEffect } from "react";
import { AuthContext } from "@/hooks/useAuth";

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function tryRefresh() {
      const REFRESH_ENDPOINT = "/auth/refresh";

      try {
        const response = await fetch(REFRESH_ENDPOINT, {
          method: "POST",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setAccessToken(data.access_token);
      } catch {
        // no hay sesión activa, no pasa nada
      } finally {
        setLoading(false);
      }
    }

    tryRefresh();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}
