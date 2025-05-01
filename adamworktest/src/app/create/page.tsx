"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { checkAuth } from "@/utils/checkAuth";

export default function CreateProductPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("draft");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth(router);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: insertError } = await supabase
      .from("products")
      .insert([
        {
          title,
          price: parseFloat(price),
          status,
        },
      ]);

    setLoading(false);

    if (insertError) {
      console.error("Error inserting product:", insertError.message);
      setError("Failed to create product.");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen bg-login items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-lg">
        <div className="border border-gray-700 bg-gray-800 rounded-lg shadow-sm">
          <div className="border-b border-gray-700 px-4 sm:px-8 py-6 sm:py-8">
            <h1 className="text-2xl font-semibold text-white">
              Create New Product
            </h1>
          </div>

          <div className="px-4 sm:px-8 py-6 sm:py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-white">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="transition-colors duration-300  hover:border-[#14c0c7] w-full rounded-md border border-gray-600 bg-gray-700 px-4 py-2 shadow-sm text-white focus:border-[#14c0c7] focus:outline-none focus:ring-1 focus:ring-[#14c0c7]"
                  placeholder="Enter product title"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-white">
                  Price (Kr)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-400 sm:text-sm">Kr</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="transition-colors duration-300  hover:border-[#14c0c7] w-full rounded-md border border-gray-600 bg-gray-700 pl-7 pr-4 py-2 text-white focus:border-[#14c0c7] focus:outline-none focus:ring-1 focus:ring-[#14c0c7]"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-white">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="transition-colors duration-300  hover:border-[#14c0c7] w-full rounded-md border border-gray-600 bg-gray-700 px-4 py-2 shadow-sm text-white focus:border-[#14c0c7] focus:outline-none focus:ring-1 focus:ring-[#14c0c7]"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {error && (
                <div className="rounded-md bg-red-800 p-4">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[#14c0c7] focus:ring-offset-2"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-[#14c0c7] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#0ea5a7] focus:outline-none focus:ring-2 focus:ring-[#14c0c7] focus:ring-offset-2 disabled:bg-[#0ea5a7]"
                >
                  {loading ? "Creating..." : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
