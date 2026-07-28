import { useEffect, useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiGrid,
  FiRefreshCw,
} from "react-icons/fi";

import { supabase } from "../../lib/supabase";

function Categories() {
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD CATEGORIES
  // ==========================================

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } =
        await supabase
          .from("categories")
          .select("*")
          .order("name", {
            ascending: true,
          });

      if (fetchError) {
        throw fetchError;
      }

      setCategories(data || []);
    } catch (err) {
      console.error(
        "Category fetch error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // ADD CATEGORY
  // ==========================================

  async function handleAdd(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const categoryName = name.trim();

    if (!categoryName) {
      setError("Enter a category name.");
      return;
    }

    const alreadyExists = categories.some(
      (category) =>
        category.name
          ?.trim()
          .toLowerCase() ===
        categoryName.toLowerCase()
    );

    if (alreadyExists) {
      setError(
        "This category already exists."
      );
      return;
    }

    try {
      setSaving(true);

      const { data, error: insertError } =
        await supabase
          .from("categories")
          .insert([
            {
              name: categoryName,
            },
          ])
          .select()
          .single();

      if (insertError) {
        throw insertError;
      }

      setCategories((previous) =>
        [...previous, data].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      setName("");

      setSuccess(
        "Category added successfully."
      );
    } catch (err) {
      console.error(
        "Add category error:",
        err
      );

      setError(
        err?.message ||
          "Unable to add category."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // START EDIT
  // ==========================================

  function startEdit(category) {
    setEditingId(category.id);
    setEditingName(category.name);

    setError("");
    setSuccess("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  // ==========================================
  // UPDATE CATEGORY
  // ==========================================

  async function updateCategory(id) {
    const newName =
      editingName.trim();

    if (!newName) {
      setError(
        "Category name cannot be empty."
      );
      return;
    }

    const duplicate =
      categories.some(
        (category) =>
          category.id !== id &&
          category.name
            ?.trim()
            .toLowerCase() ===
            newName.toLowerCase()
      );

    if (duplicate) {
      setError(
        "Another category already has this name."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const {
        error: updateError,
      } = await supabase
        .from("categories")
        .update({
          name: newName,
        })
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }

      setCategories((previous) =>
        previous
          .map((category) =>
            category.id === id
              ? {
                  ...category,
                  name: newName,
                }
              : category
          )
          .sort((a, b) =>
            a.name.localeCompare(b.name)
          )
      );

      cancelEdit();

      setSuccess(
        "Category updated successfully."
      );
    } catch (err) {
      console.error(
        "Update category error:",
        err
      );

      setError(
        err?.message ||
          "Unable to update category."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  async function deleteCategory(category) {
    const confirmed =
      window.confirm(
        `Delete "${category.name}"?`
      );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      // Check if products use this category.

      const {
        count,
        error: countError,
      } = await supabase
        .from("products")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq(
          "category_id",
          category.id
        );

      if (countError) {
        throw countError;
      }

      if (count > 0) {
        setError(
          `Cannot delete "${category.name}" because ${count} product${
            count === 1 ? "" : "s"
          } use this category.`
        );

        return;
      }

      const {
        error: deleteError,
      } = await supabase
        .from("categories")
        .delete()
        .eq("id", category.id);

      if (deleteError) {
        throw deleteError;
      }

      setCategories((previous) =>
        previous.filter(
          (item) =>
            item.id !== category.id
        )
      );

      setSuccess(
        "Category deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete category error:",
        err
      );

      setError(
        err?.message ||
          "Unable to delete category."
      );
    }
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">

        <div>
          <div className="flex items-center gap-3">

            <FiGrid
              size={28}
              className="text-violet-400"
            />

            <h1 className="text-3xl font-bold">
              Categories
            </h1>

          </div>

          <p className="text-slate-400 mt-2">
            Manage your product categories.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCategories}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-3 rounded-xl"
        >
          <FiRefreshCw />

          Refresh
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="mb-6 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4">
          {success}
        </div>
      )}

      {/* ADD CATEGORY */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">

        <h2 className="text-xl font-bold">
          Add Category
        </h2>

        <form
          onSubmit={handleAdd}
          className="flex flex-col sm:flex-row gap-4 mt-5"
        >

          <input
            type="text"
            placeholder="Example: Gift Hampers"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
          />

          <button
            type="submit"
            disabled={saving}
            className="bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <FiPlus />

            {saving
              ? "Adding..."
              : "Add Category"}
          </button>

        </form>

      </div>

      {/* CATEGORY LIST */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-800">

          <h2 className="text-xl font-bold">
            All Categories
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            {categories.length} categories
          </p>

        </div>

        {loading ? (

          <div className="py-16 text-center">

            <div className="w-10 h-10 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin mx-auto" />

            <p className="text-slate-400 mt-4">
              Loading categories...
            </p>

          </div>

        ) : categories.length === 0 ? (

          <div className="py-16 text-center">

            <FiGrid
              size={45}
              className="mx-auto text-slate-600"
            />

            <h3 className="text-xl font-semibold mt-4">
              No Categories
            </h3>

            <p className="text-slate-400 mt-2">
              Add your first category above.
            </p>

          </div>

        ) : (

          <div className="divide-y divide-slate-800">

            {categories.map(
              (category) => (

                <div
                  key={category.id}
                  className="flex items-center justify-between gap-5 px-6 py-5 hover:bg-slate-800/40"
                >

                  {editingId ===
                  category.id ? (

                    <input
                      type="text"
                      value={editingName}
                      autoFocus
                      onChange={(e) =>
                        setEditingName(
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter"
                        ) {
                          updateCategory(
                            category.id
                          );
                        }

                        if (
                          e.key === "Escape"
                        ) {
                          cancelEdit();
                        }
                      }}
                      className="flex-1 bg-slate-800 border border-violet-500 rounded-xl px-4 py-2 outline-none"
                    />

                  ) : (

                    <div>

                      <p className="font-semibold text-lg">
                        {category.name}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        ID: {category.id}
                      </p>

                    </div>

                  )}

                  <div className="flex items-center gap-2">

                    {editingId ===
                    category.id ? (

                      <>

                        <button
                          type="button"
                          disabled={saving}
                          onClick={() =>
                            updateCategory(
                              category.id
                            )
                          }
                          className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg text-sm"
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded-lg"
                        >
                          <FiX />
                        </button>

                      </>

                    ) : (

                      <>

                        <button
                          type="button"
                          onClick={() =>
                            startEdit(
                              category
                            )
                          }
                          className="bg-slate-800 hover:bg-yellow-500/20 text-yellow-400 p-3 rounded-xl"
                          title="Edit category"
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteCategory(
                              category
                            )
                          }
                          className="bg-slate-800 hover:bg-red-500/20 text-red-400 p-3 rounded-xl"
                          title="Delete category"
                        >
                          <FiTrash2 />
                        </button>

                      </>

                    )}

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default Categories;