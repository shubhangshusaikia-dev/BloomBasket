import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiHeart,
  FiShoppingCart,
} from "react-icons/fi";

import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");

        const { data, error: fetchError } = await supabase
          .from("products")
          .select(`
            *,
            categories(name)
          `)
          .eq("id", id)
          .single();

        if (fetchError) {
          console.error("Supabase product error:", fetchError);
          setError(fetchError.message);
          return;
        }

        if (!data) {
          setError("Product not found.");
          return;
        }

        const formattedProduct = {
          id: data.id,
          name: data.name || "Unnamed Product",

          description:
            data.description || "No description available.",

          price: Number(data.price || 0),

          oldPrice:
            data.old_price !== null &&
            data.old_price !== undefined
              ? Number(data.old_price)
              : null,

          stock: Number(data.stock || 0),

          image:
            data.image_url ||
            "https://placehold.co/700x700?text=No+Image",

          rating: Number(data.rating || 0),

          badge: data.badge || "",

          category:
            data.categories?.name || "Unknown",
        };

        setProduct(formattedProduct);
      } catch (err) {
        console.error("Product details error:", err);

        setError(
          err?.message ||
            "Something went wrong while loading the product."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  function handleAddToCart() {
    if (!product || product.stock <= 0) {
      return;
    }

    addToCart(product);
  }

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin mx-auto" />

          <p className="text-slate-400 mt-4">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <h1 className="text-4xl font-bold">
            Product Not Found
          </h1>

          <p className="text-red-400 mt-4">
            {error || "This product does not exist."}
          </p>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 mt-8 bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold transition"
          >
            <FiArrowLeft />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10">
      <div className="max-w-7xl mx-auto px-6">

        {/* Back Button */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 mb-10 transition"
        >
          <FiArrowLeft />
          Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* Product Image */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center">

            {/* Badge */}
            {product.badge && (
              <span className="w-fit bg-violet-600 text-white text-sm font-semibold px-4 py-2 rounded-full">
                {product.badge}
              </span>
            )}

            {/* Category */}
            <p className="text-violet-400 mt-5">
              {product.category}
            </p>

            {/* Product Name */}
            <h1 className="text-4xl md:text-5xl font-bold mt-2">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-5">
              <span className="text-yellow-400 text-lg">
                ⭐ {product.rating.toFixed(1)}
              </span>
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <span className="text-4xl font-bold text-violet-400">
                ₹{product.price.toFixed(2)}
              </span>

              {product.oldPrice &&
                product.oldPrice > product.price && (
                  <span className="text-xl text-slate-500 line-through">
                    ₹{product.oldPrice.toFixed(2)}
                  </span>
                )}
            </div>

            {/* Stock */}
            <div className="mt-5">
              {product.stock > 0 ? (
                <span className="text-green-400 font-medium">
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-red-400 font-medium">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-slate-400 leading-8 mt-8">
              {product.description}
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mt-10">

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed px-8 py-4 rounded-xl font-semibold transition"
              >
                <FiShoppingCart size={20} />

                {product.stock > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-3 border border-slate-700 hover:border-violet-500 px-8 py-4 rounded-xl font-semibold transition"
              >
                <FiHeart size={20} />
                Add to Wishlist
              </button>

            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-5 mt-12">

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="font-semibold">
                  🚚 Fast Delivery
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  Fast and reliable delivery for your order.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="font-semibold">
                  🔒 Secure Payment
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  Secure payment through trusted gateways.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="font-semibold">
                  ↩️ Easy Returns
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  Simple and convenient return process.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="font-semibold">
                  🎁 Premium Packaging
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  Beautiful packaging perfect for gifting.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;