"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "../types/products";
import { checkAuth } from "@/utils/checkAuth";

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"price" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    checkAuth(router);
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setRole(profile?.role || "viewer");
      }

      const { data: productsData } = await supabase
        .from("products")
        .select("id, title, status, price, created_at, updated_at");

      setProducts(productsData || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = [...products];

    if (search) {
      result = result.filter((product) =>
        product.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((product) => product.status === statusFilter);
    }

    result.sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];
      return sortOrder === "asc"
        ? valueA > valueB
          ? 1
          : -1
        : valueA < valueB
        ? 1
        : -1;
    });

    setFiltered(result);
    setCurrentPage(1);
  }, [products, search, sortKey, sortOrder, statusFilter]);

  const paginatedProducts = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const toggleSort = (key: "price" | "created_at") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen bg-login px-4 py-10 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold">Dashboard</h1>

          {role === "admin" && (
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/adminDashboard")}
                className="bg-[#14c0c7] hover:bg-[#0ea5a7] px-4 py-2 rounded text-white font-semibold"
              >
                Admin Panel
              </button>
              <button
                onClick={() => router.push("/create")}
                className="bg-[#14c0c7] hover:bg-[#0ea5a7] px-4 py-2 rounded text-white font-semibold"
              >
                + Add Product
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input
            type="text"
            placeholder="Search by title..."
            className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 w-full sm:w-1/3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>

            <button
              onClick={() => toggleSort("price")}
              className="bg-gray-700 px-4 py-2 rounded hover:bg-[#14c0c7] transition cursor-pointer"
            >
              Sort by Price{" "}
              {sortKey === "price" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => toggleSort("created_at")}
              className="bg-gray-700 px-4 py-2 rounded hover:bg-[#14c0c7] transition cursor-pointer"
            >
              Sort by Date{" "}
              {sortKey === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow overflow-hidden ">
          <div className="overflow-x-auto ">
            <table className="w-full min-w-[600px] table-auto p-3 divide-y divide-gray-700 ">
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
              <tbody className="divide-y divide-gray-700 ">
                {paginatedProducts.map((product) => (
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
                        onClick={() => router.push(`/products/${product.id}`)}
                        className="px-3 py-1 border border-gray-500 rounded-md bg-gray-700 hover:bg-[#14c0c7] text-sm font-medium transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center items-center mt-6 gap-4 p-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
              <div></div>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No matching products found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
