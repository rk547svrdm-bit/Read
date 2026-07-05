import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        NurseMarket
      </Link>
      <nav className="navbar-links">
        <Link to="/">Infermieri</Link>
        <Link to="/listings">Aste aperte</Link>
        {user?.role === "NURSE" && <Link to="/dashboard/nurse">Il mio profilo</Link>}
        {user?.role === "CLIENT" && <Link to="/dashboard/client">Le mie offerte</Link>}
      </nav>
      <div className="navbar-auth">
        {user ? (
          <>
            <span className="navbar-user">{user.email}</span>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Esci
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Accedi</Link>
            <Link to="/register" className="btn-primary">
              Registrati
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
