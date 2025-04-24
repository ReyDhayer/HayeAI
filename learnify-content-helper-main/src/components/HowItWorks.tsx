
import { useEffect, useRef } from "react";

interface StepCardProps {
  number: string;
  icon: string;
  title: string;
  description: string;
  delay?: number;
}

const StepCard = ({ number, icon, title, description, delay = 0 }: StepCardProps) => (
  <div className="bg-white rounded-xl p-6 flex flex-col items-center text-center relative shadow-lg hover-lift opacity-0 transition-all duration-500" style={{animationDelay: `${delay}ms`}}>
    <div className="absolute -top-5 h-12 w-12 rounded-full bg-gradient-to-r from-[#6366F1] to-[#7C3AED] flex items-center justify-center text-white font-bold shadow-lg transform -translate-y-2">
      {number}
    </div>
    
    <div className="mt-8 mb-4">
      <div className="text-[#6366F1] text-4xl floating">{icon}</div>
    </div>
    
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const HowItWorks = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -100px 0px"
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const stepCards = entry.target.querySelectorAll('.bg-white');
          stepCards.forEach((card) => {
            card.classList.add('slide-in-bottom');
            card.classList.remove('opacity-0');
          });
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section ref={sectionRef} id="como-funciona" className="py-16 md:py-24 px-6 md:px-10 bg-gray-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -right-10 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply opacity-10 animate-pulse"></div>
        <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-pink-200 rounded-full mix-blend-multiply opacity-10 animate-pulse delay-200"></div>
      </div>

      <div className="text-center mb-16 relative z-10 slide-in-bottom">
        <div className="inline-block bg-blue-100 text-[#6366F1] px-4 py-1 rounded-full text-sm font-medium mb-4">
          Como Começar
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
          Como o <span className="text-gradient">HayeAI</span> Funciona
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mt-4">
          Nossa plataforma foi desenvolvida para tornar seu aprendizado mais eficiente e produtivo, com
          ferramentas inteligentes que se adaptam ao seu ritmo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto relative z-10">
        <StepCard 
          number="1"
          icon="👤"
          title="Crie Sua Conta"
          description="Comece criando sua conta gratuita e escolha as áreas de estudo que mais interessam você."
          delay={100}
        />
        
        <StepCard 
          number="2"
          icon="✏️"
          title="Escolha sua Ferramenta"
          description="Selecione entre nosso conjunto de ferramentas inteligentes: assistente de aprendizagem, gerador de conteúdo, tradutor, resumidor e muito mais."
          delay={200}
        />
        
        <StepCard 
          number="3"
          icon="🚀"
          title="Use a IA ao seu Favor"
          description="Deixe nossa IA ajudar você a estudar, criar conteúdo, melhorar textos e código, traduzir idiomas e resumir materiais complexos."
          delay={300}
        />
      </div>
      
      <div className="mt-16 max-w-5xl mx-auto relative z-10">
        <StepCard 
          number="4"
          icon="⭐"
          title="Alcance Seus Objetivos"
          description="Melhore seu desempenho acadêmico com ferramentas inteligentes que tornam o aprendizado mais eficiente e produtivo."
          delay={400}
        />
      </div>

      {/* Animated connection lines between steps */}
      <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/2 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200">
          <path d="M100,100 C200,50 300,150 400,100 C500,50 600,150 700,100" 
                stroke="#6366F1" 
                strokeWidth="2" 
                strokeDasharray="5,5" 
                fill="none" 
                className="path-animation" />
        </svg>
      </div>
    </section>
  );
};

export default HowItWorks;
