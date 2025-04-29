"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUser(data.user);
      }
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="bg-gray-800 text-white relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <div className="text-xl font-bold">
          <Image
            src="/charp.png"
            alt="Logo"
            width={200}
            height={200}
            className="mx-auto mt-4"
          />
        </div>

        <button className="md:hidden focus:outline-none" onClick={toggleMenu}>
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
        </button>

        <ul className="hidden md:flex md:items-center md:space-x-6">
          {user && (
            <>
              <li>{user.email}</li>
              <li>
                <a
                  href="/dashboard"
                  className="py-2 px-4 hover:bg-gray-700 rounded"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="block py-2 px-4 hover:bg-gray-700 rounded w-full text-left cursor-pointer"
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 absolute top-full left-0 w-full shadow-md">
          <ul className="flex flex-col items-center space-y-2 py-4">
            {user && (
              <>
                <li>{user.email}</li>
                <li>
                  <a
                    href="/dashboard"
                    className="block py-2 px-4 hover:bg-gray-700 rounded"
                  >
                    Dashboard
                  </a>
                </li>
                <li className="border-t border-gray-700 w-full">
                  <button
                    onClick={handleLogout}
                    className="block py-2 px-4 hover:bg-gray-700 rounded w-full text-left"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
