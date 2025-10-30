interface TokenData {
  accessToken: string;
}

const TOKEN_KEYS = {
  ACCESS: 'accessToken',
} as const;

interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  clear(): void;
}

const localStorageAdapter: StorageAdapter = {
  get: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  set: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEYS.ACCESS);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

class TokenStorage {
  private adapter: StorageAdapter;

  constructor(adapter: StorageAdapter = localStorageAdapter) {
    this.adapter = adapter;
  }

  getAccessToken(): string | null {
    return this.adapter.get(TOKEN_KEYS.ACCESS);
  }

  setAccessToken(token: string): void {
    this.adapter.set(TOKEN_KEYS.ACCESS, token);
  }

  removeAccessToken(): void {
    this.adapter.remove(TOKEN_KEYS.ACCESS);
  }

  clearTokens(): void {
    this.adapter.clear();
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }
}

export const tokenStorage = new TokenStorage();

export { TokenStorage, type StorageAdapter, type TokenData };
