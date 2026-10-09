import Taro from "@tarojs/taro";
import { Text, View } from "@tarojs/components";
import { useMemo } from "react";
import "./AppHeader.css";

export function AppHeader(props: {
  kicker: string;
  title: string;
  status: string;
}) {
  const metrics = useMemo(getNavigationMetrics, []);

  return (
    <View
      className="app-header"
      style={{
        paddingTop: `${metrics.statusBarHeight}px`,
        paddingRight: `${metrics.rightInset}px`
      }}
    >
      <View className="app-header__row" style={{ height: `${metrics.barHeight}px` }}>
        <View className="app-header__brand">
          <View className="app-header__mark">M</View>
          <View className="app-header__copy">
            <Text className="app-header__kicker">{props.kicker}</Text>
            <Text className="app-header__title">{props.title}</Text>
          </View>
        </View>
        <View className="app-header__status">
          <View className="app-header__pulse" />
          <Text>{props.status}</Text>
        </View>
      </View>
    </View>
  );
}

function getNavigationMetrics(): {
  statusBarHeight: number;
  barHeight: number;
  rightInset: number;
} {
  if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
    return { statusBarHeight: 20, barHeight: 44, rightInset: 20 };
  }

  try {
    const windowInfo = Taro.getWindowInfo();
    const capsule = Taro.getMenuButtonBoundingClientRect();
    const statusBarHeight = windowInfo.statusBarHeight ?? 20;
    const verticalGap = Math.max(4, capsule.top - statusBarHeight);
    return {
      statusBarHeight,
      barHeight: capsule.height + verticalGap * 2,
      rightInset: Math.max(20, windowInfo.windowWidth - capsule.left + 10)
    };
  } catch {
    return { statusBarHeight: 20, barHeight: 44, rightInset: 20 };
  }
}
