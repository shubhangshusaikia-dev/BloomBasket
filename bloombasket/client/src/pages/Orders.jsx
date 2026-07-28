import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  FiShoppingBag,
  FiPackage,
  FiXCircle,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi";

import { auth } from "../firebase/firebase";
import { supabase } from "../lib/supabase";

function Orders() {
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancellingId, setCancellingId] =
    useState(null);

  const [success, setSuccess] = useState(
    location.state?.orderPlaced
      ? `Order #${location.state.orderId} placed successfully!`
      : ""
  );

  // ==========================================
  // FETCH ORDERS
  // ==========================================

  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");

      const user = auth.currentUser;

      if (!user) {
        setOrders([]);
        setError(
          "Please log in to view your orders."
        );
        return;
      }

      const {
        data,
        error: ordersError,
      } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            product_image,
            price,
            quantity
          )
        `)
        .eq("user_id", user.uid)
        .order("id", {
          ascending: false,
        });

      if (ordersError) {
        throw ordersError;
      }

      setOrders(data || []);
    } catch (err) {
      console.error(
        "Fetch orders error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==========================================
  // CANCEL ORDER
  // ==========================================

  async function cancelOrder(order) {
    const user = auth.currentUser;

    if (!user) {
      setError(
        "Please log in before cancelling an order."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel Order #${order.id}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(order.id);
      setError("");
      setSuccess("");

      const {
        data,
        error: cancelError,
      } = await supabase.rpc(
        "cancel_order",
        {
          p_order_id: order.id,
          p_user_id: user.uid,
        }
      );

      if (cancelError) {
        throw cancelError;
      }

      if (data !== true) {
        throw new Error(
          "The order could not be cancelled."
        );
      }

      setSuccess(
        `Order #${order.id} has been cancelled.`
      );

      // Refresh orders after cancellation.
      // The database already restored stock.

      await fetchOrders();
    } catch (err) {
      console.error(
        "Cancel order error:",
        err
      );

      setError(
        err?.message ||
          "Unable to cancel this order."
      );
    } finally {
      setCancellingId(null);
    }
  }

  // ==========================================
  // STATUS HELPERS
  // ==========================================

  function getStatusClasses(status) {
    switch (
      String(status || "").toLowerCase()
    ) {
      case "placed":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";

      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";

      case "confirmed":
        return "bg-violet-500/10 text-violet-400 border-violet-500/30";

      case "processing":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";

      case "shipped":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";

      case "delivered":
        return "bg-green-500/10 text-green-400 border-green-500/30";

      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/30";

      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  }

  function formatStatus(status) {
    if (!status) {
      return "Unknown";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  }

  function canCancel(status) {
    return [
      "placed",
      "pending",
      "confirmed",
    ].includes(
      String(status || "").toLowerCase()
    );
  }

  // ==========================================
  // DATE
  // ==========================================

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin mx-auto" />

          <p className="text-slate-400 mt-4">
            Loading your orders...
          </p>

        </div>

      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10">

      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

          <div>

            <h1 className="text-4xl font-bold">
              My Orders
            </h1>

            <p className="text-slate-400 mt-2">
              View and manage your BloomBasket
              orders.
            </p>

          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-3 rounded-xl transition"
          >
            <FiRefreshCw />

            Refresh
          </button>

        </div>

        {/* SUCCESS */}

        {success && (

          <div className="mt-8 flex items-start gap-3 bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl">

            <FiCheckCircle
              size={21}
              className="mt-0.5 flex-shrink-0"
            />

            <p>{success}</p>

          </div>

        )}

        {/* ERROR */}

        {error && (

          <div className="mt-8 flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">

            <FiXCircle
              size={21}
              className="mt-0.5 flex-shrink-0"
            />

            <p>{error}</p>

          </div>

        )}

        {/* ====================================
            NO ORDERS
            ==================================== */}

        {orders.length === 0 ? (

          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-3xl py-20 px-6 text-center">

            <FiShoppingBag
              size={64}
              className="mx-auto text-violet-400"
            />

            <h2 className="text-2xl font-bold mt-6">
              No Orders Yet
            </h2>

            <p className="text-slate-400 mt-3">
              Products you purchase will appear
              here.
            </p>

            <Link
              to="/shop"
              className="inline-block mt-8 bg-violet-600 hover:bg-violet-500 px-8 py-3 rounded-xl font-semibold transition"
            >
              Start Shopping
            </Link>

          </div>

        ) : (

          // ==================================
          // ORDERS
          // ==================================

          <div className="space-y-7 mt-10">

            {orders.map((order) => {

              const items =
                order.order_items || [];

              const status =
                String(
                  order.status || ""
                ).toLowerCase();

              return (
                <div
                  key={order.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
                >

                  {/* ==========================
                      ORDER HEADER
                      ========================== */}

                  <div className="p-6 border-b border-slate-800">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

                      <div>

                        <div className="flex items-center gap-3">

                          <FiPackage className="text-violet-400" />

                          <h2 className="text-xl font-bold">
                            Order #{order.id}
                          </h2>

                        </div>

                        <p className="text-sm text-slate-400 mt-2">
                          {formatDate(
                            order.created_at
                          )}
                        </p>

                      </div>

                      <span
                        className={`self-start md:self-auto px-4 py-2 rounded-full border text-sm font-semibold ${getStatusClasses(
                          status
                        )}`}
                      >
                        {formatStatus(
                          status
                        )}
                      </span>

                    </div>

                  </div>

                  {/* ==========================
                      ITEMS
                      ========================== */}

                  <div className="p-6">

                    <div className="space-y-5">

                      {items.length === 0 ? (

                        <p className="text-slate-400">
                          No items found for this
                          order.
                        </p>

                      ) : (

                        items.map((item) => (

                          <div
                            key={item.id}
                            className="flex items-center gap-4"
                          >

                            {/* IMAGE */}

                            {item.product_image ? (

                              <img
                                src={
                                  item.product_image
                                }
                                alt={
                                  item.product_name
                                }
                                className="w-20 h-20 rounded-xl object-cover bg-slate-800"
                              />

                            ) : (

                              <div className="w-20 h-20 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">

                                <FiPackage
                                  size={26}
                                  className="text-slate-500"
                                />

                              </div>

                            )}

                            {/* INFO */}

                            <div className="flex-1 min-w-0">

                              <p className="font-semibold truncate">
                                {item.product_name}
                              </p>

                              <p className="text-sm text-slate-400 mt-1">

                                ₹
                                {Number(
                                  item.price || 0
                                ).toFixed(2)}

                                {" × "}

                                {item.quantity}

                              </p>

                            </div>

                            {/* ITEM TOTAL */}

                            <p className="font-semibold">

                              ₹
                              {(
                                Number(
                                  item.price || 0
                                ) *
                                Number(
                                  item.quantity || 0
                                )
                              ).toFixed(2)}

                            </p>

                          </div>

                        ))

                      )}

                    </div>

                    {/* ========================
                        PRICE SUMMARY
                        ======================== */}

                    <div className="border-t border-slate-800 mt-6 pt-6">

                      <div className="max-w-sm ml-auto space-y-3">

                        <div className="flex justify-between text-sm">

                          <span className="text-slate-400">
                            Subtotal
                          </span>

                          <span>
                            ₹
                            {Number(
                              order.subtotal || 0
                            ).toFixed(2)}
                          </span>

                        </div>

                        <div className="flex justify-between text-sm">

                          <span className="text-slate-400">
                            Shipping
                          </span>

                          <span>

                            {Number(
                              order.shipping || 0
                            ) === 0
                              ? "FREE"
                              : `₹${Number(
                                  order.shipping
                                ).toFixed(
                                  2
                                )}`}

                          </span>

                        </div>

                        <div className="flex justify-between text-sm">

                          <span className="text-slate-400">
                            Tax
                          </span>

                          <span>
                            ₹
                            {Number(
                              order.tax || 0
                            ).toFixed(2)}
                          </span>

                        </div>

                        <div className="border-t border-slate-800 pt-3 flex justify-between text-xl font-bold">

                          <span>
                            Total
                          </span>

                          <span className="text-violet-400">

                            ₹
                            {Number(
                              order.total || 0
                            ).toFixed(2)}

                          </span>

                        </div>

                      </div>

                    </div>

                    {/* ========================
                        PAYMENT
                        ======================== */}

                    <div className="mt-6 bg-slate-800/60 rounded-xl p-4">

                      <div className="flex flex-wrap gap-x-10 gap-y-3 text-sm">

                        <div>

                          <p className="text-slate-500">
                            Payment Method
                          </p>

                          <p className="mt-1 font-medium">

                            {order.payment_method ===
                            "cod"
                              ? "Cash on Delivery"
                              : order.payment_method ||
                                "—"}

                          </p>

                        </div>

                        <div>

                          <p className="text-slate-500">
                            Payment Status
                          </p>

                          <p className="mt-1 font-medium capitalize">
                            {order.payment_status ||
                              "pending"}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* ========================
                        SHIPPING ADDRESS
                        ======================== */}

                    <div className="mt-6">

                      <p className="text-sm text-slate-500">
                        Deliver To
                      </p>

                      <p className="font-semibold mt-2">
                        {order.customer_name}
                      </p>

                      <p className="text-sm text-slate-400 mt-1">

                        {order.address}

                        {order.city &&
                          `, ${order.city}`}

                        {order.state &&
                          `, ${order.state}`}

                        {order.pincode &&
                          ` - ${order.pincode}`}

                      </p>

                      {order.phone && (

                        <p className="text-sm text-slate-400 mt-1">
                          Phone: {order.phone}
                        </p>

                      )}

                    </div>

                    {/* ========================
                        ACTIONS
                        ======================== */}

                    <div className="flex flex-wrap justify-end gap-3 mt-7 pt-6 border-t border-slate-800">

                      {/* DETAILS */}

                      <Link
                        to={`/orders/${order.id}`}
                        className="px-5 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition"
                      >
                        View Details
                      </Link>

                      {/* CANCEL */}

                      {canCancel(status) && (

                        <button
                          type="button"
                          onClick={() =>
                            cancelOrder(order)
                          }
                          disabled={
                            cancellingId ===
                            order.id
                          }
                          className="flex items-center gap-2 px-5 py-3 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition"
                        >

                          <FiXCircle />

                          {cancellingId ===
                          order.id
                            ? "Cancelling..."
                            : "Cancel Order"}

                        </button>

                      )}

                    </div>

                    {/* CANCELLED MESSAGE */}

                    {status ===
                      "cancelled" && (

                      <div className="mt-5 bg-red-500/10 border border-red-500/20 rounded-xl p-4">

                        <p className="text-red-400 text-sm">
                          This order has been
                          cancelled.
                        </p>

                      </div>

                    )}

                    {/* DELIVERED */}

                    {status ===
                      "delivered" && (

                      <div className="mt-5 bg-green-500/10 border border-green-500/20 rounded-xl p-4">

                        <p className="text-green-400 text-sm">
                          This order has been
                          delivered.
                        </p>

                      </div>

                    )}

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>

    </div>
  );
}

export default Orders;