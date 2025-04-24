import React, { useState } from "react";
import styles from "../pages/inicio.module.css";

const testimonials = [
  {
    name: "Ana Clara",
    text: "O HayeAI revolucionou meus estudos! As ferramentas de resumo e explicação são incríveis.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    name: "Lucas Silva",
    text: "A tradução de textos e a verificação gramatical me ajudaram muito na faculdade.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    name: "Mariana Souza",
    text: "A plataforma é fácil de usar e os resultados são rápidos. Recomendo para todos os estudantes!",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg"
  }
];

const TestimonialsSlider: React.FC = () => {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % testimonials.length);
  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  return (
    <div className={styles["testimonials-slider"]}>
      <div className={styles["testimonial-card"]}>
        <img src={testimonials[index].avatar} alt={testimonials[index].name} className={styles["testimonial-avatar"]} />
        <p className={styles["testimonial-text"]}>{testimonials[index].text}</p>
        <div className={styles["testimonial-name"]}>{testimonials[index].name}</div>
      </div>
      <div className={styles["testimonial-controls"]}>
        <button onClick={prev}>&lt;</button>
        <button onClick={next}>&gt;</button>
      </div>
    </div>
  );
};

export default TestimonialsSlider;
