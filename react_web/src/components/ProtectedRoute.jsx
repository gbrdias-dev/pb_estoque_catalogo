
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAdminSession } from "../services/api";

function ProtectedRoute() {
  const [authenticated, setAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let active = true;

    // Reinicia a verificação ao acessar uma rota protegida
    setAuthenticated(null);

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
  }, [location.pathname]);

  if (authenticated === null) {
    return <p>Verificando acesso...</p>;
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/acesso-pb"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
