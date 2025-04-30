"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Navbar: React.FC = () => {
  const [MenuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const toggleMenu = () => {
    setMenuOpen(!MenuOpen);
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
    <nav className="bg-gray-800/90 text-white relative z-50 sticky top-0  transition-all duration-300 ease-in-out opacity-90  shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4 backdrop-blur-xl bg-gray-800 rounded-lg">
        <button className="md:hidden focus:outline-none" onClick={toggleMenu}>
          <span
            className={`block w-8 h-0.5 bg-white transition-all duration-300 ease-in-out ${
              MenuOpen ? "-rotate-45 translate-y-0.5 w-8" : "mb-2"
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
              MenuOpen ? "rotate-45 -translate-y-0.9 w-8" : ""
            }`}
          ></span>
        </button>

        <div className="text-xl font-bold">
          <Image
            src="/charp.png"
            alt="Logo"
            width={200}
            height={200}
            className="mx-auto mt-4"
          />
        </div>

        <ul className="hidden md:flex md:items-center md:space-x-6 ">
          {user && (
            <>
              <li className="text-gray-300">{user.email}</li>

              <li>
                <a
                  href="/dashboard"
                  className=" py-2 px-4 rounded transition duration-300 ease-in-out text-white hover:text-[#14c0c7]"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="block py-2 px-4 rounded w-full text-left cursor-pointer transition duration-300 ease-in-out text-white hover:text-[#14c0c7]"
                >
                  Logout
                </button>
              </li>
              <li className="">
                <a
                  href="/bait"
                  className="inline-block py-3 px-6 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out bg-[#14c0c7] text-white hover:bg-white hover:text-[#14c0c7] shadow-none hover:shadow-[8px_8px_0_0_#14c0c7]"
                  style={{
                    transform: "skewX(-3deg)",
                  }}
                >
                  Try Me Now!
                </a>
              </li>
            </>
          )}
        </ul>
      </div>

      {MenuOpen && (
        <div
          className={` bg-gray-800 absolute top-full left-0 w-full shadow-md transition-all duration-300 ease-in-out
            overflow-hidden py-4 rounded-lg z-50`}
        >
          <ul className="flex flex-col items-center space-y-2 py-4">
            {user && (
              <>
                <li className="text-gray-300">{user.email}</li>
                <li>
                  <a
                    href="/dashboard"
                    className=" block py-5 px-4 rounded transition duration-300 ease-in-out text-white hover:text-[#14c0c7]"
                  >
                    Dashboard
                  </a>
                </li>
                <li className="">
                  <a
                    href="/bait"
                    className="m-2 inline-block py-3 px-7 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out bg-[#14c0c7] text-white hover:bg-white hover:text-[#14c0c7] shadow-none hover:shadow-[8px_8px_0_0_#14c0c7]"
                    style={{
                      transform: "skewX(-3deg)",
                    }}
                  >
                    Try Me Now!
                  </a>
                </li>

                <li className="border-t border-gray-700 w-full">
                  <button
                    onClick={handleLogout}
                    className="block py-2 px-4 rounded w-full text-left transition duration-300 ease-in-out text-white hover:text-[#14c0c7]"
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
