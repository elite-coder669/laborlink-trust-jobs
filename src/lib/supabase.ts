import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

export type UserRole = "laborer" | "employer" | "artisan";

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  phone?: string;
  language: string;
  trust_score: number;
  verified: boolean;
  avatar_url?: string;
  bio?: string;
  skills?: string[];
  location?: string;
  hourly_rate?: number;
  completed_jobs_count: number;
  created_at: string;
  updated_at: string;
}

export const authHelpers = {
  async signUp(email: string, password: string) {
    const redirectUrl = `${window.location.origin}/onboarding`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    // On sign up, profile will be null. This is expected.
    return { data: { user: authData.user, profile: null }, error: authError };
  },

  async signIn(email: string, password: string) {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError || !authData.user) {
      return { data: { user: null, profile: null }, error: authError };
    }

    // After sign-in, immediately fetch the profile.
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();

    return { data: { user: authData.user, profile: profileData }, error: profileError };
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  // --- DEBUGGING ADDED HERE ---
// --- DEBUGGING WITH TIMEOUT ---
async getProfile(userId: string): Promise<Profile | null> {
  console.log("DEBUG: 3a. Fetching profile for", userId);

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  console.log("DEBUG: 3b. Supabase returned", { data, error });

  if (error) {
    console.error("DEBUG: 3c. Error fetching profile:", error.message);
    return null;
  }

  if (!data) {
    console.warn("DEBUG: 3d. No profile found for user:", userId);
    return null;
  }

  console.log("DEBUG: 3e. Profile fetched successfully:", data);
  return data;
},



  // --- END DEBUGGING ---
  // --- END DEBUGGING ---

  async createProfile(profile: Omit<Profile, "created_at" | "updated_at" | "trust_score" | "verified" | "completed_jobs_count">) {
    const { data, error } = await supabase
      .from("profiles")
      .insert(profile)
      .select()
      .single();
    if (error) {
      console.error("Error creating profile:", error);
      return { data: null, error };
    }

    return { data, error: null };
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    if (error) {
      console.error("Error updating profile:", error);
      return { data: null, error };
    }

    return { data, error: null };
  },
};