"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Mail, Lock, ArrowRight, LogOut } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  //security check for user authentication
  // if user is not authenticated, redirect to login page
  // so no one just types /dashboard in the url and gets access to the dashboard
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (!existingProfile) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: userId,
          email: email,
          role: "viewer",
        });

        if (profileError) {
          setError("Signup succeeded, but failed to assign role.");
          return;
        }
      }
    }

    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-md overflow-hidden rounded-2xl shadow-xl bg-gray-900">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-8 py-6 text-white">
          <div className="h-10 w-full flex justify-center items-center">
            <Image
              src="/charp.png"
              alt="Logo"
              width={200}
              height={200}
              className="mx-auto mt-4"
            />
          </div>
        </div>

        <div className="p-8">
          {user ? (
            <div className="space-y-6 text-center">
              <h2 className="text-2xl font-bold text-white">logged in</h2>
              <p className="text-gray-400">Welcome back, {user.email}</p>

              <button
                onClick={handleLogout}
                className="group relative w-full overflow-hidden rounded-lg bg-red-600 py-3 text-white shadow-lg transition-all duration-300 hover:bg-red-700 hover:shadow-red-200 flex items-center justify-center gap-2"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <form
              onSubmit={isSignUp ? handleSignUp : handleLogin}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-white flex items-center gap-2"
                >
                  <Mail size={16} className="text-[#14c0c7]" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 pr-10 text-white focus:border-[#14c0c7] focus:ring focus:ring-[#14c0c7] focus:ring-opacity-50"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-white flex items-center gap-2"
                >
                  <Lock size={16} className="text-[#14c0c7]" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 pr-10 text-white focus:border-[#14c0c7] focus:ring focus:ring-[#14c0c7] focus:ring-opacity-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-800 p-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="group relative w-full overflow-hidden rounded-lg bg-[#14c0c7] py-3 text-white shadow-lg transition-all duration-300 hover:bg-[#0ea5a7] hover:shadow-cyan-200"
              >
                <span className="absolute right-4 top-1/2 -translate-y-1/2 transform opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                  <ArrowRight size={20} />
                </span>
                <span className="group-hover:-translate-x-2 inline-block transition-transform duration-300">
                  {isSignUp ? "Sign Up" : "Sign In"}
                </span>
              </button>

              <p className="text-sm text-center text-gray-400 mt-4">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                  }}
                  className="text-[#14c0c7] hover:underline"
                >
                  {isSignUp ? "Sign In" : "Create Account"}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
