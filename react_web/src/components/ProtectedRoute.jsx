
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getAdminSession } from "../services/api";

function ProtectedRoute() {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    let active = true;

    getAdminSession()
      .then((data) => {
        if (active) {
          setAuthenticated(data.authenticated === true);
        }
      })
      .catch(() => {
        if (active) {
          setAuthenticated(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (authenticated === null) {
    return <p>Verificando acesso...</p>;
  }

  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
