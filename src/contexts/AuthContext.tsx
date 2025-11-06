import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Profile, authHelpers } from "@/lib/supabase";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<any>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true); // Start loading

  const refreshProfile = async () => {
    // Manually fetch and set profile, but only if user exists
    console.log("DEBUG: refreshProfile called");
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const profileData = await authHelpers.getProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    console.log("DEBUG: 1. AuthContext useEffect RUNS. Subscribing to auth state change...");

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          console.log(`DEBUG: 2. onAuthStateChange FIRED. Event: ${event}`);
          try {
            const currentUser = session?.user ?? null;
            setSession(session);
            setUser(currentUser);

            if (currentUser) {
              console.log(`DEBUG: 3. User ${currentUser.id} exists. Fetching profile...`);

              // Fetch profile but don't let a stuck network call keep the UI loading forever.
              // We race the profile fetch against a timeout (5s). If the timeout wins,
              // we log a warning and continue — this prevents an indefinite spinner.
              const fetchWithTimeout = (ms: number) => {
                const timeout = new Promise<null>((res) => setTimeout(() => res(null), ms));
                const fetcher = authHelpers.getProfile(currentUser.id);
                return Promise.race([fetcher, timeout]) as Promise<any>;
              };

              const profileData = await fetchWithTimeout(5000);

              if (!profileData) {
                console.warn("DEBUG: 4. Profile fetch timed out or returned null. Setting profile to null.");
                setProfile(null);
              } else {
                console.log("DEBUG: 4. Profile fetched:", profileData);
                setProfile(profileData);
              }
            } else {
              console.log("DEBUG: 3. No user. Setting profile to null.");
              setProfile(null);
            }
          } catch (error) {
            console.error("DEBUG: 5. CRITICAL ERROR in onAuthStateChange:", error);
            setProfile(null);
          } finally {
            // This *always* runs, even on error, stopping the spinner
            console.log("DEBUG: 6. FINALLY block reached. Setting loading to false.");
            setLoading(false);
          }
        })();
      }
    );

    return () => {
      console.log("DEBUG: 7. AuthContext CLEANUP. Unsubscribing from auth changes.");
      subscription.unsubscribe();
    };
  }, []); // <-- EMPTY dependency array. This is correct.

  // --- SIMPLIFIED FUNCTIONS ---
  // These functions just trigger the auth event.
  // The onAuthStateChange listener above will handle all state updates.
  
  const signIn = async (email: string, password: string) => {
    return authHelpers.signIn(email, password);
  };
  
  const signUp = async (email: string, password: string) => {
    return authHelpers.signUp(email, password);
  };

  const signOut = async () => {
    return authHelpers.signOut();
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle: authHelpers.signInWithGoogle,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};