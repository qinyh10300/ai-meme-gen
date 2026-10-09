import type { PropsWithChildren } from "react";
import { AuthProvider } from "./lib/auth-context";
import "./app.css";

export default function App({ children }: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>;
}
