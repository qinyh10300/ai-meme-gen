import { Button, Text, View } from "@tarojs/components";
import type { ReactNode } from "react";
import { useAuth } from "../lib/auth-context";
import "./AuthGate.css";

export function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuth();

  if (auth.status === "ready" && auth.session) return children;

  return (
    <View className="auth-gate">
      <View className="auth-gate__orb">M</View>
      {auth.status === "loading" ? (
        <>
          <Text className="auth-gate__title">正在准备你的笑点池</Text>
          <View className="auth-gate__dots"><View /><View /><View /></View>
        </>
      ) : (
        <>
          <Text className="auth-gate__title">暂时没连上</Text>
          <Text className="auth-gate__message">{auth.error}</Text>
          <Button className="auth-gate__retry tap-scale" onClick={() => void auth.retry()}>
            再试一次
          </Button>
        </>
      )}
    </View>
  );
}
