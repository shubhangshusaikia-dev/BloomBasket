import { useState } from "react";
import { Link } from "react-router-dom";
import {
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import {
  FiMail,
  FiCheckCircle,
} from "react-icons/fi";

import { auth } from "../firebase/firebase";

function VerifyEmail() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function resendEmail() {
    setMessage("");
    setError("");

    const user = auth.currentUser;

    if (!user) {
      setError(
        "Your session has ended. Please log in and resend the verification email."
      );
      return;
    }

    try {
      setLoading(true);

      await sendEmailVerification(user);

      setMessage(
        "Verification email sent. Check your inbox, Spam, and Promotions folders."
      );
    } catch (err) {
      console.error("Verification error:", err);

      if (err.code === "auth/too-many-requests") {
        setError(
          "Too many verification requests. Please wait before trying again."
        );
      } else {
        setError(
          err.message ||
            "Unable to send verification email."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-10">

      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">

        <div className="w-20 h-20 mx-auto rounded-full bg-violet-500/10 flex items-center justify-center">
          <FiMail
            size={38}
            className="text-violet-400"
          />
        </div>

        <h1 className="text-3xl font-bold mt-6">
          Verify Your Email
        </h1>

        <p className="text-slate-400 mt-4">
          We sent a verification link to
        </p>

        <p className="text-violet-400 font-semibold mt-1">
          {auth.currentUser?.email ||
            "your email address"}
        </p>

        <p className="text-slate-400 mt-5">
          Open the email and click the verification
          link. Then return to BloomBasket and log in.
        </p>

        {message && (
          <div className="mt-6 flex gap-3 text-left bg-green-500/10 border border-green-500/30 text-green-300 p-4 rounded-xl">

            <FiCheckCircle
              size={20}
              className="shrink-0 mt-0.5"
            />

            <p>{message}</p>

          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={resendEmail}
          disabled={
            loading || !auth.currentUser
          }
          className="w-full mt-8 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition"
        >
          {loading
            ? "Sending..."
            : "Resend Verification Email"}
        </button>

        <Link
          to="/login"
          onClick={handleLogout}
          className="block mt-5 text-violet-400 hover:text-violet-300"
        >
          Back to Login
        </Link>

      </div>

    </div>
  );
}

export default VerifyEmail;