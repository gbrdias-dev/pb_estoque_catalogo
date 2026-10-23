
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/home.jsx";
import Catalog from "./pages/Catalogo/catalogo.jsx";
import Login from "./pages/Login/login.jsx";
import Dashboard from "./pages/Admin/dashboard.jsx";
import Products from "./pages/Admin/produtos.jsx";
import Stock from "./pages/Admin/estoque.jsx";
import Suppliers from "./pages/Admin/fornecedores.jsx";
import Usuarios from "./pages/Admin/usuarios.jsx";
import ProductDetails from "./pages/Produto/ProductDetails";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/acesso-pb" element={<Login />} />
        <Route path="/produto/:id" element={<ProductDetails />} />

        {/* Rotas administrativas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/produtos" element={<Products />} />
          <Route path="/admin/estoque" element={<Stock />} />
          <Route path="/admin/fornecedores" element={<Suppliers />} />
          <Route path="/admin/usuarios" element={<Usuarios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
