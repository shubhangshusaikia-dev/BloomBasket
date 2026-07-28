import { useEffect, useMemo, useState } from "react";

import {
  FiShoppingBag,
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiX,
} from "react-icons/fi";

import { supabase } from "../../lib/supabase";

const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [updatingId, setUpdatingId] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==========================================
  // FETCH ORDERS
  // ==========================================

  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");

      const {
        data,
        error: fetchError,
      } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (fetchError) {
        throw fetchError;
      }

      setOrders(data || []);
    } catch (err) {
      console.error(
        "Order fetch error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // NORMAL STATUS UPDATE
  // ==========================================

  async function updateNormalStatus(
    order,
    newStatus
  ) {
    const currentStatus =
      String(order.status || "placed")
        .toLowerCase();

    // Cancelled is final.
    if (currentStatus === "cancelled") {
      setError(
        "A cancelled order cannot be changed."
      );

      return;
    }

    // Delivered is final.
    if (currentStatus === "delivered") {
      setError(
        "A delivered order cannot be changed."
      );

      return;
    }

    try {
      setUpdatingId(order.id);
      setError("");
      setSuccess("");

      const {
        error: updateError,
      } = await supabase
        .from("orders")
        .update({
          status: newStatus,
        })
        .eq("id", order.id);

      if (updateError) {
        throw updateError;
      }

      // If COD order becomes delivered,
      // automatically mark payment as paid.

      const shouldMarkPaid =
        newStatus === "delivered" &&
        order.payment_method === "cod";

      if (shouldMarkPaid) {
        const {
          error: paymentError,
        } = await supabase
          .from("orders")
          .update({
            payment_status: "paid",
          })
          .eq("id", order.id);

        if (paymentError) {
          throw paymentError;
        }
      }

      const updatedOrder = {
        ...order,
        status: newStatus,

        payment_status:
          shouldMarkPaid
            ? "paid"
            : order.payment_status,
      };

      setOrders((previous) =>
        previous.map((item) =>
          item.id === order.id
            ? updatedOrder
            : item
        )
      );

      setSelectedOrder((previous) => {
        if (
          !previous ||
          previous.id !== order.id
        ) {
          return previous;
        }

        return {
          ...previous,
          status: newStatus,

          payment_status:
            shouldMarkPaid
              ? "paid"
              : previous.payment_status,
        };
      });

      setSuccess(
        `Order #${order.id} updated to ${formatStatus(
          newStatus
        )}.`
      );
    } catch (err) {
      console.error(
        "Status update error:",
        err
      );

      setError(
        err?.message ||
          "Unable to update order."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // ==========================================
  // CANCEL ORDER
  // ==========================================

  async function cancelOrder(order) {
    if (
      order.status === "cancelled"
    ) {
      return;
    }

    if (
      order.status === "delivered"
    ) {
      setError(
        "Delivered orders cannot be cancelled."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Cancel Order #${order.id}?\n\nThe ordered quantity will be returned to product stock.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(order.id);
      setError("");
      setSuccess("");

      const {
        data,
        error: cancelError,
      } = await supabase.rpc(
        "admin_cancel_order",
        {
          p_order_id: order.id,
        }
      );

      if (cancelError) {
        throw cancelError;
      }

      if (data !== true) {
        throw new Error(
          "Unable to cancel order."
        );
      }

      setOrders((previous) =>
        previous.map((item) =>
          item.id === order.id
            ? {
                ...item,
                status: "cancelled",
              }
            : item
        )
      );

      setSelectedOrder((previous) => {
        if (
          !previous ||
          previous.id !== order.id
        ) {
          return previous;
        }

        return {
          ...previous,
          status: "cancelled",
        };
      });

      setSuccess(
        `Order #${order.id} cancelled and stock restored.`
      );
    } catch (err) {
      console.error(
        "Admin cancellation error:",
        err
      );

      setError(
        err?.message ||
          "Unable to cancel order."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // ==========================================
  // STATUS CHANGE HANDLER
  // ==========================================

  async function handleStatusChange(
    order,
    newStatus
  ) {
    const currentStatus =
      String(order.status || "placed")
        .toLowerCase();

    if (newStatus === currentStatus) {
      return;
    }

    if (newStatus === "cancelled") {
      await cancelOrder(order);
      return;
    }

    await updateNormalStatus(
      order,
      newStatus
    );
  }

  // ==========================================
  // PAYMENT STATUS
  // ==========================================

  async function updatePaymentStatus(
    orderId,
    paymentStatus
  ) {
    try {
      setUpdatingId(orderId);
      setError("");
      setSuccess("");

      const {
        error: updateError,
      } = await supabase
        .from("orders")
        .update({
          payment_status:
            paymentStatus,
        })
        .eq("id", orderId);

      if (updateError) {
        throw updateError;
      }

      setOrders((previous) =>
        previous.map((order) =>
          order.id === orderId
            ? {
                ...order,
                payment_status:
                  paymentStatus,
              }
            : order
        )
      );

      setSelectedOrder(
        (previous) => {
          if (
            !previous ||
            previous.id !== orderId
          ) {
            return previous;
          }

          return {
            ...previous,
            payment_status:
              paymentStatus,
          };
        }
      );

      setSuccess(
        `Payment status updated to ${formatStatus(
          paymentStatus
        )}.`
      );
    } catch (err) {
      console.error(
        "Payment update error:",
        err
      );

      setError(
        err?.message ||
          "Unable to update payment status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // ==========================================
  // OPEN ORDER
  // ==========================================

  async function openOrder(order) {
    try {
      setDetailsLoading(true);
      setError("");

      // Open immediately so the modal
      // can show its loading state.

      setSelectedOrder({
        ...order,
        items: [],
      });

      const {
        data: items,
        error: itemError,
      } = await supabase
        .from("order_items")
        .select("*")
        .eq(
          "order_id",
          order.id
        );

      if (itemError) {
        throw itemError;
      }

      setSelectedOrder(
        (previous) => ({
          ...(previous || order),
          items: items || [],
        })
      );
    } catch (err) {
      console.error(
        "Order details error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load order details."
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  // ==========================================
  // FILTERS
  // ==========================================

  const filteredOrders =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return orders.filter(
        (order) => {
          const matchesStatus =
            statusFilter === "all" ||
            String(
              order.status || ""
            ).toLowerCase() ===
              statusFilter;

          const searchable = [
            order.id,
            order.customer_name,
            order.email,
            order.phone,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !query ||
            searchable.includes(
              query
            );

          return (
            matchesStatus &&
            matchesSearch
          );
        }
      );
    }, [
      orders,
      search,
      statusFilter,
    ]);

  // ==========================================
  // FORMATTERS
  // ==========================================

  function formatMoney(value) {
    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(
      Number(value || 0)
    );
  }

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(
      new Date(value)
    );
  }

  function formatStatus(value) {
    if (!value) {
      return "Unknown";
    }

    const text =
      String(value);

    return (
      text.charAt(0).toUpperCase() +
      text.slice(1)
    );
  }

  // ==========================================
  // BADGE
  // ==========================================

  function statusClass(status) {
    switch (
      String(
        status || ""
      ).toLowerCase()
    ) {
      case "placed":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";

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

  return (
    <div>

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

        <div>

          <div className="flex items-center gap-3">

            <FiShoppingBag
              size={28}
              className="text-violet-400"
            />

            <h1 className="text-3xl font-bold">
              Orders
            </h1>

          </div>

          <p className="text-slate-400 mt-2">
            Manage customer orders,
            fulfilment and payments.
          </p>

        </div>

        <button
          type="button"
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 px-5 py-3 rounded-xl"
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

      {/* MESSAGES */}

      {success && (
        <div className="mt-6 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4">
          {success}
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4">
          {error}
        </div>
      )}

      {/* FILTERS */}

      <div className="grid md:grid-cols-[1fr_220px] gap-4 mt-8">

        <div className="relative">

          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

          <input
            type="text"
            placeholder="Search order, customer, email, phone..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-violet-500"
          />

        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
        >

          <option value="all">
            All Orders
          </option>

          {ORDER_STATUSES.map(
            (status) => (
              <option
                key={status}
                value={status}
              >
                {formatStatus(
                  status
                )}
              </option>
            )
          )}

        </select>

      </div>

      {/* LOADING */}

      {loading ? (

        <div className="text-center py-20">

          <div className="w-10 h-10 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin mx-auto" />

          <p className="text-slate-400 mt-4">
            Loading orders...
          </p>

        </div>

      ) : filteredOrders.length ===
        0 ? (

        <div className="bg-slate-900 border border-slate-800 rounded-2xl text-center py-16 mt-8">

          <FiShoppingBag
            size={50}
            className="text-slate-600 mx-auto"
          />

          <h2 className="text-xl font-bold mt-4">
            No Orders Found
          </h2>

        </div>

      ) : (

        // ====================================
        // TABLE
        // ====================================

        <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-2xl mt-8">

          <table className="w-full min-w-[1150px]">

            <thead className="bg-slate-800">

              <tr>

                <th className="p-4 text-left">
                  Order
                </th>

                <th className="p-4 text-left">
                  Customer
                </th>

                <th className="p-4 text-left">
                  Total
                </th>

                <th className="p-4 text-left">
                  Payment
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

                <th className="p-4 text-left">
                  Date
                </th>

                <th className="p-4 text-center">
                  View
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredOrders.map(
                (order) => {

                  const status =
                    String(
                      order.status ||
                        "placed"
                    ).toLowerCase();

                  const isFinal =
                    status ===
                      "cancelled" ||
                    status ===
                      "delivered";

                  return (
                    <tr
                      key={order.id}
                      className="border-t border-slate-800 hover:bg-slate-800/40"
                    >

                      {/* ORDER */}

                      <td className="p-4">

                        <p className="font-semibold">
                          #{order.id}
                        </p>

                        <span
                          className={`inline-block mt-2 text-xs border px-2 py-1 rounded-full capitalize ${statusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>

                      </td>

                      {/* CUSTOMER */}

                      <td className="p-4">

                        <p className="font-medium">
                          {order.customer_name ||
                            "Customer"}
                        </p>

                        <p className="text-sm text-slate-400">
                          {order.email ||
                            "—"}
                        </p>

                      </td>

                      {/* TOTAL */}

                      <td className="p-4 font-semibold text-violet-400">

                        {formatMoney(
                          order.total
                        )}

                      </td>

                      {/* PAYMENT */}

                      <td className="p-4">

                        <select
                          value={
                            order.payment_status ||
                            "pending"
                          }
                          disabled={
                            updatingId ===
                            order.id
                          }
                          onChange={(e) =>
                            updatePaymentStatus(
                              order.id,
                              e.target
                                .value
                            )
                          }
                          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none disabled:opacity-50"
                        >

                          <option value="pending">
                            Pending
                          </option>

                          <option value="paid">
                            Paid
                          </option>

                          <option value="refunded">
                            Refunded
                          </option>

                        </select>

                      </td>

                      {/* STATUS */}

                      <td className="p-4">

                        {isFinal ? (

                          <span
                            className={`inline-block border px-4 py-2 rounded-lg capitalize ${statusClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>

                        ) : (

                          <select
                            value={status}
                            disabled={
                              updatingId ===
                              order.id
                            }
                            onChange={(e) =>
                              handleStatusChange(
                                order,
                                e.target
                                  .value
                              )
                            }
                            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none disabled:opacity-50"
                          >

                            {ORDER_STATUSES.map(
                              (
                                option
                              ) => (

                                <option
                                  key={
                                    option
                                  }
                                  value={
                                    option
                                  }
                                >
                                  {formatStatus(
                                    option
                                  )}
                                </option>

                              )
                            )}

                          </select>

                        )}

                      </td>

                      {/* DATE */}

                      <td className="p-4 text-slate-400">

                        {formatDate(
                          order.created_at
                        )}

                      </td>

                      {/* VIEW */}

                      <td className="p-4 text-center">

                        <button
                          type="button"
                          onClick={() =>
                            openOrder(
                              order
                            )
                          }
                          className="text-violet-400 hover:text-violet-300 p-2"
                        >

                          <FiEye
                            size={20}
                          />

                        </button>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

      )}

      {/* ======================================
          DETAILS MODAL
          ====================================== */}

      {selectedOrder && (

        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">

          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

            {/* HEADER */}

            <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 p-6 flex justify-between items-center">

              <div>

                <h2 className="text-2xl font-bold">
                  Order Details
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  Order #
                  {selectedOrder.id}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(
                    null
                  )
                }
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-red-500 flex items-center justify-center transition"
              >
                <FiX />
              </button>

            </div>

            <div className="p-6">

              {/* CUSTOMER */}

              <div className="grid md:grid-cols-2 gap-6">

                <div>

                  <p className="text-sm text-slate-500">
                    Customer
                  </p>

                  <p className="font-semibold mt-1">
                    {selectedOrder.customer_name ||
                      "Customer"}
                  </p>

                  <p className="text-slate-400 mt-1">
                    {selectedOrder.email ||
                      "—"}
                  </p>

                  <p className="text-slate-400">
                    {selectedOrder.phone ||
                      "—"}
                  </p>

                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    Shipping Address
                  </p>

                  <p className="mt-1">
                    {selectedOrder.address ||
                      "—"}
                  </p>

                  <p className="text-slate-400">

                    {selectedOrder.city ||
                      ""}

                    {selectedOrder.state
                      ? `, ${selectedOrder.state}`
                      : ""}

                  </p>

                  <p className="text-slate-400">

                    {selectedOrder.pincode
                      ? `PIN: ${selectedOrder.pincode}`
                      : ""}

                  </p>

                </div>

              </div>

              {/* STATUS */}

              <div className="grid sm:grid-cols-2 gap-5 mt-8">

                <div>

                  <p className="text-sm text-slate-500 mb-2">
                    Order Status
                  </p>

                  <span
                    className={`inline-block capitalize border px-4 py-2 rounded-full ${statusClass(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>

                </div>

                <div>

                  <p className="text-sm text-slate-500 mb-2">
                    Payment
                  </p>

                  <p className="capitalize font-semibold">

                    {selectedOrder.payment_method ||
                      "—"}

                    {" • "}

                    {selectedOrder.payment_status ||
                      "pending"}

                  </p>

                </div>

              </div>

              {/* PRODUCTS */}

              <h3 className="text-xl font-bold mt-8">
                Products
              </h3>

              {detailsLoading ? (

                <p className="text-slate-400 mt-5">
                  Loading products...
                </p>

              ) : (
                <div className="space-y-4 mt-5">

                  {(selectedOrder.items ||
                    []).length ===
                  0 ? (

                    <p className="text-slate-400">
                      No products found.
                    </p>

                  ) : (

                    (
                      selectedOrder.items ||
                      []
                    ).map(
                      (item) => (

                        <div
                          key={item.id}
                          className="flex items-center gap-4 bg-slate-800 rounded-xl p-4"
                        >

                          {item.product_image ? (

                            <img
                              src={
                                item.product_image
                              }
                              alt={
                                item.product_name ||
                                "Product"
                              }
                              className="w-16 h-16 object-cover rounded-lg"
                            />

                          ) : (

                            <div className="w-16 h-16 rounded-lg bg-slate-700" />

                          )}

                          <div className="flex-1">

                            <p className="font-semibold">
                              {item.product_name ||
                                `Product ${item.product_id}`}
                            </p>

                            <p className="text-sm text-slate-400 mt-1">
                              Qty:{" "}
                              {
                                item.quantity
                              }
                            </p>

                            <p className="text-sm text-slate-400">
                              {formatMoney(
                                item.price
                              )}{" "}
                              each
                            </p>

                          </div>

                          <p className="font-semibold">

                            {formatMoney(
                              Number(
                                item.price
                              ) *
                                Number(
                                  item.quantity
                                )
                            )}

                          </p>

                        </div>

                      )
                    )

                  )}

                </div>
              )}

              {/* TOTALS */}

              <div className="border-t border-slate-800 mt-8 pt-6 space-y-3">

                <div className="flex justify-between">

                  <span className="text-slate-400">
                    Subtotal
                  </span>

                  <span>
                    {formatMoney(
                      selectedOrder.subtotal
                    )}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-400">
                    Shipping
                  </span>

                  <span>
                    {formatMoney(
                      selectedOrder.shipping
                    )}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-400">
                    Tax
                  </span>

                  <span>
                    {formatMoney(
                      selectedOrder.tax
                    )}
                  </span>

                </div>

                <div className="flex justify-between text-xl font-bold pt-3">

                  <span>
                    Total
                  </span>

                  <span className="text-violet-400">
                    {formatMoney(
                      selectedOrder.total
                    )}
                  </span>

                </div>

              </div>

              {/* CANCEL BUTTON */}

              {![
                "cancelled",
                "delivered",
              ].includes(
                String(
                  selectedOrder.status ||
                    ""
                ).toLowerCase()
              ) && (

                <div className="border-t border-slate-800 mt-7 pt-6 flex justify-end">

                  <button
                    type="button"
                    disabled={
                      updatingId ===
                      selectedOrder.id
                    }
                    onClick={() =>
                      cancelOrder(
                        selectedOrder
                      )
                    }
                    className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 disabled:opacity-50 px-5 py-3 rounded-xl transition"
                  >

                    {updatingId ===
                    selectedOrder.id
                      ? "Updating..."
                      : "Cancel Order"}

                  </button>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminOrders;