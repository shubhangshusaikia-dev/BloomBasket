import { Link } from "react-router-dom";
import {
  FiHeart,
  FiShoppingCart,
} from "react-icons/fi";
import { FiStar } from "react-icons/fi";

import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart();

  // ==========================================
  // PRODUCT DATA
  // ==========================================

  const price = Number(product.price || 0);

  const oldPrice =
    product.old_price !== null &&
    product.old_price !== undefined &&
    product.old_price !== ""
      ? Number(product.old_price)
      : null;

  const stock = Number(product.stock || 0);

  const rating = Number(product.rating || 0);

  const image =
    product.image ||
    product.image_url ||
    "";

  // ==========================================
  // CART QUANTITY
  // ==========================================

  const cartItem = cartItems.find(
    (item) =>
      String(item.id) ===
      String(product.id)
  );

  const quantityInCart = Number(
    cartItem?.quantity || 0
  );

  const canAddMore =
    stock > quantityInCart;

  // ==========================================
  // DISCOUNT
  // ==========================================

  const discount =
    oldPrice &&
    oldPrice > price &&
    oldPrice > 0
      ? Math.round(
          ((oldPrice - price) /
            oldPrice) *
            100
        )
      : 0;

  // ==========================================
  // ADD TO CART
  // ==========================================

  function handleAddToCart(e) {
    // Prevent Link navigation when button clicked
    e.preventDefault();
    e.stopPropagation();

    if (stock <= 0) {
      return;
    }

    if (!canAddMore) {
      alert(
        `Only ${stock} item${
          stock === 1 ? "" : "s"
        } available in stock.`
      );

      return;
    }

    addToCart({
      ...product,

      price,

      stock,

      image,
    });
  }

  return (
    <div className="group bg-slate-900 border border-slate-800 hover:border-violet-500/50 rounded-2xl overflow-hidden transition duration-300">

      {/* ======================================
          IMAGE
          ====================================== */}

      <div className="relative overflow-hidden bg-slate-800 aspect-square">

        <Link
          to={`/product/${product.id}`}
          className="block w-full h-full"
        >

          {image ? (

            <img
              src={image}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />

          ) : (

            <div className="w-full h-full flex items-center justify-center text-slate-500">
              No Image
            </div>

          )}

        </Link>

        {/* BADGE */}

        {product.badge && (

          <span className="absolute top-3 left-3 bg-violet-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            {product.badge}
          </span>

        )}

        {/* DISCOUNT */}

        {discount > 0 && (

          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            -{discount}%
          </span>

        )}

        {/* OUT OF STOCK OVERLAY */}

        {stock <= 0 && (

          <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center pointer-events-none">

            <span className="bg-red-500 text-white font-semibold px-4 py-2 rounded-xl">
              Out of Stock
            </span>

          </div>

        )}

      </div>

      {/* ======================================
          PRODUCT INFO
          ====================================== */}

      <div className="p-5">

        {/* CATEGORY + WISHLIST */}

        <div className="flex items-center justify-between gap-3">

          <p className="text-xs uppercase tracking-wider text-violet-400 font-semibold truncate">
            {product.category ||
              product.categories?.name ||
              "BloomBasket"}
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              // Wishlist functionality can
              // be connected later.
            }}
            className="text-slate-500 hover:text-red-400 transition"
            title="Add to wishlist"
          >
            <FiHeart size={19} />
          </button>

        </div>

        {/* NAME */}

        <Link
          to={`/product/${product.id}`}
        >

          <h2 className="text-lg font-semibold mt-3 line-clamp-2 min-h-[56px] hover:text-violet-400 transition">
            {product.name}
          </h2>

        </Link>

        {/* RATING */}

        <div className="flex items-center gap-2 mt-3">

          <FiStar className="text-yellow-400 fill-yellow-400" />

          <span className="text-sm font-medium">
            {rating > 0
              ? rating.toFixed(1)
              : "New"}
          </span>

        </div>

        {/* PRICE */}

        <div className="flex items-center flex-wrap gap-3 mt-4">

          <span className="text-xl font-bold text-white">
            ₹{price.toFixed(2)}
          </span>

          {oldPrice &&
            oldPrice > price && (

              <span className="text-sm text-slate-500 line-through">
                ₹{oldPrice.toFixed(2)}
              </span>

            )}

        </div>

        {/* STOCK */}

        <div className="mt-3">

          {stock <= 0 ? (

            <p className="text-sm font-medium text-red-400">
              Out of Stock
            </p>

          ) : stock <= 5 ? (

            <p className="text-sm font-medium text-yellow-400">
              Only {stock} left in stock
            </p>

          ) : (

            <p className="text-sm text-green-400">
              In Stock
            </p>

          )}

        </div>

        {/* ====================================
            ADD TO CART
            ==================================== */}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={
            stock <= 0 ||
            !canAddMore
          }
          className={`w-full mt-5 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition ${
            stock <= 0 ||
            !canAddMore
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-violet-600 hover:bg-violet-500 text-white"
          }`}
        >

          <FiShoppingCart size={19} />

          {stock <= 0
            ? "Out of Stock"
            : !canAddMore
              ? "Maximum in Cart"
              : quantityInCart > 0
                ? "Add Another"
                : "Add to Cart"}

        </button>

        {/* CART STATUS */}

        {quantityInCart > 0 && (

          <p className="text-xs text-center text-slate-400 mt-3">

            {quantityInCart} in your cart

            {stock > 0 && (
              <>
                {" "}
                • {stock} available
              </>
            )}

          </p>

        )}

      </div>

    </div>
  );
}

export default ProductCard;