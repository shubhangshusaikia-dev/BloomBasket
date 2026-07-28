import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiPackage,
} from "react-icons/fi";

import { supabase } from "../../lib/supabase";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // =========================================
  // FETCH PRODUCTS
  // =========================================

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } =
        await supabase
          .from("products")
          .select(`
            *,
            categories(name)
          `)
          .order("id", {
            ascending: false,
          });

      if (fetchError) {
        throw fetchError;
      }

      setProducts(data || []);
    } catch (err) {
      console.error(
        "Product fetch error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================================
  // DELETE PRODUCT
  // =========================================

  async function deleteProduct(product) {
    const confirmDelete =
      window.confirm(
        `Delete "${product.name}"?`
      );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(product.id);
      setError("");

      const { error: deleteError } =
        await supabase
          .from("products")
          .delete()
          .eq("id", product.id);

      if (deleteError) {
        throw deleteError;
      }

      setProducts((previous) =>
        previous.filter(
          (item) =>
            item.id !== product.id
        )
      );
    } catch (err) {
      console.error(
        "Delete product error:",
        err
      );

      setError(
        err?.message ||
          "Unable to delete product."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // =========================================
  // PRICE FORMAT
  // =========================================

  function formatPrice(price) {
    return `₹${Number(
      price || 0
    ).toFixed(2)}`;
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div>

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            Products
          </h1>

          <p className="text-slate-400 mt-2">
            Manage your BloomBasket
            products.
          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          {/* REFRESH */}

          <button
            type="button"
            onClick={fetchProducts}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 px-4 py-3 rounded-xl flex items-center gap-2 transition"
          >

            <FiRefreshCw
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh

          </button>

          {/* ADD PRODUCT */}

          <Link
            to="/admin/add-product"
            className="bg-violet-600 hover:bg-violet-500 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold transition"
          >

            <FiPlus />

            Add Product

          </Link>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading ? (

        <div className="bg-slate-900 border border-slate-800 rounded-2xl py-20 text-center">

          <div className="w-10 h-10 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin mx-auto" />

          <p className="text-slate-400 mt-4">
            Loading products...
          </p>

        </div>

      ) : products.length === 0 ? (

        /* EMPTY */

        <div className="bg-slate-900 border border-slate-800 rounded-2xl py-20 text-center">

          <FiPackage
            size={50}
            className="mx-auto text-violet-400"
          />

          <h2 className="text-2xl font-bold mt-5">
            No Products
          </h2>

          <p className="text-slate-400 mt-2">
            Add your first BloomBasket
            product.
          </p>

          <Link
            to="/admin/add-product"
            className="inline-flex items-center gap-2 mt-6 bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold transition"
          >
            <FiPlus />

            Add Product
          </Link>

        </div>

      ) : (

        /* PRODUCT TABLE */

        <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-2xl">

          <table className="w-full min-w-[900px]">

            <thead className="bg-slate-800">

              <tr>

                <th className="text-left p-4">
                  Image
                </th>

                <th className="text-left p-4">
                  Product
                </th>

                <th className="text-left p-4">
                  Category
                </th>

                <th className="text-left p-4">
                  Price
                </th>

                <th className="text-left p-4">
                  Stock
                </th>

                <th className="text-left p-4">
                  Rating
                </th>

                <th className="text-center p-4">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {products.map(
                (product) => (

                  <tr
                    key={product.id}
                    className="border-t border-slate-800 hover:bg-slate-800/40 transition"
                  >

                    {/* IMAGE */}

                    <td className="p-4">

                      {product.image_url ? (

                        <img
                          src={
                            product.image_url
                          }
                          alt={
                            product.name
                          }
                          className="w-16 h-16 rounded-xl object-cover bg-slate-800"
                        />

                      ) : (

                        <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center">

                          <FiPackage className="text-slate-500" />

                        </div>

                      )}

                    </td>

                    {/* PRODUCT */}

                    <td className="p-4">

                      <div className="max-w-[250px]">

                        <div className="flex items-center gap-2">

                          <p className="font-semibold truncate">
                            {product.name}
                          </p>

                          {product.badge && (
                            <span className="bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                              {
                                product.badge
                              }
                            </span>
                          )}

                        </div>

                        <p className="text-xs text-slate-500 mt-2">
                          ID: {product.id}
                        </p>

                      </div>

                    </td>

                    {/* CATEGORY */}

                    <td className="p-4 text-slate-300">

                      {product.categories
                        ?.name || "—"}

                    </td>

                    {/* PRICE */}

                    <td className="p-4">

                      <p className="text-violet-400 font-bold">
                        {formatPrice(
                          product.price
                        )}
                      </p>

                      {product.old_price && (
                        <p className="text-sm text-slate-500 line-through mt-1">
                          {formatPrice(
                            product.old_price
                          )}
                        </p>
                      )}

                    </td>

                    {/* STOCK */}

                    <td className="p-4">

                      <span
                        className={
                          Number(
                            product.stock
                          ) > 0
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {Number(
                          product.stock ||
                            0
                        ) > 0
                          ? `${
                              product.stock
                            } in stock`
                          : "Out of stock"}
                      </span>

                    </td>

                    {/* RATING */}

                    <td className="p-4">

                      <span className="text-yellow-400">
                        ★{" "}
                        {Number(
                          product.rating ||
                            0
                        ).toFixed(1)}
                      </span>

                    </td>

                    {/* ACTIONS */}

                    <td className="p-4">

                      <div className="flex justify-center items-center gap-4">

                        {/* EDIT */}

                        <Link
                          to={`/admin/edit-product/${product.id}`}
                          title="Edit Product"
                          className="w-10 h-10 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 flex items-center justify-center transition"
                        >
                          <FiEdit
                            size={19}
                          />
                        </Link>

                        {/* DELETE */}

                        <button
                          type="button"
                          title="Delete Product"
                          disabled={
                            deletingId ===
                            product.id
                          }
                          onClick={() =>
                            deleteProduct(
                              product
                            )
                          }
                          className="w-10 h-10 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition disabled:opacity-40"
                        >

                          {deletingId ===
                          product.id ? (

                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />

                          ) : (

                            <FiTrash2
                              size={19}
                            />

                          )}

                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default Products;