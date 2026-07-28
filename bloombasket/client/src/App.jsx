import { Routes, Route } from "react-router-dom";

// ==========================================
// COMPONENTS
// ==========================================

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// ==========================================
// CUSTOMER PAGES
// ==========================================

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";

import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

import NotFound from "./pages/NotFound";

// ==========================================
// ADMIN
// ==========================================

import Admin from "./pages/Admin";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* =====================================
          NAVBAR
          ===================================== */}

      <Navbar />

      {/* =====================================
          MAIN
          ===================================== */}

      <main className="flex-1">

        <Routes>

          {/* =================================
              PUBLIC ROUTES
              ================================= */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/shop"
            element={<Shop />}
          />

          <Route
            path="/product/:id"
            element={<ProductDetails />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          {/* =================================
              AUTH ROUTES
              ================================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/verify-email"
            element={<VerifyEmail />}
          />

          {/* =================================
              CUSTOMER PROTECTED ROUTES
              ================================= */}

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* MY ORDERS */}

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          {/* ORDER DETAILS */}

          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />

          {/* =================================
              ADMIN ROUTES
              ================================= */}

          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          {/* =================================
              404
              ================================= */}

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>

      </main>

      {/* =====================================
          FOOTER
          ===================================== */}

      <Footer />

    </div>
  );
}

export default App;