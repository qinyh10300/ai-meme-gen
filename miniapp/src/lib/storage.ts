import Taro from "@tarojs/taro";

export const MOCK_SESSION_STORAGE_KEY = "memepop-mini-mock-session-v1";
export const WECHAT_SESSION_STORAGE_KEY = "memepop-mini-wechat-session-v1";

export function readStorage<T>(key: string): T | null {
  try {
    const value = Taro.getStorageSync<T>(key);
    return value === "" || value === undefined || value === null ? null : value;
  } catch {
    return null;
  }
}

export function writeStorage<T>(key: string, value: T): boolean {
  try {
    Taro.setStorageSync(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key: string): void {
  try {
    Taro.removeStorageSync(key);
  } catch {
    // Storage can be unavailable in rare low-space or privacy-restricted states.
  }
}
