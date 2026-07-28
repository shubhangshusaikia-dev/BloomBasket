import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiMapPin,
  FiCreditCard,
  FiShoppingBag,
} from "react-icons/fi";

import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import { auth } from "../firebase/firebase";

function Checkout() {
  const navigate = useNavigate();

  const { cartItems, clearCart } = useCart();

  // ==========================================
  // STATE
  // ==========================================

  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [settings, setSettings] = useState({
    shipping_charge: 99,
    free_shipping_above: 999,
    tax_rate: 5,
    cod_enabled: true,
    store_enabled: true,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: auth.currentUser?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "Assam",
    pincode: "",
    paymentMethod: "cod",
  });

  // ==========================================
  // LOAD STORE SETTINGS
  // ==========================================

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setSettingsLoading(true);
      setError("");

      const {
        data,
        error: settingsError,
      } = await supabase
        .from("store_settings")
        .select(
          `
          shipping_charge,
          free_shipping_above,
          tax_rate,
          cod_enabled,
          store_enabled
          `
        )
        .order("id", {
          ascending: true,
        })
        .limit(1)
        .maybeSingle();

      if (settingsError) {
        throw settingsError;
      }

      if (!data) {
        throw new Error(
          "Store settings are unavailable."
        );
      }

      setSettings({
        shipping_charge: Number(
          data.shipping_charge ?? 99
        ),

        free_shipping_above: Number(
          data.free_shipping_above ?? 999
        ),

        tax_rate: Number(
          data.tax_rate ?? 5
        ),

        cod_enabled:
          data.cod_enabled ?? true,

        store_enabled:
          data.store_enabled ?? true,
      });
    } catch (err) {
      console.error(
        "Store settings error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load checkout settings."
      );
    } finally {
      setSettingsLoading(false);
    }
  }

  // ==========================================
  // KEEP FIREBASE EMAIL
  // ==========================================

  useEffect(() => {
    const email =
      auth.currentUser?.email;

    if (!email) {
      return;
    }

    setFormData((previous) => ({
      ...previous,

      email:
        previous.email ||
        email,
    }));
  }, []);

  // ==========================================
  // DISPLAY TOTALS
  //
  // These are for the UI only.
  // The database recalculates the real totals.
  // ==========================================

  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const shipping =
    cartItems.length === 0
      ? 0
      : settings.free_shipping_above > 0 &&
          subtotal >=
            settings.free_shipping_above
        ? 0
        : Number(
            settings.shipping_charge || 0
          );

  const tax =
    subtotal *
    (Number(settings.tax_rate || 0) /
      100);

  const total =
    subtotal +
    shipping +
    tax;

  // ==========================================
  // FORM CHANGE
  // ==========================================

  function handleChange(e) {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  // ==========================================
  // VALIDATE FORM
  // ==========================================

  function validateForm() {
    if (!auth.currentUser) {
      return "You must be logged in before placing an order.";
    }

    if (cartItems.length === 0) {
      return "Your cart is empty.";
    }

    if (!settings.store_enabled) {
      return "BloomBasket is currently not accepting orders.";
    }

    if (!formData.name.trim()) {
      return "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (
      !/^[0-9]{10}$/.test(
        formData.phone.trim()
      )
    ) {
      return "Enter a valid 10-digit phone number.";
    }

    if (!formData.address.trim()) {
      return "Please enter your address.";
    }

    if (!formData.city.trim()) {
      return "Please enter your city.";
    }

    if (!formData.state.trim()) {
      return "Please enter your state.";
    }

    if (
      !/^[0-9]{6}$/.test(
        formData.pincode.trim()
      )
    ) {
      return "Enter a valid 6-digit PIN code.";
    }

    if (
      formData.paymentMethod ===
        "cod" &&
      !settings.cod_enabled
    ) {
      return "Cash on Delivery is currently unavailable.";
    }

    return "";
  }

  // ==========================================
  // PLACE ORDER
  // ==========================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (settingsLoading) {
      setError(
        "Checkout is still loading. Please wait."
      );

      return;
    }

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      // ======================================
      // BUILD RPC ITEMS
      //
      // Only send ID + quantity.
      //
      // Do NOT send price/name as trusted
      // values. PostgreSQL reads them directly
      // from products.
      // ======================================

      const items = cartItems.map(
        (item) => ({
          product_id:
            Number(item.id),

          quantity:
            Number(item.quantity),
        })
      );

      // ======================================
      // ATOMIC ORDER
      // ======================================

      const {
        data: orderId,
        error: orderError,
      } = await supabase.rpc(
        "place_order",
        {
          p_user_id:
            auth.currentUser.uid,

          p_customer_name:
            formData.name.trim(),

          p_email:
            formData.email.trim(),

          p_phone:
            formData.phone.trim(),

          p_address:
            formData.address.trim(),

          p_city:
            formData.city.trim(),

          p_state:
            formData.state.trim(),

          p_pincode:
            formData.pincode.trim(),

          p_payment_method:
            formData.paymentMethod,

          p_items:
            items,
        }
      );

      if (orderError) {
        throw orderError;
      }

      if (!orderId) {
        throw new Error(
          "Order was not created."
        );
      }

      // ======================================
      // SUCCESS
      // ======================================

      clearCart();

      navigate("/orders", {
        state: {
          orderPlaced: true,
          orderId,
        },
      });
    } catch (err) {
      console.error(
        "Place order error:",
        err
      );

      let message =
        err?.message ||
        "Unable to place your order.";

      // PostgreSQL/Supabase errors sometimes
      // include "P0001" for RAISE EXCEPTION.
      // err.message contains our useful text.

      if (
        message.toLowerCase().includes(
          "out of stock"
        )
      ) {
        message =
          "One of your products is out of stock. Please update your cart.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // EMPTY CART
  // ==========================================

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">

        <div className="text-center">

          <FiShoppingBag
            size={60}
            className="mx-auto text-violet-400"
          />

          <h1 className="text-3xl font-bold mt-6">
            Your Cart is Empty
          </h1>

          <p className="text-slate-400 mt-3">
            Add some products before
            checking out.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/shop")
            }
            className="mt-8 bg-violet-600 hover:bg-violet-500 px-8 py-3 rounded-xl font-semibold transition"
          >
            Go to Shop
          </button>

        </div>

      </div>
    );
  }

  // ==========================================
  // CHECKOUT
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10">

      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}

        <h1 className="text-4xl font-bold">
          Checkout
        </h1>

        <p className="text-slate-400 mt-2 mb-10">
          Complete your BloomBasket order.
        </p>

        {/* STORE DISABLED */}

        {!settingsLoading &&
          !settings.store_enabled && (

            <div className="mb-8 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-5 rounded-xl">

              <p className="font-semibold">
                Store Temporarily Unavailable
              </p>

              <p className="text-sm mt-1">
                BloomBasket is currently
                not accepting new orders.
              </p>

            </div>

          )}

        {/* ERROR */}

        {error && (

          <div className="mb-8 bg-red-500/10 border border-red-500/40 text-red-400 p-4 rounded-xl">

            {error}

          </div>

        )}

        <form
          onSubmit={handleSubmit}
          className="grid lg:grid-cols-3 gap-10"
        >

          {/* ==================================
              LEFT
              ================================== */}

          <div className="lg:col-span-2 space-y-8">

            {/* ==================================
                SHIPPING ADDRESS
                ================================== */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <div className="flex items-center gap-3 mb-6">

                <FiMapPin
                  size={24}
                  className="text-violet-400"
                />

                <h2 className="text-2xl font-bold">
                  Shipping Address
                </h2>

              </div>

              <div className="grid md:grid-cols-2 gap-5">

                {/* NAME */}

                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                />

                {/* PHONE */}

                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  inputMode="numeric"
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                />

                {/* EMAIL */}

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                />

                {/* ADDRESS */}

                <textarea
                  name="address"
                  placeholder="House No., Street, Locality"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                />

                {/* CITY */}

                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                />

                {/* STATE */}

                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                />

                {/* PINCODE */}

                <input
                  type="text"
                  name="pincode"
                  placeholder="6-digit PIN Code"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  maxLength={6}
                  inputMode="numeric"
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                />

              </div>

            </div>

            {/* ==================================
                PAYMENT
                ================================== */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <div className="flex items-center gap-3 mb-6">

                <FiCreditCard
                  size={24}
                  className="text-violet-400"
                />

                <h2 className="text-2xl font-bold">
                  Payment Method
                </h2>

              </div>

              {settingsLoading ? (

                <p className="text-slate-400">
                  Loading payment methods...
                </p>

              ) : settings.cod_enabled ? (

                <label className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-xl p-5 cursor-pointer">

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={
                      formData.paymentMethod ===
                      "cod"
                    }
                    onChange={handleChange}
                    className="accent-violet-600"
                  />

                  <div>

                    <p className="font-semibold">
                      Cash on Delivery
                    </p>

                    <p className="text-sm text-slate-400 mt-1">
                      Pay when your order
                      arrives.
                    </p>

                  </div>

                </label>

              ) : (

                <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-4 rounded-xl">

                  Cash on Delivery is
                  currently unavailable.

                </div>

              )}

            </div>

          </div>

          {/* ==================================
              ORDER SUMMARY
              ================================== */}

          <div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:sticky lg:top-24">

              <h2 className="text-2xl font-bold">
                Order Summary
              </h2>

              {/* PRODUCTS */}

              <div className="space-y-5 mt-6 max-h-80 overflow-y-auto">

                {cartItems.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="flex gap-4"
                    >

                      {(
                        item.image ||
                        item.image_url
                      ) ? (

                        <img
                          src={
                            item.image ||
                            item.image_url
                          }
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />

                      ) : (

                        <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-500">
                          No Image
                        </div>

                      )}

                      <div className="flex-1 min-w-0">

                        <p className="font-medium truncate">
                          {item.name}
                        </p>

                        <p className="text-sm text-slate-400 mt-1">
                          Qty:{" "}
                          {item.quantity}
                        </p>

                      </div>

                      <p className="font-semibold">

                        ₹
                        {(
                          Number(
                            item.price
                          ) *
                          Number(
                            item.quantity
                          )
                        ).toFixed(2)}

                      </p>

                    </div>

                  )
                )}

              </div>

              <hr className="border-slate-700 my-6" />

              {/* ==================================
                  TOTALS
                  ================================== */}

              <div className="space-y-4">

                {/* SUBTOTAL */}

                <div className="flex justify-between">

                  <span className="text-slate-400">
                    Subtotal
                  </span>

                  <span>
                    ₹
                    {subtotal.toFixed(
                      2
                    )}
                  </span>

                </div>

                {/* SHIPPING */}

                <div className="flex justify-between">

                  <span className="text-slate-400">
                    Shipping
                  </span>

                  <span
                    className={
                      shipping === 0
                        ? "text-green-400"
                        : ""
                    }
                  >

                    {shipping === 0
                      ? "FREE"
                      : `₹${shipping.toFixed(
                          2
                        )}`}

                  </span>

                </div>

                {/* FREE SHIPPING */}

                {shipping === 0 &&
                  subtotal > 0 &&
                  settings.free_shipping_above >
                    0 && (

                    <p className="text-xs text-green-400">
                      Free shipping applied.
                    </p>

                  )}

                {/* FREE SHIPPING PROGRESS */}

                {shipping > 0 &&
                  settings.free_shipping_above >
                    0 &&
                  subtotal <
                    settings.free_shipping_above && (

                    <p className="text-xs text-slate-400">

                      Add ₹
                      {Math.max(
                        settings.free_shipping_above -
                          subtotal,
                        0
                      ).toFixed(
                        2
                      )}{" "}
                      more for free shipping.

                    </p>

                  )}

                {/* TAX */}

                <div className="flex justify-between">

                  <span className="text-slate-400">

                    Tax (
                    {settings.tax_rate}
                    %)

                  </span>

                  <span>

                    ₹
                    {tax.toFixed(2)}

                  </span>

                </div>

                <hr className="border-slate-700" />

                {/* TOTAL */}

                <div className="flex justify-between items-center text-xl font-bold">

                  <span>
                    Total
                  </span>

                  <span className="text-violet-400">

                    ₹
                    {total.toFixed(2)}

                  </span>

                </div>

              </div>

              {/* ==================================
                  PLACE ORDER
                  ================================== */}

              <button
                type="submit"
                disabled={
                  loading ||
                  settingsLoading ||
                  !settings.store_enabled ||
                  !settings.cod_enabled
                }
                className="w-full mt-8 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed py-4 rounded-xl font-semibold transition"
              >

                {settingsLoading
                  ? "Loading Checkout..."
                  : loading
                    ? "Placing Order..."
                    : !settings.store_enabled
                      ? "Store Unavailable"
                      : !settings.cod_enabled
                        ? "Payment Unavailable"
                        : `Place Order • ₹${total.toFixed(
                            2
                          )}`}

              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                Final price and stock are
                verified when you place the
                order.
              </p>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
}

export default Checkout;