import Taro from "@tarojs/taro";
import { Text, View } from "@tarojs/components";
import "./BottomNav.css";

type MiniPage = "feed" | "studio";

const pageUrls: Record<MiniPage, string> = {
  feed: "/pages/feed/index",
  studio: "/pages/studio/index"
};

export function BottomNav({ active }: { active: MiniPage }) {
  const navigate = (page: MiniPage) => {
    if (page === active) return;
    void Taro.redirectTo({ url: pageUrls[page] });
  };

  return (
    <View className="bottom-nav safe-bottom">
      <View
        className={`bottom-nav__item tap-scale ${active === "feed" ? "is-active" : ""}`}
        onClick={() => navigate("feed")}
      >
        <Text className="bottom-nav__icon">刷</Text>
        <Text className="bottom-nav__label">刷梗</Text>
      </View>
      <View className="bottom-nav__divider" />
      <View
        className={`bottom-nav__item tap-scale ${active === "studio" ? "is-active" : ""}`}
        onClick={() => navigate("studio")}
      >
        <Text className="bottom-nav__icon">写</Text>
        <Text className="bottom-nav__label">我的场景</Text>
      </View>
    </View>
  );
}
