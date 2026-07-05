import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import type { Role } from "../api/types";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState<Role>("NURSE");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({ email, password, role, displayName, city });
      navigate(role === "NURSE" ? "/dashboard/nurse" : "/dashboard/client");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Errore imprevisto");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page auth-page">
      <form className="card auth-form" onSubmit={handleSubmit}>
        <h1>Crea un account</h1>

        <label>Sono un…</label>
        <div className="role-toggle">
          <button
            type="button"
            className={role === "NURSE" ? "active" : ""}
            onClick={() => setRole("NURSE")}
          >
            Infermiere/a
          </button>
          <button
            type="button"
            className={role === "CLIENT" ? "active" : ""}
            onClick={() => setRole("CLIENT")}
          >
            Cliente
          </button>
        </div>

        <label htmlFor="displayName">Nome e cognome / Ragione sociale</label>
        <input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />

        <label htmlFor="city">Città</label>
        <input id="city" value={city} onChange={(e) => setCity(e.target.value)} />

        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Creazione…" : "Registrati"}
        </button>
      </form>
    </div>
  );
}
