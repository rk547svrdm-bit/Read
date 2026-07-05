import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./Avatar";
import { GavelIcon } from "./Icon";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-brand-mark">
          <GavelIcon size={18} />
        </span>
        Bay Nurse
      </Link>
      <nav className="navbar-links">
        <Link to="/">Infermieri</Link>
        <Link to="/auctions">Aste aperte</Link>
        {user?.role === "NURSE" && <Link to="/dashboard/nurse">Il mio profilo</Link>}
        {user?.role === "CLIENT" && <Link to="/dashboard/client">Le mie offerte</Link>}
      </nav>
      <div className="navbar-auth">
        {user ? (
          <>
            <button
              className="navbar-user"
              onClick={() => navigate(user.role === "NURSE" ? "/dashboard/nurse" : "/dashboard/client")}
            >
              <Avatar photoUrl={null} name={user.email} size={28} />
              <span>{user.email}</span>
            </button>
            <button
              className="btn-ghost"
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
            <Link to="/login" className="btn-ghost">
              Accedi
            </Link>
            <Link to="/register" className="btn-primary">
              Registrati
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
