"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Mail, Lock, ArrowRight, LogOut } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
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
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white px-4">
        <div className="flex items-center space-x-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-login px-4 py-6 sm:px-6">
      <div className="flex rounded-xl border-radius items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-6 sm:px-6">
        <div className="w-full max-w-md overflow-hidden rounded shadow-xl bg-gray-900">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 sm:px-8 py-4 sm:py-6 text-white">
            <div className="h-8 sm:h-10 w-full flex justify-center items-center">
              <Image
                src="/charp.png"
                alt="Logo"
                width={160}
                height={160}
                className="mx-auto sm:mt-4"
              />
            </div>
          </div>

          <div className="p-4 sm:p-8">
            {user ? (
              <div className="space-y-4 sm:space-y-6 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Logged In
                </h2>
                <p className="text-sm sm:text-base text-gray-400">
                  Welcome back, {user.email}
                </p>

                <button
                  onClick={handleLogout}
                  className=" py-3 px-6 w-full cursor-pointer rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out bg-[#14c0c7] text-white hover:bg-white hover:text-[#14c0c7] shadow-none hover:shadow-[8px_8px_0_0_#14c0c7]"
                >
                  <span className="inline-block transition-transform duration-300 text-sm sm:text-base">
                    Logout
                  </span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={isSignUp ? handleSignUp : handleLogin}
                className="space-y-4 sm:space-y-6"
              >
                <div className="space-y-1 sm:space-y-2">
                  <label
                    htmlFor="email"
                    className="text-xs sm:text-sm font-medium text-white flex items-center gap-2"
                  >
                    <Mail size={14} className="text-[#14c0c7]" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-600 bg-gray-800 p-2 sm:p-3 pr-10 text-white text-sm focus:border-[#14c0c7] focus:ring focus:ring-[#14c0c7] focus:ring-opacity-50"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <label
                    htmlFor="password"
                    className="text-xs sm:text-sm font-medium text-white flex items-center gap-2"
                  >
                    <Lock size={14} className="text-[#14c0c7]" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-600 bg-gray-800 p-2 sm:p-3 pr-10 text-white text-sm focus:border-[#14c0c7] focus:ring focus:ring-[#14c0c7] focus:ring-opacity-50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-red-800 p-2 sm:p-3">
                    <p className="text-xs sm:text-sm text-red-300">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className=" py-3 px-6 w-full rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 ease-in-out bg-[#14c0c7] text-white hover:bg-white hover:text-[#14c0c7] shadow-none hover:shadow-[8px_8px_0_0_#14c0c7]"
                >
                  <span className="inline-block transition-transform duration-300 text-sm sm:text-base">
                    {isSignUp ? "Sign Up" : "Login"}
                  </span>
                </button>

                <p className="text-xs sm:text-sm text-center text-gray-400 mt-3 sm:mt-4">
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
    </div>
  );
}
