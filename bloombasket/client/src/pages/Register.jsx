import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";

import {
  FiEye,
  FiEyeOff,
  FiUser,
  FiMail,
  FiLock,
} from "react-icons/fi";

import { auth } from "../firebase/firebase";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (
      !name ||
      !email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // Create Firebase account
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          formData.password
        );

      // Save display name
      await updateProfile(
        userCredential.user,
        {
          displayName: name,
        }
      );

      // Send verification email
      await sendEmailVerification(
        userCredential.user
      );

      // Keep user signed in temporarily so
      // VerifyEmail.jsx can resend the email.
      navigate("/verify-email", {
        replace: true,
      });

    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      switch (err.code) {
        case "auth/email-already-in-use":
          setError(
            "An account already exists with this email."
          );
          break;

        case "auth/invalid-email":
          setError(
            "Please enter a valid email address."
          );
          break;

        case "auth/weak-password":
          setError(
            "Password is too weak. Use at least 6 characters."
          );
          break;

        case "auth/operation-not-allowed":
          setError(
            "Email/password registration is not enabled."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Network error. Check your internet connection."
          );
          break;

        case "auth/too-many-requests":
          setError(
            "Too many requests. Please wait and try again."
          );
          break;

        default:
          setError(
            err.message ||
              "Unable to create your account."
          );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-10">

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8">

        <h1 className="text-4xl font-bold text-center text-white">
          Create Account
        </h1>

        <p className="text-slate-400 text-center mt-3">
          Join BloomBasket today
        </p>

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/40 text-red-300 p-4 rounded-xl">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          {/* Name */}

          <div className="relative">

            <FiUser className="absolute left-4 top-4 text-slate-400" />

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-violet-500 text-white"
            />

          </div>

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
              autoComplete="new-password"
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

          {/* Confirm Password */}

          <div className="relative">

            <FiLock className="absolute left-4 top-4 text-slate-400" />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-violet-500 text-white"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition text-white"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <p className="text-center text-slate-400 mt-8">

          Already have an account?

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

export default Register;