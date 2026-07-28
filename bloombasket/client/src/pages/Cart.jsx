import { Link, useNavigate } from "react-router-dom";
import {
  FiMinus,
  FiPlus,
  FiTrash2,
  FiArrowLeft,
} from "react-icons/fi";
import { useCart } from "../context/CartContext";

function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  // Subtotal
  const subtotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  // Shipping charge
  const shipping = cartItems.length > 0 ? 99 : 0;

  // Tax
  const tax = subtotal * 0.05;

  // Final total
  const total = subtotal + shipping + tax;

  // Total number of products including quantity
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  function handleCheckout() {
    navigate("/checkout");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">
          <div>
            <h1 className="text-4xl font-bold">
              Shopping Cart
            </h1>

            <p className="text-slate-400 mt-2">
              {totalItems} Item{totalItems !== 1 ? "s" : ""} in your cart
            </p>
          </div>

          <Link
            to="/shop"
            className="flex items-center gap-2 text-violet-400 hover:text-violet-300"
          >
            <FiArrowLeft />
            Continue Shopping
          </Link>
        </div>

        {/* Empty Cart */}
        {cartItems.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl py-20 px-6 text-center">

            <h2 className="text-3xl font-bold">
              Your Cart is Empty
            </h2>

            <p className="text-slate-400 mt-4">
              Looks like you haven't added anything yet.
            </p>

            <Link
              to="/shop"
              className="inline-block mt-8 bg-violet-600 hover:bg-violet-500 px-8 py-4 rounded-xl font-semibold transition"
            >
              Start Shopping
            </Link>

          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">

            {/* Cart Products */}
            <div className="lg:col-span-2 space-y-6">

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row gap-5"
                >

                  {/* Product Image */}
                  <Link to={`/product/${item.id}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full md:w-40 h-40 object-cover rounded-xl"
                    />
                  </Link>

                  {/* Product Information */}
                  <div className="flex-1">

                    <Link to={`/product/${item.id}`}>
                      <h2 className="text-2xl font-semibold hover:text-violet-400 transition">
                        {item.name}
                      </h2>
                    </Link>

                    <p className="text-slate-400 mt-2">
                      {item.category}
                    </p>

                    {/* Price */}
                    <div className="flex items-center gap-4 mt-4">

                      <span className="text-2xl font-bold text-violet-400">
                        ₹{Number(item.price).toFixed(2)}
                      </span>

                      {item.oldPrice && (
                        <span className="text-slate-500 line-through">
                          ₹{Number(item.oldPrice).toFixed(2)}
                        </span>
                      )}

                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-3 mt-6">

                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                        className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <FiMinus />
                      </button>

                      <span className="text-xl font-semibold w-8 text-center">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                        className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <FiPlus />
                      </button>

                    </div>

                  </div>

                  {/* Item Total + Delete */}
                  <div className="flex md:flex-col justify-between items-end">

                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                      className="text-red-500 hover:text-red-400 transition"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <FiTrash2 size={24} />
                    </button>

                    <div className="md:mt-auto">
                      <p className="text-sm text-slate-400">
                        Item Total
                      </p>

                      <p className="text-xl font-bold text-white mt-1">
                        ₹
                        {(
                          Number(item.price) *
                          item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>

                  </div>

                </div>
              ))}

            </div>

            {/* Order Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit lg:sticky lg:top-24">

              <h2 className="text-2xl font-bold mb-8">
                Order Summary
              </h2>

              <div className="space-y-5">

                {/* Subtotal */}
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Subtotal
                  </span>

                  <span>
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Shipping
                  </span>

                  <span>
                    ₹{shipping.toFixed(2)}
                  </span>
                </div>

                {/* Tax */}
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Tax (5%)
                  </span>

                  <span>
                    ₹{tax.toFixed(2)}
                  </span>
                </div>

                <hr className="border-slate-700" />

                {/* Total */}
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total</span>

                  <span className="text-violet-400">
                    ₹{total.toFixed(2)}
                  </span>
                </div>

              </div>

              {/* Checkout */}
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full mt-8 bg-violet-600 hover:bg-violet-500 py-4 rounded-xl font-semibold transition"
              >
                Proceed to Checkout
              </button>

              {/* Clear Cart */}
              <button
                type="button"
                onClick={clearCart}
                className="w-full mt-4 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white py-4 rounded-xl font-semibold transition"
              >
                Clear Cart
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Cart;