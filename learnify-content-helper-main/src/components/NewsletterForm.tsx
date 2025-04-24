import React, { useState } from "react";
import styles from "../pages/inicio.module.css";

const NewsletterForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    // Simulação de envio
    setTimeout(() => {
      if (email && name) {
        setSuccess(true);
        setName("");
        setEmail("");
      } else {
        setError("Preencha todos os campos corretamente.");
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <form className={styles["newsletter-form"]} onSubmit={handleSubmit}>
      <div className={styles["form-group"]}>
        <h4 className={styles["newsletter-title"]}>Newsletter</h4>
        <label htmlFor="newsletterName" className={styles["form-label"]}>Nome</label>
        <input
          type="text"
          className={styles["newsletter-input"]}
          placeholder="Digite seu nome"
          id="newsletterName"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div className={styles["form-group"]}>
        <label htmlFor="newsletterEmail" className={styles["form-label"]}>Email</label>
        <input
          type="email"
          className={styles["newsletter-input"]}
          placeholder="Digite seu e-mail"
          id="newsletterEmail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <button type="submit" className={styles["newsletter-btn"]} disabled={loading}>
        {loading ? "Enviando..." : "Enviar"}
      </button>
      {success && <div style={{ color: 'green', marginTop: 8 }}>Inscrição realizada com sucesso!</div>}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  );
};

export default NewsletterForm;
