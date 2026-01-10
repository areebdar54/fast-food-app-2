// store/auth.store.ts
import { create } from "zustand";
import type { User } from "@/type";
import { getCurrentUser } from "@/lib/appwrite";

// ✅ Define exactly what exists in your store
type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;

    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;

    fetchAuthenticatedUser: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    user: null,
    isLoading: true,

    setIsAuthenticated: (value) => set({ isAuthenticated: value }),
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ isLoading: loading }),

    fetchAuthenticatedUser: async () => {
        set({ isLoading: true });

        try {
            const userDoc = await getCurrentUser();

            if (userDoc) {
                set({
                    isAuthenticated: true,
                    user: userDoc as unknown as User,
                });
            } else {
                set({
                    isAuthenticated: false,
                    user: null,
                });
            }
        } catch (e) {
            console.log("fetchAuthenticatedUser error:", e);
            set({
                isAuthenticated: false,
                user: null,
            });
        } finally {
            set({ isLoading: false });
        }
    },
}));

export default useAuthStore;
