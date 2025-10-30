interface TokenData {
  accessToken: string;
  refreshToken: string;
}

const TOKEN_KEYS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
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
      localStorage.removeItem(TOKEN_KEYS.REFRESH);
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

  getRefreshToken(): string | null {
    return this.adapter.get(TOKEN_KEYS.REFRESH);
  }

  getTokens(): TokenData | null {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  }

  setAccessToken(token: string): void {
    this.adapter.set(TOKEN_KEYS.ACCESS, token);
  }

  setRefreshToken(token: string): void {
    this.adapter.set(TOKEN_KEYS.REFRESH, token);
  }

  setTokens(data: TokenData): void;
  setTokens(accessToken: string, refreshToken: string): void;
  setTokens(dataOrAccessToken: TokenData | string, refreshToken?: string): void {
    if (typeof dataOrAccessToken === 'string' && refreshToken) {
      this.adapter.set(TOKEN_KEYS.ACCESS, dataOrAccessToken);
      this.adapter.set(TOKEN_KEYS.REFRESH, refreshToken);
    } else if (typeof dataOrAccessToken === 'object') {
      this.adapter.set(TOKEN_KEYS.ACCESS, dataOrAccessToken.accessToken);
      this.adapter.set(TOKEN_KEYS.REFRESH, dataOrAccessToken.refreshToken);
    }
  }

  removeAccessToken(): void {
    this.adapter.remove(TOKEN_KEYS.ACCESS);
  }

  removeRefreshToken(): void {
    this.adapter.remove(TOKEN_KEYS.REFRESH);
  }

  clearTokens(): void {
    this.adapter.clear();
  }

  isAuthenticated(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }

  hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }

  hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }
}

export const tokenStorage = new TokenStorage();

export { TokenStorage, type StorageAdapter, type TokenData };