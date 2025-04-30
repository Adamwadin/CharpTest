"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { UserProfile } from "../types/user";
import { checkAdminAuth } from "@/utils/checkAdminAuth";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      checkAdminAuth(router);

      const { data: allProfiles, error } = await supabase
        .from("profiles")
        .select("id, email, role");

      if (error) {
        console.error("Error fetching users:", error.message);
      } else {
        setUsers(allProfiles || []);
      }

      setLoading(false);
    };

    fetchUsers();
  }, [router]);

  const handleChangeRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      console.error("Error changing role:", error.message);
    } else {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-login bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
          <div className="w-6 h-6 border-2 border-t-transparent border-[#14c0c7] rounded-full animate-spin"></div>
          <p className="text-white font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-login bg-cover bg-center relative">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-4xl font-bold text-white">User Management</h1>

            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-sm text-sm font-medium bg-[#14c0c7] text-white">
                {users.length} Users
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full divide-y divide-gray-700">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-[#14c0c7] text-white"
                            : "bg-gray-700 text-white"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.role !== "admin" ? (
                        <button
                          onClick={() => handleChangeRole(user.id, "admin")}
                          className=" cursor-pointer inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-[#14c0c7] hover:bg-[#0ea5a7]"
                        >
                          Promote to Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleChangeRole(user.id, "viewer")}
                          className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-gray-600 text-xs font-medium rounded shadow-sm text-white bg-gray-700 hover:bg-gray-600"
                        >
                          Change to Viewer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-white">No users</h3>
              <p className="mt-1 text-sm text-gray-400">
                No users have been found in the system.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 text-right">
          <p className="text-xs text-gray-400">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
