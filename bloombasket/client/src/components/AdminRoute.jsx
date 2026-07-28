import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../firebase/firebase";

// Temporary admin authorization.
// Later we'll move the role check to the database.
const ADMIN_UID = "DsiufsHYoCXYFLQWbUSQgU11Z5d2";

function AdminRoute({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) {
          setUser(null);
          setChecking(false);
          return;
        }

        try {
          await currentUser.reload();
          setUser(auth.currentUser);
        } catch (error) {
          console.error(
            "Unable to refresh admin account:",
            error
          );

          setUser(currentUser);
        }

        setChecking(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin mx-auto" />

          <p className="text-slate-400 mt-4">
            Checking admin access...
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

  // Email not verified
  if (!user.emailVerified) {
    return (
      <Navigate
        to="/verify-email"
        replace
      />
    );
  }

  // Logged in, but not the admin
  if (user.uid !== ADMIN_UID) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

export default AdminRoute;