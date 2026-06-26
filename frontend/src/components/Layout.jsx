import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">📦</span>
          <span>Gestao de Deposito</span>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            Catalogo
          </NavLink>
          <NavLink to="/cadastro">Novo item</NavLink>
          <NavLink to="/categorias">Categorias</NavLink>
        </nav>
        <div className="user-area">
          <span className="user-name">{user?.username}</span>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
