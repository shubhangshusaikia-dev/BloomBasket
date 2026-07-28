import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";

import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

import { auth } from "../firebase/firebase";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [needsVerification, setNeedsVerification] =
    useState(false);

  function handleChange(e) {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setNeedsVerification(false);

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      // Remember Me
      await setPersistence(
        auth,
        rememberMe
          ? browserLocalPersistence
          : browserSessionPersistence
      );

      // Login
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          formData.email.trim(),
          formData.password
        );

      // Check verification
      await userCredential.user.reload();

      if (!userCredential.user.emailVerified) {
        setNeedsVerification(true);

        // IMPORTANT:
        // Firebase authenticated the user already,
        // so sign them out again.
        await signOut(auth);

        setError(
          "Your email address has not been verified. Check your inbox or use the button below to resend the verification email."
        );

        return;
      }

      setSuccess("Login successful!");

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);

      switch (err.code) {
        case "auth/invalid-credential":
          setError("Invalid email or password.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/user-disabled":
          setError("This account has been disabled.");
          break;

        case "auth/too-many-requests":
          setError(
            "Too many attempts. Please wait before trying again."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Network error. Check your internet connection."
          );
          break;

        default:
          setError(
            err.message || "Unable to sign in."
          );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!formData.email || !formData.password) {
      setError(
        "Enter your email and password first."
      );
      return;
    }

    try {
      setResending(true);
      setError("");
      setSuccess("");

      // Temporarily sign in
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          formData.email.trim(),
          formData.password
        );

      await userCredential.user.reload();

      // Already verified?
      if (userCredential.user.emailVerified) {
        setNeedsVerification(false);

        setSuccess(
          "Your email is already verified. You can log in now."
        );

        await signOut(auth);

        return;
      }

      // Send verification
      await sendEmailVerification(
        userCredential.user
      );

      // Sign out again
      await signOut(auth);

      setSuccess(
        "Verification email sent. Check your inbox, Spam, and Promotions folders."
      );

      setNeedsVerification(true);
    } catch (err) {
      console.error(
        "Verification email error:",
        err
      );

      // Make sure temporary login doesn't remain active
      try {
        if (auth.currentUser) {
          await signOut(auth);
        }
      } catch {
        // Ignore sign-out cleanup errors
      }

      switch (err.code) {
        case "auth/too-many-requests":
          setError(
            "Too many verification requests. Please wait before trying again."
          );
          break;

        case "auth/invalid-credential":
          setError(
            "Invalid email or password."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Network error. Check your internet connection."
          );
          break;

        default:
          setError(
            err.message ||
              "Unable to send verification email."
          );
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-10">

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8">

        <h1 className="text-4xl font-bold text-center text-white">
          Welcome Back
        </h1>

        <p className="text-slate-400 text-center mt-3">
          Sign in to your BloomBasket account
        </p>

        {/* Error */}

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/40 text-red-300 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Success */}

        {success && (
          <div className="mt-6 bg-green-500/10 border border-green-500/40 text-green-300 p-4 rounded-xl">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          {/* Email */}

          <div className="relative">

            <FiMail className="absolute left-4 top-4 text-slate-400" />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-violet-500 text-white"
            />

          </div>

          {/* Password */}

          <div className="relative">

            <FiLock className="absolute left-4 top-4 text-slate-400" />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-12 outline-none focus:border-violet-500 text-white"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (current) => !current
                )
              }
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              {showPassword ? (
                <FiEyeOff />
              ) : (
                <FiEye />
              )}
            </button>

          </div>

          {/* Remember + Forgot */}

          <div className="flex items-center justify-between gap-4">

            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">

              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(
                    e.target.checked
                  )
                }
                className="accent-violet-600"
              />

              Remember Me

            </label>

            <Link
              to="/forgot-password"
              className="text-violet-400 hover:text-violet-300 text-sm"
            >
              Forgot Password?
            </Link>

          </div>

          {/* Login */}

          <button
            type="submit"
            disabled={loading || resending}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition text-white"
          >
            {loading
              ? "Signing In..."
              : "Login"}
          </button>

          {/* Resend Verification */}

          {needsVerification && (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending || loading}
              className="w-full border border-violet-500 text-violet-400 hover:bg-violet-500/10 disabled:opacity-50 py-3 rounded-xl font-semibold transition"
            >
              {resending
                ? "Sending..."
                : "Resend Verification Email"}
            </button>
          )}

        </form>

        <p className="text-center text-slate-400 mt-8">

          Don't have an account?

          <Link
            to="/register"
            className="ml-2 text-violet-400 hover:text-violet-300"
          >
            Register
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;