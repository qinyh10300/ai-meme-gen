import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { initializeAuth, type AuthSession } from "./auth";

interface AuthContextValue {
  status: "loading" | "ready" | "error";
  session: AuthSession | null;
  error: string | null;
  retry(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async (force = false) => {
    setStatus("loading");
    setError(null);
    try {
      setSession(await initializeAuth(force));
      setStatus("ready");
    } catch (authError) {
      setSession(null);
      setError(authError instanceof Error ? authError.message : "登录失败，请稍后重试。");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void start();
  }, [start]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, session, error, retry: () => start(true) }),
    [error, session, start, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
