import { create } from 'zustand';
import { getCurrentUser } from '@/lib/firebaseAuth';

type User = { id?: string; $id?: string; name: string; email: string; avatar?: string } | null;

type AuthState = {
    isAuthenticated: boolean;
    user: User;
    isLoading: boolean;

    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: User) => void;
    setLoading: (loading: boolean) => void;

    fetchAuthenticatedUser: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    user: null,
    isLoading: true,

    setIsAuthenticated: (value) => set({ isAuthenticated: value }),
    setUser: (user) => set({ user }),
    setLoading: (value) => set({ isLoading: value }),

    fetchAuthenticatedUser: async () => {
        set({ isLoading: true });

        try {
            const user = await getCurrentUser();
            if (user) {
                const mappedUser = {
                    id: (user as any)?.accountId ?? (user as any)?.id ?? (user as any)?.$id,
                    $id: (user as any)?.$id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                };
                set({ isAuthenticated: true, user: mappedUser });
            } else {
                set({ isAuthenticated: false, user: null });
            }
        } catch (e) {
            set({ isAuthenticated: false, user: null })
        } finally {
            set({ isLoading: false });
        }
    }
}))

export default useAuthStore;
