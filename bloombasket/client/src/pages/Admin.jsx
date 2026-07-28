import { useEffect, useState } from "react";

import {
  NavLink,
  Routes,
  Route,
} from "react-router-dom";

import {
  FiHome,
  FiBox,
  FiGrid,
  FiShoppingBag,
  FiUsers,
  FiSettings,
  FiRefreshCw,
} from "react-icons/fi";

import { supabase } from "../lib/supabase";

// ==========================================
// ADMIN PAGES
// ==========================================

import Products from "./admin/Products";
import AddProduct from "./admin/AddProduct";
import AdminOrders from "./admin/AdminOrders";
import Categories from "./admin/Categories";
import Customers from "./admin/Customers";
import Settings from "./admin/Settings";

// ==========================================
// DASHBOARD
// ==========================================

function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      setLoading(true);
      setError("");

      // ======================================
      // PRODUCTS COUNT
      // ======================================

      const {
        count: productCount,
        error: productError,
      } = await supabase
        .from("products")
        .select("*", {
          count: "exact",
          head: true,
        });

      if (productError) {
        throw productError;
      }

      // ======================================
      // ORDERS
      // ======================================

      const {
        data: orderData,
        error: orderError,
      } = await supabase
        .from("orders")
        .select(`
          id,
          user_id,
          email,
          total,
          status
        `);

      if (orderError) {
        throw orderError;
      }

      const orders = orderData || [];

      // ======================================
      // UNIQUE CUSTOMERS
      // ======================================

      const customerKeys = orders
        .map(
          (order) =>
            order.user_id ||
            order.email
        )
        .filter(Boolean);

      const customers =
        new Set(customerKeys).size;

      // ======================================
      // REVENUE
      // Delivered orders only
      // ======================================

      const revenue = orders
        .filter(
          (order) =>
            String(
              order.status || ""
            ).toLowerCase() ===
            "delivered"
        )
        .reduce(
          (total, order) =>
            total +
            Number(order.total || 0),
          0
        );

      setStats({
        products:
          productCount || 0,

        orders:
          orders.length,

        customers,

        revenue,
      });
    } catch (err) {
      console.error(
        "Dashboard error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>

      {/* ====================================
          HEADER
          ==================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

        <div>

          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>

          <p className="text-slate-400 mt-2">
            Welcome to BloomBasket Admin.
          </p>

        </div>

        <button
          type="button"
          onClick={fetchDashboardStats}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 px-4 py-3 rounded-xl"
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
          ERROR
          ==================================== */}

      {error && (
        <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* ====================================
          STAT CARDS
          ==================================== */}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">

        <StatCard
          title="Products"
          value={
            loading
              ? "—"
              : stats.products
          }
        />

        <StatCard
          title="Orders"
          value={
            loading
              ? "—"
              : stats.orders
          }
        />

        <StatCard
          title="Customers"
          value={
            loading
              ? "—"
              : stats.customers
          }
        />

        <StatCard
          title="Revenue"
          value={
            loading
              ? "—"
              : `₹${stats.revenue.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}`
          }
        />

      </div>

    </div>
  );
}

// ==========================================
// STAT CARD
// ==========================================

function StatCard({
  title,
  value,
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      <p className="text-slate-400">
        {title}
      </p>

      <h2 className="text-4xl font-bold text-violet-400 mt-3">
        {value}
      </h2>

    </div>
  );
}

// ==========================================
// SIDEBAR LINK
// ==========================================

function SidebarLink({
  to,
  icon,
  text,
  end = false,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
          isActive
            ? "bg-violet-600 text-white"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`
      }
    >

      {icon}

      <span>
        {text}
      </span>

    </NavLink>
  );
}

// ==========================================
// ADMIN
// ==========================================

function Admin() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="grid lg:grid-cols-[260px_1fr]">

        {/* ==================================
            SIDEBAR
            ================================== */}

        <aside className="bg-slate-900 border-r border-slate-800 p-6 lg:min-h-screen">

          {/* ADMIN LOGO */}

          <NavLink
            to="/admin"
            className="block mb-10"
          >

            <h1 className="text-3xl font-bold text-violet-400">
              BloomBasket
            </h1>

            <p className="text-xs text-slate-500 mt-1">
              Admin Panel
            </p>

          </NavLink>

          {/* =================================
              NAVIGATION
              ================================= */}

          <nav className="space-y-3">

            <SidebarLink
              to="/admin"
              icon={<FiHome />}
              text="Dashboard"
              end
            />

            <SidebarLink
              to="/admin/products"
              icon={<FiBox />}
              text="Products"
            />

            <SidebarLink
              to="/admin/categories"
              icon={<FiGrid />}
              text="Categories"
            />

            <SidebarLink
              to="/admin/orders"
              icon={<FiShoppingBag />}
              text="Orders"
            />

            <SidebarLink
              to="/admin/customers"
              icon={<FiUsers />}
              text="Customers"
            />

            <SidebarLink
              to="/admin/settings"
              icon={<FiSettings />}
              text="Settings"
            />

          </nav>

        </aside>

        {/* ==================================
            MAIN CONTENT
            ================================== */}

        <main className="p-6 md:p-8 overflow-hidden">

          <Routes>

            {/* DASHBOARD */}

            <Route
              index
              element={<Dashboard />}
            />

            {/* PRODUCTS */}

            <Route
              path="products"
              element={<Products />}
            />

            {/* ADD PRODUCT */}

            <Route
              path="add-product"
              element={<AddProduct />}
            />

            {/* CATEGORIES */}

            <Route
              path="categories"
              element={<Categories />}
            />

            {/* ORDERS */}

            <Route
              path="orders"
              element={<AdminOrders />}
            />

            {/* CUSTOMERS */}

            <Route
              path="customers"
              element={<Customers />}
            />

            {/* SETTINGS */}

            <Route
              path="settings"
              element={<Settings />}
            />

          </Routes>

        </main>

      </div>

    </div>
  );
}

export default Admin;