import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../firebase/firebase";

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (currentUser) {
          try {
            // Refresh Firebase user data
            await currentUser.reload();

            setUser(auth.currentUser);
          } catch (error) {
            console.error(
              "Unable to refresh user:",
              error
            );

            setUser(currentUser);
          }
        } else {
          setUser(null);
        }

        setChecking(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Firebase is still checking authentication
  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        <div className="text-center">

          <div className="w-10 h-10 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin mx-auto" />

          <p className="text-slate-400 mt-4">
            Checking your account...
          </p>

        </div>

      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Logged in but email not verified
  if (!user.emailVerified) {
    return (
      <Navigate
        to="/verify-email"
        replace
      />
    );
  }

  // Logged in + verified
  return children;
}

export default ProtectedRoute;