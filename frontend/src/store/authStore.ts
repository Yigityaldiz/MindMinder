import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "../types/user.types";

interface AuthBaseState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

type AuthStoreState = AuthBaseState & AuthActions;

const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setToken: (tokenValue) =>
        set((state) => ({
          token: tokenValue,
          isAuthenticated: !!tokenValue,
        })),

      setUser: (userData) => set({ user: userData }),

      login: (tokenValue, userData) => {
        console.log("Store: Login action called", { tokenValue, userData });
        set({
          token: tokenValue,
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: () => {
        console.log("Store: Logout action called");
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      setLoading: (loadingStatus) => set({ isLoading: loadingStatus }),

      setError: (errorMessage) =>
        set({ error: errorMessage, isLoading: false }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
