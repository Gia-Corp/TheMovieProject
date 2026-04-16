import { useState, useEffect } from "react";
import { AuthContext } from "@/hooks/useAuth";
import SpinnerIcon from "@/components/SpinnerIcon/SpinnerIcon";

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function tryRefresh() {
      const REFRESH_ENDPOINT = "/auth/refresh";

      fetch(REFRESH_ENDPOINT, { method: "POST", credentials: "include" })
        .then((response) =>
          response.json().then((data) => {
            if (!response.ok) throw new Error(data.message);
            setAccessToken(data.access_token);
          }),
        )
        .finally(() => {
          setIsLoading(false);
        });
    }

    tryRefresh();
  }, []);

  if (isLoading)
    return (
      <div className="spinner-container">
        <SpinnerIcon />
      </div>
    );

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}
