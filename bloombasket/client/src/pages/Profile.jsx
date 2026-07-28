import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiLogOut,
} from "react-icons/fi";

import { useAuth } from "../context/AuthContext";

function Profile() {
  const { currentUser, logout } = useAuth();

  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  }

  function formatDate(date) {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">

      <div className="max-w-4xl mx-auto">

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10">

          <div className="flex flex-col items-center">

            <div className="w-28 h-28 rounded-full bg-violet-600 flex items-center justify-center text-white text-5xl font-bold">

              {currentUser?.displayName
                ? currentUser.displayName.charAt(0).toUpperCase()
                : "U"}

            </div>

            <h1 className="mt-6 text-3xl font-bold text-white">

              {currentUser?.displayName || "User"}

            </h1>

            <p className="text-slate-400 mt-2">
              BloomBasket Customer
            </p>

          </div>

          <div className="mt-10 space-y-5">

            <div className="flex items-center gap-4 bg-slate-800 p-5 rounded-2xl">

              <FiUser className="text-violet-400 text-2xl" />

              <div>
                <p className="text-slate-400 text-sm">
                  Full Name
                </p>

                <p className="text-white">
                  {currentUser?.displayName || "Not Available"}
                </p>
              </div>

            </div>

            <div className="flex items-center gap-4 bg-slate-800 p-5 rounded-2xl">

              <FiMail className="text-violet-400 text-2xl" />

              <div>
                <p className="text-slate-400 text-sm">
                  Email
                </p>

                <p className="text-white">
                  {currentUser?.email}
                </p>
              </div>

            </div>

            <div className="flex items-center gap-4 bg-slate-800 p-5 rounded-2xl">

              <FiCalendar className="text-violet-400 text-2xl" />

              <div>
                <p className="text-slate-400 text-sm">
                  Account Created
                </p>

                <p className="text-white">
                  {formatDate(currentUser?.metadata?.creationTime)}
                </p>
              </div>

            </div>

            <div className="flex items-center gap-4 bg-slate-800 p-5 rounded-2xl">

              <FiCalendar className="text-violet-400 text-2xl" />

              <div>
                <p className="text-slate-400 text-sm">
                  Last Sign In
                </p>

                <p className="text-white">
                  {formatDate(currentUser?.metadata?.lastSignInTime)}
                </p>
              </div>

            </div>

          </div>

          <div className="mt-10 flex flex-wrap gap-4">

            <button
              onClick={() => navigate("/shop")}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-semibold transition"
            >
              Continue Shopping
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-white font-semibold transition"
            >
              <FiLogOut />

              Logout
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;