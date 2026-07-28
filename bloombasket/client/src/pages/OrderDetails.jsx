import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiPackage,
  FiMapPin,
  FiCreditCard,
  FiXCircle,
  FiCheckCircle,
} from "react-icons/fi";

import { auth } from "../firebase/firebase";
import { supabase } from "../lib/supabase";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD ORDER
  // ==========================================

  useEffect(() => {
    fetchOrder();
  }, [id]);

  async function fetchOrder() {
    try {
      setLoading(true);
      setError("");

      const user = auth.currentUser;

      if (!user) {
        navigate("/login");
        return;
      }

      const {
        data,
        error: orderError,
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
        .eq("id", id)
        .eq("user_id", user.uid)
        .maybeSingle();

      if (orderError) {
        throw orderError;
      }

      if (!data) {
        throw new Error(
          "Order not found."
        );
      }

      setOrder(data);
    } catch (err) {
      console.error(
        "Order details error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load this order."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // CANCEL ORDER
  // ==========================================

  async function handleCancel() {
    if (!order) return;

    const user = auth.currentUser;

    if (!user) {
      setError(
        "Please log in before cancelling."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel Order #${order.id}?`
    );

    if (!confirmed) return;

    try {
      setCancelling(true);
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
          "Order could not be cancelled."
        );
      }

      setSuccess(
        "Order cancelled successfully."
      );

      await fetchOrder();
    } catch (err) {
      console.error(
        "Cancel error:",
        err
      );

      setError(
        err?.message ||
          "Unable to cancel this order."
      );
    } finally {
      setCancelling(false);
    }
  }

  // ==========================================
  // HELPERS
  // ==========================================

  function formatDate(date) {
    if (!date) return "—";

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

  function formatStatus(status) {
    if (!status) return "Unknown";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  }

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
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin mx-auto" />

          <p className="text-slate-400 mt-4">
            Loading order...
          </p>

        </div>

      </div>
    );
  }

  // ==========================================
  // ERROR / NOT FOUND
  // ==========================================

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">

        <div className="text-center">

          <FiXCircle
            size={55}
            className="text-red-400 mx-auto"
          />

          <h1 className="text-3xl font-bold mt-5">
            Order Not Found
          </h1>

          <p className="text-slate-400 mt-3">
            {error ||
              "Unable to find this order."}
          </p>

          <Link
            to="/orders"
            className="inline-block mt-7 bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl"
          >
            Back to Orders
          </Link>

        </div>

      </div>
    );
  }

  const items =
    order.order_items || [];

  const status =
    String(
      order.status || ""
    ).toLowerCase();

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10">

      <div className="max-w-5xl mx-auto px-6">

        {/* BACK */}

        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <FiArrowLeft />

          My Orders
        </Link>

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mt-6">

          <div>

            <h1 className="text-4xl font-bold">
              Order #{order.id}
            </h1>

            <p className="text-slate-400 mt-2">
              Placed on{" "}
              {formatDate(
                order.created_at
              )}
            </p>

          </div>

          <span
            className={`self-start md:self-auto px-4 py-2 rounded-full border font-semibold ${getStatusClasses(
              status
            )}`}
          >
            {formatStatus(status)}
          </span>

        </div>

        {/* SUCCESS */}

        {success && (
          <div className="flex items-center gap-3 mt-8 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400">

            <FiCheckCircle />

            {success}

          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="flex items-center gap-3 mt-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">

            <FiXCircle />

            {error}

          </div>
        )}

        {/* PRODUCTS */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-8">

          <div className="flex items-center gap-3">

            <FiPackage className="text-violet-400" />

            <h2 className="text-2xl font-bold">
              Items
            </h2>

          </div>

          <div className="space-y-5 mt-6">

            {items.map((item) => (

              <div
                key={item.id}
                className="flex items-center gap-4 border-b border-slate-800 pb-5 last:border-0 last:pb-0"
              >

                {item.product_image ? (

                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-800"
                  />

                ) : (

                  <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center">

                    <FiPackage className="text-slate-500" />

                  </div>

                )}

                <div className="flex-1 min-w-0">

                  <p className="font-semibold">
                    {item.product_name}
                  </p>

                  <p className="text-slate-400 text-sm mt-1">

                    ₹
                    {Number(
                      item.price || 0
                    ).toFixed(2)}

                    {" × "}

                    {item.quantity}

                  </p>

                </div>

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

            ))}

          </div>

        </div>

        {/* SHIPPING */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">

          <div className="flex items-center gap-3">

            <FiMapPin className="text-violet-400" />

            <h2 className="text-2xl font-bold">
              Shipping
            </h2>

          </div>

          <div className="mt-5">

            <p className="font-semibold">
              {order.customer_name}
            </p>

            <p className="text-slate-400 mt-2">

              {order.address}

              {order.city &&
                `, ${order.city}`}

              {order.state &&
                `, ${order.state}`}

              {order.pincode &&
                ` - ${order.pincode}`}

            </p>

            {order.phone && (
              <p className="text-slate-400 mt-2">
                Phone: {order.phone}
              </p>
            )}

            {order.email && (
              <p className="text-slate-400 mt-1">
                Email: {order.email}
              </p>
            )}

          </div>

        </div>

        {/* PAYMENT + TOTAL */}

        <div className="grid md:grid-cols-2 gap-6 mt-6">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <div className="flex items-center gap-3">

              <FiCreditCard className="text-violet-400" />

              <h2 className="text-xl font-bold">
                Payment
              </h2>

            </div>

            <div className="mt-5 space-y-3">

              <div className="flex justify-between">

                <span className="text-slate-400">
                  Method
                </span>

                <span>
                  {order.payment_method ===
                  "cod"
                    ? "Cash on Delivery"
                    : order.payment_method ||
                      "—"}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-400">
                  Status
                </span>

                <span className="capitalize">
                  {order.payment_status ||
                    "pending"}
                </span>

              </div>

            </div>

          </div>

          {/* TOTAL */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <h2 className="text-xl font-bold">
              Order Total
            </h2>

            <div className="space-y-3 mt-5">

              <div className="flex justify-between">

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

              <div className="flex justify-between">

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
                      ).toFixed(2)}`}

                </span>

              </div>

              <div className="flex justify-between">

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

              <div className="border-t border-slate-800 pt-4 flex justify-between text-xl font-bold">

                <span>Total</span>

                <span className="text-violet-400">
                  ₹
                  {Number(
                    order.total || 0
                  ).toFixed(2)}
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* CANCEL */}

        {canCancel(status) && (

          <div className="flex justify-end mt-8">

            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 disabled:opacity-50 px-6 py-3 rounded-xl font-semibold transition"
            >

              <FiXCircle />

              {cancelling
                ? "Cancelling..."
                : "Cancel Order"}

            </button>

          </div>

        )}

        {status === "cancelled" && (

          <div className="mt-8 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4">
            This order has been cancelled.
          </div>

        )}

      </div>

    </div>
  );
}

export default OrderDetails;