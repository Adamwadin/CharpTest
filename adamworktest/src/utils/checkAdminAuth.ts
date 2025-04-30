import { supabase } from "@/lib/supabaseClient";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// Security check for user authentication
// If user is not authenticated or not an admin, redirect to login page
// so no one just types /dashboard in the url and gets access to the dashboard

//reusable function used across the app for less code duplication

export const checkAdminAuth = async (router: AppRouterInstance) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    router.push("/login");
    return;
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentProfile?.role !== "admin") {
    router.push("/dashboard");
  }
};
