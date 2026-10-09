declare namespace NodeJS {
  interface ProcessEnv {
    TARO_APP_API_BASE_URL?: string;
    TARO_APP_AUTH_MODE?: "mock" | "wechat";
    TARO_APP_ID?: string;
  }
}
