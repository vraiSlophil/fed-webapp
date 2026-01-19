import type { User } from '~/types/user';

const AUTH_TOKEN_STORAGE_KEY = 'auth-token';

export const useAuthState = () => {
    const token = useState<string | null>('auth-token', () => null);
    const user = useState<User | null>('user', () => null);
    const forbidden = useState<boolean>('auth-forbidden', () => false);
    const isAuthenticated = computed(() => Boolean(token.value));

    const setToken = (value: string | null) => {
        token.value = value;

        if (!import.meta.client) return;

        if (value) {
            localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, value);
        } else {
            localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        }
    };

    const setUser = (value: User | null) => {
        user.value = value;
    };

    const setForbidden = (value: boolean) => {
        forbidden.value = value;
    };

    const clearAuth = () => {
        setToken(null);
        user.value = null;
        forbidden.value = false;
    };

    const loadFromStorage = () => {
        if (!import.meta.client) return;

        const stored = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
        if (stored) {
            token.value = stored;
        }
    };

    return {
        token,
        user,
        forbidden,
        isAuthenticated,
        setToken,
        setUser,
        setForbidden,
        clearAuth,
        loadFromStorage,
        storageKey: AUTH_TOKEN_STORAGE_KEY,
    };
};
