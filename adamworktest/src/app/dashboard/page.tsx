"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "../types/products";

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  //security check for user authentication
  // if user is not authenticated, redirect to login page
  // so no one just types /dashboard in the url and gets access to the dashboard
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("User:", user);

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError.message);
        } else {
          setRole(profile?.role || "viewer");
        }
      }

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, title, status, price, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (productsError) {
        console.error("Error fetching products:", productsError.message);
      } else {
        setProducts(productsData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleView = (id: string) => {
    router.push(`/products/${id}`);
  };

  const handleAddProduct = () => {
    router.push("/create");
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-white bg-gray-900 min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-white flex justify-center items-center ">
              Dashboard
            </h1>
            <div className="h-10 w-full flex justify-center items-center"></div>
          </div>

          {role === "admin" && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/adminDashboard")}
                className="bg-[#14c0c7] text-white py-2 px-4 rounded-md hover:bg-[#0ea5a7] transition duration-150 flex items-center gap-2 shadow-sm"
              >
                Admin Panel
              </button>
              <button
                onClick={handleAddProduct}
                className="bg-[#14c0c7] text-white py-2 px-4 rounded-md hover:bg-[#0ea5a7] transition duration-150 flex items-center gap-2 shadow-sm"
              >
                <span className="text-lg font-bold">+</span> Add New Product
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-700 text-left text-gray-300 text-sm">
                  <th className="p-3 font-semibold">Title</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Price</th>
                  <th className="p-3 font-semibold">Created</th>
                  <th className="p-3 font-semibold">Updated</th>
                  <th className="p-3 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-700">
                    <td className="p-3 font-medium text-white">
                      {product.title}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === "active" ||
                          product.status === "published"
                            ? "bg-green-700 text-green-200"
                            : "bg-yellow-700 text-yellow-200"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="p-3 text-white font-medium">
                      Kr {product.price}
                    </td>
                    <td className="p-3 text-gray-400 text-sm">
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-gray-400 text-sm">
                      {new Date(product.updated_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleView(product.id)}
                        className="inline-flex items-center justify-center px-3 py-1 border border-gray-500 shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-gray-700 hover:bg-[#14c0c7] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#14c0c7] transition-colors duration-350"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No products found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
