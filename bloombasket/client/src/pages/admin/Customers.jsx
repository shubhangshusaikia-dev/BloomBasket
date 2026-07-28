import { useEffect, useMemo, useState } from "react";
import {
  FiUsers,
  FiSearch,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiShoppingBag,
} from "react-icons/fi";

import { supabase } from "../../lib/supabase";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } =
        await supabase
          .from("orders")
          .select(
            `
            id,
            user_id,
            customer_name,
            email,
            phone,
            total,
            status,
            created_at
          `
          )
          .order("created_at", {
            ascending: false,
          });

      if (fetchError) {
        throw fetchError;
      }

      const customerMap = new Map();

      (data || []).forEach((order) => {
        // Firebase UID is the best identifier.
        // Email is used as fallback.
        const key =
          order.user_id ||
          order.email ||
          `order-${order.id}`;

        if (!customerMap.has(key)) {
          customerMap.set(key, {
            id: key,

            name:
              order.customer_name ||
              "Customer",

            email:
              order.email || "—",

            phone:
              order.phone || "—",

            orders: 0,

            totalSpent: 0,

            lastOrder:
              order.created_at || null,
          });
        }

        const customer =
          customerMap.get(key);

        customer.orders += 1;

        // Don't include cancelled orders
        // in customer spending.

        if (
          order.status?.toLowerCase() !==
          "cancelled"
        ) {
          customer.totalSpent +=
            Number(order.total || 0);
        }

        // Query is newest first, so
        // the first order is the latest.
        if (!customer.lastOrder) {
          customer.lastOrder =
            order.created_at;
        }
      });

      setCustomers(
        Array.from(customerMap.values())
      );
    } catch (err) {
      console.error(
        "Customers error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // SEARCH
  // ========================================

  const filteredCustomers =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return customers;
      }

      return customers.filter(
        (customer) =>
          customer.name
            .toLowerCase()
            .includes(query) ||
          customer.email
            .toLowerCase()
            .includes(query) ||
          customer.phone
            .toLowerCase()
            .includes(query)
      );
    }, [customers, search]);

  // ========================================
  // MONEY
  // ========================================

  function formatMoney(value) {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
      }
    ).format(Number(value || 0));
  }

  // ========================================
  // DATE
  // ========================================

  function formatDate(date) {
    if (!date) return "—";

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(new Date(date));
  }

  return (
    <div>

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

        <div>

          <div className="flex items-center gap-3">

            <FiUsers
              size={28}
              className="text-violet-400"
            />

            <h1 className="text-3xl font-bold">
              Customers
            </h1>

          </div>

          <p className="text-slate-400 mt-2">
            View customers who have placed
            orders.
          </p>

        </div>

        <button
          type="button"
          onClick={fetchCustomers}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 px-5 py-3 rounded-xl transition"
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

      {/* SUMMARY */}

      <div className="grid sm:grid-cols-2 gap-5 mt-8">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <p className="text-slate-400">
            Customers
          </p>

          <p className="text-3xl font-bold mt-2">
            {loading
              ? "..."
              : customers.length}
          </p>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <p className="text-slate-400">
            Total Customer Orders
          </p>

          <p className="text-3xl font-bold mt-2">

            {loading
              ? "..."
              : customers.reduce(
                  (total, customer) =>
                    total +
                    customer.orders,
                  0
                )}

          </p>

        </div>

      </div>

      {/* SEARCH */}

      <div className="relative mt-8">

        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

        <input
          type="text"
          placeholder="Search name, email or phone..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 rounded-xl py-3 pl-12 pr-4 outline-none"
        />

      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* CONTENT */}

      {loading ? (

        <div className="py-20 text-center">

          <div className="w-10 h-10 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin mx-auto" />

          <p className="text-slate-400 mt-4">
            Loading customers...
          </p>

        </div>

      ) : filteredCustomers.length === 0 ? (

        <div className="bg-slate-900 border border-slate-800 rounded-2xl py-16 text-center mt-8">

          <FiUsers
            size={50}
            className="mx-auto text-slate-600"
          />

          <h2 className="text-xl font-bold mt-4">
            No Customers Found
          </h2>

          <p className="text-slate-400 mt-2">
            {search
              ? "Try another search."
              : "Customers will appear after they place an order."}
          </p>

        </div>

      ) : (

        <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-2xl mt-8">

          <table className="w-full min-w-[900px]">

            <thead className="bg-slate-800/70">

              <tr>

                <th className="text-left p-4">
                  Customer
                </th>

                <th className="text-left p-4">
                  Contact
                </th>

                <th className="text-center p-4">
                  Orders
                </th>

                <th className="text-left p-4">
                  Total Spent
                </th>

                <th className="text-left p-4">
                  Last Order
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredCustomers.map(
                (customer) => (

                  <tr
                    key={customer.id}
                    className="border-t border-slate-800 hover:bg-slate-800/40"
                  >

                    {/* CUSTOMER */}

                    <td className="p-4">

                      <div className="flex items-center gap-3">

                        <div className="w-11 h-11 rounded-full bg-violet-600 flex items-center justify-center font-bold">

                          {customer.name
                            .charAt(0)
                            .toUpperCase()}

                        </div>

                        <div>

                          <p className="font-semibold">
                            {customer.name}
                          </p>

                          <p className="text-xs text-slate-500 mt-1 max-w-[180px] truncate">
                            {customer.id}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* CONTACT */}

                    <td className="p-4">

                      <div className="space-y-2">

                        <div className="flex items-center gap-2 text-sm">

                          <FiMail className="text-violet-400" />

                          <span>
                            {customer.email}
                          </span>

                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-400">

                          <FiPhone />

                          <span>
                            {customer.phone}
                          </span>

                        </div>

                      </div>

                    </td>

                    {/* ORDERS */}

                    <td className="p-4 text-center">

                      <div className="inline-flex items-center gap-2">

                        <FiShoppingBag className="text-violet-400" />

                        <span className="font-semibold">
                          {customer.orders}
                        </span>

                      </div>

                    </td>

                    {/* SPENT */}

                    <td className="p-4 font-semibold text-violet-400">
                      {formatMoney(
                        customer.totalSpent
                      )}
                    </td>

                    {/* DATE */}

                    <td className="p-4 text-slate-400">
                      {formatDate(
                        customer.lastOrder
                      )}
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

export default Customers;