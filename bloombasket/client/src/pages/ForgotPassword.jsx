import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { FiMail } from "react-icons/fi";
import { auth } from "../firebase/firebase";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, email);

      setSuccess(
        "Password reset email sent successfully. Please check your inbox."
      );

      setEmail("");
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account exists with this email.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email.");
          break;

        default:
          setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8">

        <h1 className="text-4xl font-bold text-white text-center">
          Forgot Password
        </h1>

        <p className="text-slate-400 text-center mt-3">
          Enter your email to receive a password reset link.
        </p>

        {error && (
          <div className="mt-6 bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 bg-green-500/20 border border-green-500 text-green-300 p-3 rounded-xl">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8"
        >

          <div className="relative">

            <FiMail className="absolute left-4 top-4 text-slate-400" />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-violet-500 text-white"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 py-3 rounded-xl font-semibold transition"
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </button>

        </form>

        <p className="text-center text-slate-400 mt-8">

          Remember your password?

          <Link
            to="/login"
            className="ml-2 text-violet-400 hover:text-violet-300"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default ForgotPassword;