import { useState, useRef, useEffect } from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  FiSearch,
  FiHeart,
  FiShoppingCart,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiPackage,
} from "react-icons/fi";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import logo from "../assets/logo.png";

function Navbar() {
  const navigate = useNavigate();

  const { cartItems } = useCart();
  const { currentUser, logout } = useAuth();

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const [userMenu, setUserMenu] =
    useState(false);

  const menuRef = useRef(null);

  const totalItems = cartItems.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setUserMenu(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  async function handleLogout() {
    try {
      await logout();

      setUserMenu(false);
      setMobileMenu(false);

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  const desktopLink = ({ isActive }) =>
    isActive
      ? "text-violet-400 font-semibold"
      : "text-slate-300 hover:text-white transition";

  const mobileLink = ({ isActive }) =>
    isActive
      ? "py-3 text-violet-400 font-semibold"
      : "py-3 text-slate-300 hover:text-violet-400 transition";

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-center justify-between h-24">

          {/* LOGO */}

          <Link
            to="/"
            className="flex items-center flex-shrink-0"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            <img
              src={logo}
              alt="BloomBasket"
              className="h-16 md:h-20 w-auto object-contain"
            />
          </Link>

          {/* DESKTOP NAVIGATION */}

          <nav className="hidden lg:flex items-center gap-10">

            <NavLink
              to="/"
              className={desktopLink}
            >
              Home
            </NavLink>

            <NavLink
              to="/shop"
              className={desktopLink}
            >
              Shop
            </NavLink>

            <NavLink
              to="/cart"
              className={desktopLink}
            >
              Cart
            </NavLink>

            {/* Show My Orders when logged in */}

            {currentUser && (
              <NavLink
                to="/orders"
                className={desktopLink}
              >
                My Orders
              </NavLink>
            )}

          </nav>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-5">

            {/* SEARCH */}

            <button
              type="button"
              aria-label="Search"
              className="text-slate-300 hover:text-violet-400 transition"
            >
              <FiSearch size={22} />
            </button>

            {/* WISHLIST */}

            <button
              type="button"
              aria-label="Wishlist"
              className="text-slate-300 hover:text-violet-400 transition"
            >
              <FiHeart size={22} />
            </button>

            {/* CART */}

            <Link
              to="/cart"
              aria-label="Cart"
              className="relative text-slate-300 hover:text-violet-400 transition"
            >
              <FiShoppingCart size={22} />

              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-violet-600 flex items-center justify-center text-xs text-white font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* LOGGED IN USER */}

            {currentUser ? (
              <div
                className="relative"
                ref={menuRef}
              >

                {/* AVATAR */}

                <button
                  type="button"
                  onClick={() =>
                    setUserMenu(
                      (previous) => !previous
                    )
                  }
                  aria-label="Account menu"
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 transition flex items-center justify-center text-white font-bold text-lg">

                    {currentUser.displayName
                      ? currentUser.displayName
                          .charAt(0)
                          .toUpperCase()
                      : currentUser.email
                        ? currentUser.email
                            .charAt(0)
                            .toUpperCase()
                        : "U"}

                  </div>
                </button>

                {/* ACCOUNT DROPDOWN */}

                {userMenu && (
                  <div className="absolute right-0 mt-4 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">

                    {/* USER INFO */}

                    <div className="px-5 py-4 border-b border-slate-800">

                      <p className="text-white font-semibold truncate">
                        {currentUser.displayName ||
                          "User"}
                      </p>

                      <p className="text-sm text-slate-400 truncate mt-1">
                        {currentUser.email}
                      </p>

                    </div>

                    {/* PROFILE */}

                    <Link
                      to="/profile"
                      onClick={() =>
                        setUserMenu(false)
                      }
                      className="flex items-center gap-3 px-5 py-4 text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      <FiUser size={18} />

                      Profile
                    </Link>

                    {/* MY ORDERS */}

                    <Link
                      to="/orders"
                      onClick={() =>
                        setUserMenu(false)
                      }
                      className="flex items-center gap-3 px-5 py-4 text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      <FiPackage size={18} />

                      My Orders
                    </Link>

                    {/* MY CART */}

                    <Link
                      to="/cart"
                      onClick={() =>
                        setUserMenu(false)
                      }
                      className="flex items-center gap-3 px-5 py-4 text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      <FiShoppingCart
                        size={18}
                      />

                      <span className="flex-1">
                        My Cart
                      </span>

                      {totalItems > 0 && (
                        <span className="bg-violet-600 text-white text-xs min-w-6 h-6 px-1 rounded-full flex items-center justify-center">
                          {totalItems}
                        </span>
                      )}
                    </Link>

                    {/* LOGOUT */}

                    <div className="border-t border-slate-800">

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-4 text-left text-red-400 hover:bg-slate-800 transition"
                      >
                        <FiLogOut
                          size={18}
                        />

                        Logout
                      </button>

                    </div>

                  </div>
                )}

              </div>
            ) : (

              /* LOGGED OUT */

              <div className="hidden md:flex items-center gap-3">

                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:border-violet-500 hover:text-white transition"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition"
                >
                  Register
                </Link>

              </div>
            )}

            {/* MOBILE MENU BUTTON */}

            <button
              type="button"
              aria-label="Menu"
              className="lg:hidden text-white"
              onClick={() =>
                setMobileMenu(
                  (previous) => !previous
                )
              }
            >
              {mobileMenu ? (
                <FiX size={28} />
              ) : (
                <FiMenu size={28} />
              )}
            </button>

          </div>

        </div>

        {/* MOBILE NAVIGATION */}

        {mobileMenu && (
          <div className="lg:hidden pb-6 border-t border-slate-800">

            <nav className="flex flex-col mt-5">

              <NavLink
                to="/"
                onClick={() =>
                  setMobileMenu(false)
                }
                className={mobileLink}
              >
                Home
              </NavLink>

              <NavLink
                to="/shop"
                onClick={() =>
                  setMobileMenu(false)
                }
                className={mobileLink}
              >
                Shop
              </NavLink>

              <NavLink
                to="/cart"
                onClick={() =>
                  setMobileMenu(false)
                }
                className={mobileLink}
              >
                <span className="flex items-center gap-2">

                  Cart

                  {totalItems > 0 && (
                    <span className="bg-violet-600 text-white text-xs min-w-6 h-6 px-1 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}

                </span>
              </NavLink>

              {currentUser ? (
                <>

                  {/* MOBILE ORDERS */}

                  <NavLink
                    to="/orders"
                    onClick={() =>
                      setMobileMenu(false)
                    }
                    className={mobileLink}
                  >
                    My Orders
                  </NavLink>

                  {/* MOBILE PROFILE */}

                  <NavLink
                    to="/profile"
                    onClick={() =>
                      setMobileMenu(false)
                    }
                    className={mobileLink}
                  >
                    Profile
                  </NavLink>

                  {/* MOBILE LOGOUT */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-left py-3 text-red-400 hover:text-red-300 transition"
                  >
                    Logout
                  </button>

                </>
              ) : (
                <>

                  <NavLink
                    to="/login"
                    onClick={() =>
                      setMobileMenu(false)
                    }
                    className={mobileLink}
                  >
                    Login
                  </NavLink>

                  <NavLink
                    to="/register"
                    onClick={() =>
                      setMobileMenu(false)
                    }
                    className={mobileLink}
                  >
                    Register
                  </NavLink>

                </>
              )}

            </nav>

          </div>
        )}

      </div>
    </header>
  );
}

export default Navbar;