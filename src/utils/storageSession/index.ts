export const storageSessionUtils = {
  getItem<T>(key: string): T | null {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  setItem<T>(key: string, value: T): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  },
};
