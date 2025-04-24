import React, { useState } from "react";
import styles from "../pages/inicio.module.css";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  mode: "login" | "signup";
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, mode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (email && password && (mode === "login" || name)) {
        onClose();
      } else {
        setError("Preencha todos os campos corretamente.");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal"]}>
        <button className={styles["modal-close"]} onClick={onClose}>&times;</button>
        <h2>{mode === "login" ? "Entrar" : "Cadastrar"}</h2>
        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className={styles["form-group"]}>
              <label>Nome</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div className={styles["form-group"]}>
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles["form-group"]}>
            <label>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className={styles["btn"]} disabled={loading}>
            {loading ? "Enviando..." : mode === "login" ? "Entrar" : "Cadastrar"}
          </button>
          {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
