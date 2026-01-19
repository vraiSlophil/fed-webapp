import type { User } from '~/types/user';
import { HttpMethods } from '~/utils/httpMethods';
import { useAuthState } from '~/domains/auth/composables/useAuthState';

type ApiResponse<T> = {
    status?: string;
    success?: boolean;
    message?: string;
    data?: T;
};

type AuthPayload = {
    token?: string;
    user?: User;
};

export function useAuth() {
    const loading = useState<boolean>('auth-loading', () => true);
    const {
        token,
        user,
        forbidden,
        isAuthenticated,
        setToken,
        setUser,
        setForbidden,
        clearAuth,
        loadFromStorage,
    } = useAuthState();

    const fetchUser = async ({ redirectOn401 }: { redirectOn401?: string | false } = {}) => {
        loading.value = true;
        try {
            const response = await useApiFetch<ApiResponse<{ user?: User }>>('/api/user', {
                method: HttpMethods.GET,
                redirectOn401,
            });
            setUser(response.data?.user ?? null);
            return true;
        } catch (error: any) {
            setUser(null);
            console.error('Erreur lors de la récupération des données utilisateur:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const register = async (
        username: string,
        email: string,
        password: string,
        password_confirmation: string,
    ) => {
        loading.value = true;
        try {
            const response = await useApiFetch<ApiResponse<AuthPayload>>('/api/register', {
                method: HttpMethods.POST,
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    password_confirmation,
                }),
            });
            await handleResponse(response);
            return response;
        } catch (error: any) {
            console.error("Erreur lors de l'inscription:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const login = async (email: string, password: string) => {
        loading.value = true;
        try {
            const response = await useApiFetch<ApiResponse<AuthPayload>>('/api/login', {
                method: HttpMethods.POST,
                body: JSON.stringify({ email, password }),
            });
            await handleResponse(response);
            return response;
        } catch (error: any) {
            console.error('Erreur lors de la connexion:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const logout = async () => {
        loading.value = true;
        try {
            if (token.value) {
                await useApiFetch('/api/logout', {
                    method: HttpMethods.POST,
                    redirectOn401: false,
                });
            }
        } catch (error: any) {
            console.error('Erreur lors de la déconnexion:', error);
            throw error;
        } finally {
            clearAuth();
            loading.value = false;
        }
    };

    const handleResponse = async (response: ApiResponse<AuthPayload>) => {
        const isSuccess = response?.status === 'success' || response?.success === true;

        if (isSuccess && response.data) {
            if (response.data.token) {
                setToken(response.data.token);
            }
            if (response.data.user) {
                setUser(response.data.user);
            } else {
                await fetchUser();
            }
            setForbidden(false);
            return;
        }

        const errorMessage = response?.message || "Erreur lors de la réponse de l'API";
        console.error(errorMessage);
        throw new Error(errorMessage);
    };

    const initAuth = async () => {
        if (import.meta.server) return false;

        loading.value = true;
        try {
            loadFromStorage();
            if (token.value && !user.value) {
                return await fetchUser({ redirectOn401: false });
            }
            return Boolean(token.value && user.value);
        } finally {
            loading.value = false;
        }
    };

    return {
        token,
        user,
        forbidden,
        loading,
        isAuthenticated,
        setToken,
        loadFromStorage,
        register,
        login,
        logout,
        fetchUser,
        initAuth,
    };
}
