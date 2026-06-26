import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import CadastroItem from "./pages/CadastroItem.jsx";
import Movimentacao from "./pages/Movimentacao.jsx";
import Categorias from "./pages/Categorias.jsx";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Catalogo />} />
        <Route path="/cadastro" element={<CadastroItem />} />
        <Route path="/cadastro/:id" element={<CadastroItem />} />
        <Route path="/movimentacao/:id" element={<Movimentacao />} />
        <Route path="/categorias" element={<Categorias />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
