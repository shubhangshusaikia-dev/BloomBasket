import { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiRefreshCw,
  FiShoppingBag,
} from "react-icons/fi";

import { supabase } from "../lib/supabase";
import ProductCard from "../components/ProductCard";

function Shop() {
  // ==========================================
  // STATE
  // ==========================================

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [sortBy, setSortBy] = useState("newest");

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    loadShop();
  }, []);

  async function loadShop() {
    try {
      setLoading(true);
      setError("");

      const [
        productsResult,
        categoriesResult,
      ] = await Promise.all([
        supabase
          .from("products")
          .select(
            `
            *,
            categories (
              id,
              name
            )
            `
          )
          .order("id", {
            ascending: false,
          }),

        supabase
          .from("categories")
          .select("*")
          .order("name", {
            ascending: true,
          }),
      ]);

      // ======================================
      // PRODUCT ERROR
      // ======================================

      if (productsResult.error) {
        throw productsResult.error;
      }

      // ======================================
      // CATEGORY ERROR
      // ======================================

      if (categoriesResult.error) {
        throw categoriesResult.error;
      }

      // ======================================
      // FORMAT PRODUCTS
      // ======================================

      const formattedProducts = (
        productsResult.data || []
      ).map((item) => ({
        ...item,

        price: Number(item.price || 0),

        old_price:
          item.old_price !== null &&
          item.old_price !== undefined
            ? Number(item.old_price)
            : null,

        stock: Number(item.stock || 0),

        rating: Number(item.rating || 0),

        image:
          item.image_url || "",

        category:
          item.categories?.name ||
          "Uncategorized",
      }));

      setProducts(formattedProducts);

      setCategories(
        categoriesResult.data || []
      );
    } catch (err) {
      console.error(
        "Shop loading error:",
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

  // ==========================================
  // FILTER + SEARCH + SORT
  // ==========================================

  const filteredProducts =
    useMemo(() => {
      let result = [...products];

      // CATEGORY

      if (
        selectedCategory !== "all"
      ) {
        result = result.filter(
          (product) =>
            String(
              product.category_id
            ) ===
            String(selectedCategory)
        );
      }

      // SEARCH

      const query =
        search.trim().toLowerCase();

      if (query) {
        result = result.filter(
          (product) => {
            const searchable = [
              product.name,
              product.description,
              product.category,
              product.badge,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return searchable.includes(
              query
            );
          }
        );
      }

      // SORT

      switch (sortBy) {
        case "price-low":
          result.sort(
            (a, b) =>
              Number(a.price) -
              Number(b.price)
          );
          break;

        case "price-high":
          result.sort(
            (a, b) =>
              Number(b.price) -
              Number(a.price)
          );
          break;

        case "rating":
          result.sort(
            (a, b) =>
              Number(b.rating) -
              Number(a.rating)
          );
          break;

        case "name":
          result.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          break;

        case "stock":
          result.sort(
            (a, b) =>
              Number(b.stock) -
              Number(a.stock)
          );
          break;

        case "newest":
        default:
          result.sort((a, b) => {
            // If created_at exists,
            // use it for newest sorting.

            if (
              a.created_at &&
              b.created_at
            ) {
              return (
                new Date(
                  b.created_at
                ).getTime() -
                new Date(
                  a.created_at
                ).getTime()
              );
            }

            // Otherwise use numeric ID.

            return (
              Number(b.id) -
              Number(a.id)
            );
          });

          break;
      }

      return result;
    }, [
      products,
      selectedCategory,
      search,
      sortBy,
    ]);

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  function clearFilters() {
    setSearch("");
    setSelectedCategory("all");
    setSortBy("newest");
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* ====================================
            HEADER
            ==================================== */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">

          <div>

            <h1 className="text-4xl font-bold">
              Shop
            </h1>

            <p className="text-slate-400 mt-3">
              Discover gifts, hampers,
              decorations and more.
            </p>

          </div>

          <button
            type="button"
            onClick={loadShop}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:border-violet-500 px-5 py-3 rounded-xl transition disabled:opacity-50"
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

        </div>

        {/* ====================================
            SEARCH
            ==================================== */}

        <div className="relative mt-10">

          <FiSearch
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-violet-500 transition"
          />

        </div>

        {/* ====================================
            CATEGORY BUTTONS
            ==================================== */}

        <div className="flex gap-3 overflow-x-auto mt-6 pb-2">

          <button
            type="button"
            onClick={() =>
              setSelectedCategory(
                "all"
              )
            }
            className={`whitespace-nowrap px-5 py-2.5 rounded-xl transition ${
              selectedCategory ===
              "all"
                ? "bg-violet-600 text-white"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-violet-500"
            }`}
          >
            All
          </button>

          {categories.map(
            (category) => (

              <button
                type="button"
                key={category.id}
                onClick={() =>
                  setSelectedCategory(
                    String(
                      category.id
                    )
                  )
                }
                className={`whitespace-nowrap px-5 py-2.5 rounded-xl transition ${
                  String(
                    selectedCategory
                  ) ===
                  String(
                    category.id
                  )
                    ? "bg-violet-600 text-white"
                    : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-violet-500"
                }`}
              >
                {category.name}
              </button>

            )
          )}

        </div>

        {/* ====================================
            RESULT COUNT + SORT
            ==================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">

          <p className="text-slate-400">

            {loading
              ? "Loading products..."
              : `${filteredProducts.length} product${
                  filteredProducts.length ===
                  1
                    ? ""
                    : "s"
                } found`}

          </p>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value)
            }
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
          >

            <option value="newest">
              Newest
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="rating">
              Highest Rating
            </option>

            <option value="name">
              Name A-Z
            </option>

            <option value="stock">
              Most Stock
            </option>

          </select>

        </div>

        {/* ====================================
            ERROR
            ==================================== */}

        {error && (

          <div className="mt-8 bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-xl">

            <p className="font-semibold">
              Unable to load products
            </p>

            <p className="text-sm mt-1">
              {error}
            </p>

            <button
              type="button"
              onClick={loadShop}
              className="mt-4 bg-red-500/20 hover:bg-red-500/30 px-5 py-2 rounded-lg"
            >
              Try Again
            </button>

          </div>

        )}

        {/* ====================================
            LOADING
            ==================================== */}

        {loading ? (

          <div className="py-24 text-center">

            <div className="w-12 h-12 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin mx-auto" />

            <p className="text-slate-400 mt-5">
              Loading BloomBasket
              products...
            </p>

          </div>

        ) : !error &&
          filteredProducts.length ===
            0 ? (

          /* ==================================
             EMPTY
             ================================== */

          <div className="bg-slate-900 border border-slate-800 rounded-2xl py-20 px-6 text-center mt-8">

            <FiShoppingBag
              size={55}
              className="mx-auto text-slate-600"
            />

            <h2 className="text-2xl font-bold mt-5">
              No Products Found
            </h2>

            <p className="text-slate-400 mt-2">
              Try changing your search or
              category.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold"
            >
              Clear Filters
            </button>

          </div>

        ) : !error ? (

          /* ==================================
             PRODUCTS
             ================================== */

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">

            {filteredProducts.map(
              (product) => (

                <ProductCard
                  key={product.id}
                  product={product}
                />

              )
            )}

          </div>

        ) : null}

      </div>

    </div>
  );
}

export default Shop;