declare module "@/hooks/use-auth" {
  export function useAuth(): {
    isLoading: boolean;
    isAuthenticated: boolean;
    user: any;
    signIn: any;
    signOut: any;
  };
}
