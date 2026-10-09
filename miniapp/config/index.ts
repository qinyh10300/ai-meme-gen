import path from "node:path";
import { defineConfig } from "@tarojs/cli";

const isDevelopment = process.env.NODE_ENV !== "production";
const isH5Development = isDevelopment && process.env.TARO_ENV === "h5";
const configuredApiBaseUrl = process.env.TARO_APP_API_BASE_URL?.trim() || "";
const apiBaseUrl = isH5Development
  ? ""
  : configuredApiBaseUrl || (isDevelopment ? "http://localhost:3000" : "");
const authMode = process.env.TARO_APP_AUTH_MODE?.trim() || "mock";

if (authMode !== "mock" && authMode !== "wechat") {
  throw new Error("TARO_APP_AUTH_MODE 只能是 mock 或 wechat。");
}

if (!apiBaseUrl && !isH5Development) {
  throw new Error(
    "生产构建缺少 TARO_APP_API_BASE_URL。请在 miniapp/.env.production.local 中配置正式 HTTPS API 域名。"
  );
}

if (!isDevelopment && !apiBaseUrl.startsWith("https://")) {
  throw new Error("正式小程序的 TARO_APP_API_BASE_URL 必须使用 HTTPS。");
}

if (!isDevelopment && authMode !== "wechat") {
  throw new Error("正式小程序必须使用 TARO_APP_AUTH_MODE=wechat，禁止发布 mock 登录。");
}

export default defineConfig<"webpack5">({
  projectName: "memepop-miniapp",
  date: "2026-08-12",
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: "src",
  outputRoot: process.env.TARO_ENV === "h5" ? "dist-h5" : "dist",
  framework: "react",
  compiler: {
    type: "webpack5",
    prebundle: { enable: false }
  },
  cache: { enable: true },
  alias: {
    "@": path.resolve(__dirname, "../src"),
    "@shared": path.resolve(__dirname, "../../src")
  },
  env: {
    TARO_APP_API_BASE_URL: JSON.stringify(apiBaseUrl),
    TARO_APP_AUTH_MODE: JSON.stringify(authMode)
  },
  mini: {
    enableSourceMap: isDevelopment,
    compile: {
      include: [
        path.resolve(__dirname, "../../src/platform"),
        path.resolve(__dirname, "../../src/humor"),
        path.resolve(__dirname, "../../src/generation/schemas.ts")
      ]
    },
    postcss: {
      pxtransform: { enable: true },
      url: { enable: true, config: { limit: 1024 } },
      cssModules: { enable: false }
    }
  },
  h5: {
    publicPath: "/",
    staticDirectory: "static",
    compile: {
      include: [
        path.resolve(__dirname, "../../src/platform"),
        path.resolve(__dirname, "../../src/humor"),
        path.resolve(__dirname, "../../src/generation/schemas.ts")
      ]
    },
    devServer: {
      host: "127.0.0.1",
      port: 10086,
      proxy: [
        {
          context: ["/api"],
          target: "http://localhost:3000",
          changeOrigin: true
        }
      ]
    }
  }
});
