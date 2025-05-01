"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";
import { Product } from "../../types/products";
import { checkAuth } from "@/utils/checkAuth";

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
  const [lockedBy, setLockedBy] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth(router);
  }, [router]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
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

      fetchProduct();
    };

    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, title, status, price, created_at, updated_at, locked_by")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching product:", error.message);
    } else {
      setProduct(data);
      setLockedBy(data.locked_by);
    }
    setLoading(false);
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

  //reasearched on how to build a locking mechanism better then the one i had before since i had some time over :)
  //i completly redid the locking mechanism from my first time (can check other commmits)
  //and if you try to edit it while someone else is editing it will show a message with the email of the person who is editing it
  //this works way better then last time and i am happy with it, also added so if a user tries to refresh the page it will release the lock ( even if someone jsut closes the tab)

  //also checks iff the supabase locked_by uuid is the same as the locked_by uuid and if not it will show a message that someone else is editing it

  //pretty proud of this one, i think it works really well and is a good solution for the problem

  const attemptLock = async () => {
    if (!product || !currentUserId) return false;

    const { data, error } = await supabase
      .from("products")
      .update({ locked_by: currentUserId })
      .eq("id", product.id)
      .is("locked_by", null)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      const { data: lockInfo } = await supabase
        .from("products")
        .select("locked_by")
        .eq("id", product.id)
        .single();

      if (lockInfo?.locked_by && lockInfo.locked_by !== currentUserId) {
        const { data: editorProfile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", lockInfo.locked_by)
          .single();

        const editorName = editorProfile?.email;
        toast(
          `${editorName} is currently editing this product. Run to their desk and tell them to hurry up! :)`,
          {
            icon: "⚠️",
          }
        );
      }
      return false;
    }

    setLockedBy(currentUserId);
    return true;
  };
  const releaseLock = async () => {
    if (!product || !currentUserId) return;

    await supabase
      .from("products")
      .update({ locked_by: null })
      .eq("id", product.id)
      .eq("locked_by", currentUserId);

    setLockedBy(null);
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

    if (
      new Date(latestProduct.updated_at).getTime() !==
      new Date(product.updated_at).getTime()
    ) {
      toast.error("Another admin updated this item.");
      toast.error("Products is now up to date, please try again.");
      setEditMode(false);
      fetchProduct();
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
      toast.success("Product updated successfully!");
      fetchVersions();
    }
    setEditMode(false);
    releaseLock();
  };

  const startEditing = async () => {
    const success = await attemptLock();
    if (success) {
      setEditMode(true);
      setEditTitle(product?.title || "");
      setEditPrice(product?.price?.toString() || "");
      setEditStatus(product?.status || "");
    }
  };

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

  useEffect(() => {
    return () => {
      if (editMode) {
        releaseLock();
      }
    };
  }, [editMode]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (editMode) releaseLock();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (editMode) releaseLock();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [editMode]);

  return (
    <div className="min-h-screen bg-gray-900 py-4 sm:py-8 bg-login">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#14c0c7]"
          >
            <svg
              className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4"
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
          <div className="px-4 py-4 sm:px-6 sm:py-5 md:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 sm:gap-8">
              <div className="w-full sm:w-auto">
                {editMode ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className=" transition-colors duration-300  hover:border-[#14c0c7] w-full border border-gray-600 rounded-lg p-3 mt-1 bg-gray-700 text-white text-lg sm:text-xl font-bold focus:outline-none focus:ring-1 focus:ring-[#14c0c7] transition duration-300 "
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                    {product?.title || "Loading..."}
                  </h1>
                )}

                {editMode ? (
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="transition-colors duration-300  hover:border-[#14c0c7] w-full border border-gray-600 rounded-lg p-3 bg-gray-700 text-white mt-2 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#14c0c7] transition duration-300"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                ) : (
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        product?.status === "active" ||
                        product?.status === "published"
                          ? "bg-green-700 text-green-200"
                          : "bg-yellow-700 text-yellow-200"
                      }`}
                    >
                      {product?.status}
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
                  className="transition-colors duration-300  hover:border-[#14c0c7] w-full sm:w-48 border border-gray-600 rounded-lg p-3 bg-gray-700 text-white text-lg font-semibold focus:outline-none focus:ring-1 focus:ring-[#14c0c7] transition duration-300"
                />
              ) : (
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  Price: Kr {product?.price}
                </div>
              )}
            </div>

            <div className="mt-6 sm:mt-8 border-t border-gray-700 pt-4 sm:pt-6">
              <h3 className="text-base sm:text-lg font-medium text-white">
                Product Details
              </h3>

              <dl className="mt-3 sm:mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-400">
                    Product ID
                  </dt>
                  <dd className="mt-1 text-sm text-white">
                    {product?.id || "N/A"}
                  </dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-400">Created</dt>
                  <dd className="mt-1 text-sm text-white">
                    {product?.created_at
                      ? new Date(product.created_at).toLocaleString()
                      : "N/A"}
                  </dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-400">
                    Last Updated
                  </dt>
                  <dd className="mt-1 text-sm text-white">
                    {product?.updated_at
                      ? new Date(product.updated_at).toLocaleString()
                      : "N/A"}
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
                className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 mt-6 sm:mt-8 transition duration-150 ease-in-out cursor-pointer text-sm sm:text-base"
              >
                {showVersions ? "Hide Version History" : "View Version History"}
              </button>
            )}

            {role === "admin" && (
              <div className="mt-6 sm:mt-8 flex justify-end space-x-3 sm:space-x-4">
                {!editMode ? (
                  <button
                    onClick={startEditing}
                    className="px-3 py-1 bg-[#14c0c7] text-white rounded -md hover:bg-[#0ea5a7] cursor-pointer text-sm sm:text-base "
                  >
                    Edit Product
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-3 py-1 sm:px-4 sm:py-2 bg-[#14c0c7] text-white rounded-md hover:bg-[#0ea5a7] cursor-pointer text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            )}

            {showVersions && (
              <div className="mt-6 sm:mt-8">
                <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                  Version History
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {versionHistory.map((version) => (
                    <div
                      key={version.id}
                      className="p-3 sm:p-4 bg-gray-700 rounded-md shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                        <div>
                          <p className="text-white font-medium text-sm sm:text-base">
                            {version.title}
                          </p>
                          <p className="text-gray-400 text-xs sm:text-sm">
                            Saved on{" "}
                            {new Date(version.saved_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                          <button
                            onClick={() => deleteVersion(version.id)}
                            className="px-2 py-1 text-xs sm:text-sm bg-red-600 text-white rounded hover:bg-red-500 cursor-pointer"
                          >
                            Delete
                          </button>

                          <button
                            onClick={() => restoreVersion(version)}
                            className="px-2 py-1 text-xs sm:text-sm bg-[#14c0c7] text-white rounded hover:bg-[#0ea5a7] cursor-pointer"
                          >
                            Restore
                          </button>

                          <button
                            onClick={() => toggleRow(version.id)}
                            className="px-2 py-1 text-xs sm:text-sm bg-gray-600 text-white rounded hover:bg-gray-500 cursor-pointer"
                          >
                            {openRowId === version.id ? "Hide" : "Show"} Details
                          </button>
                        </div>
                      </div>

                      <div
                        className={`mt-2 overflow-hidden transition-all duration-500 ease-in-out ${
                          openRowId === version.id ? "max-h-screen" : "max-h-0"
                        }`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs sm:text-sm mt-2">
                          <p className="text-gray-400">
                            Price: Kr {version.price}
                          </p>
                          <p className="text-gray-400">
                            Status: {version.status}
                          </p>
                          <p className="text-gray-400">
                            Saved by: {version.saved_by_user_id}
                          </p>
                          <p className="text-gray-400">
                            Saved at:{" "}
                            {new Date(version.saved_at).toLocaleString()}
                          </p>
                          <p className="text-gray-400 sm:col-span-2">
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
