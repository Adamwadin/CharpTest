"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";
import { Product } from "../../types/products";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [openRowId, setOpenRowId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

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

      const fetchProduct = async () => {
        const { data, error } = await supabase
          .from("products")
          .select("id, title, status, price, created_at, updated_at")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching product:", error.message);
        } else {
          setProduct(data);
        }
        setLoading(false);
      };

      fetchProduct();
    };

    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
  }, [id]);

  const fetchVersions = async () => {
    const { data, error } = await supabase
      .from("product_versions")
      .select("*")
      .eq("product_id", product?.id)
      .order("saved_at", { ascending: false });

    if (error) {
      console.error("Error fetching versions:", error.message);
    } else {
      setVersionHistory(data);
      setShowVersions(true);
    }
  };

  const deleteVersion = async (versionId: string) => {
    const { error } = await supabase

      .from("product_versions")
      .delete()
      .eq("id", versionId);

    if (error) {
      console.error("Error deleting version:", error.message);
    } else {
      toast.success("Version deleted successfully!");
      setVersionHistory((prev) =>
        prev.filter((version) => version.id !== versionId)
      );
    }
  };

  const handleSave = async () => {
    if (!product) return;

    const { data: latestProduct, error: fetchError } = await supabase
      .from("products")
      .select("updated_at, title, price, status")
      .eq("id", product.id)
      .single();

    if (fetchError) {
      console.error("Error fetching latest product:", fetchError.message);
      return;
    }
    console.log("latest:", latestProduct.updated_at);
    console.log("local :", product.updated_at);
    console.log(
      "diff   :",
      new Date(latestProduct.updated_at).getTime() !==
        new Date(product.updated_at).getTime()
    );
    if (
      new Date(latestProduct.updated_at).getTime() !==
      new Date(product.updated_at).getTime()
    ) {
      toast.error("Another admin updated this item. Please refresh.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();

    await supabase.from("product_versions").insert({
      product_id: product.id,
      title: latestProduct.title,
      price: latestProduct.price,
      status: latestProduct.status,

      saved_by_user_id: userData.user?.id,
    });

    const { error } = await supabase
      .from("products")
      .update({
        title: editTitle,
        price: parseFloat(editPrice),
        status: editStatus,
      })
      .eq("id", product.id);

    if (error) {
      console.error("Error updating product:", error.message);
    } else {
      setProduct({
        ...product,
        title: editTitle,
        price: parseFloat(editPrice),
        status: editStatus,
        updated_at: new Date().toISOString(),
      });
      setEditMode(false);
      toast.success("Product updated successfully!");
      fetchVersions();
    }
  };

  const toggleRow = (id: string) => {
    if (openRowId === id) {
      setOpenRowId(null);
    } else {
      setOpenRowId(id);
    }
  };

  const restoreVersion = async (version: any) => {
    if (!product) return;

    const { error } = await supabase
      .from("products")
      .update({
        title: version.title,
        price: version.price,
        status: version.status,
      })
      .eq("id", product.id);

    if (error) {
      console.error("Error restoring version:", error.message);
    } else {
      toast.success("Version restored successfully!");
      setProduct({
        ...product,
        title: version.title,
        price: version.price,
        status: version.status,

        updated_at: new Date().toISOString(),
      });
      setShowVersions(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-[#14c0c7] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-white">
              Loading product details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-lg shadow-md text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-400 mb-4">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#14c0c7] hover:bg-[#0ea5a7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#14c0c7]"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#14c0c7]"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <div className="bg-gray-800 shadow overflow-hidden rounded-lg">
          <div className="px-6 py-5 sm:p-8">
            <div className="flex justify-between items-start">
              <div>
                {editMode ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border rounded p-2 mt-1 bg-gray-700 text-white text-xl font-bold"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    {product.title}
                  </h1>
                )}

                {editMode ? (
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full border rounded p-2 bg-gray-700 text-white mt-1 text-sm cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                ) : (
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium  ${
                        product.status === "active" ||
                        product.status === "published"
                          ? "bg-green-700 text-green-200"
                          : "bg-yellow-700 text-yellow-200"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>
                )}
              </div>

              {editMode ? (
                <input
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full border rounded p-2 bg-gray-700 text-white mt-1 text-lg font-semibold"
                />
              ) : (
                <div className="text-2xl font-bold text-white">
                  Price: Kr {product.price}
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-white">
                Product Details
              </h3>

              <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-400">
                    Product ID
                  </dt>
                  <dd className="mt-1 text-sm text-white">{product.id}</dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-400">Created</dt>
                  <dd className="mt-1 text-sm text-white">
                    {new Date(product.created_at).toLocaleString()}
                  </dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-400">
                    Last Updated
                  </dt>
                  <dd className="mt-1 text-sm text-white">
                    {new Date(product.updated_at).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>

            {role === "admin" && !editMode && (
              <button
                onClick={() => {
                  if (showVersions) {
                    setShowVersions(false);
                  } else {
                    setEditMode(false);
                    fetchVersions();
                  }
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 mt-8 transition duration-150 ease-in-out cursor-pointer"
              >
                {showVersions ? "Hide Version History" : "View Version History"}
              </button>
            )}

            {role === "admin" && (
              <div className="mt-8 flex justify-end space-x-4">
                {!editMode ? (
                  <button
                    onClick={() => {
                      setEditMode(true);
                      setEditTitle(product.title);
                      setEditPrice(product.price.toString());
                      setEditStatus(product.status);
                    }}
                    className="px-4 py-2  border border-gray-600 shadow-sm text-sm font-medium rounded-md text-white bg-[#14c0c7] hover:bg-[#0ea5a7] cursor-pointer"
                  >
                    Edit Product
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-[#14c0c7] text-white rounded-md hover:bg-[#0ea5a7]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            )}

            {showVersions && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Version History
                </h2>
                <div className="space-y-4">
                  {versionHistory.map((version) => (
                    <div
                      key={version.id}
                      className="p-4 bg-gray-700 rounded-md shadow flex justify-between items-center"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {version.title}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Saved on {new Date(version.saved_at).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <button
                          onClick={() => deleteVersion(version.id)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-500 mr-2 cursor-pointer"
                        >
                          Delete
                        </button>

                        <button
                          onClick={() => restoreVersion(version)}
                          className="px-3 py-1 text-sm bg-[#14c0c7] text-white rounded hover:bg-[#0ea5a7] cursor-pointer"
                        >
                          Restore
                        </button>

                        <button
                          onClick={() => toggleRow(version.id)}
                          className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-500 cursor-pointer"
                        >
                          {openRowId === version.id ? "Hide" : "Show"} Details
                        </button>

                        <div
                          className={`mt-2 overflow-hidden transition-all duration-500 ease-in-out ${
                            openRowId === version.id
                              ? "max-h-screen"
                              : "max-h-0"
                          }`}
                        >
                          <p className="text-gray-400 text-sm">
                            Price: Kr {version.price}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Status: {version.status}
                          </p>

                          <p className="text-gray-400 text-sm">
                            Saved by: {version.saved_by_user_id}
                          </p>

                          <p className="text-gray-400 text-sm">
                            Saved at:{" "}
                            {new Date(version.saved_at).toLocaleString()}
                          </p>

                          <p className="text-gray-400 text-sm">
                            Version id: {version.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
