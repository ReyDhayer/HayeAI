
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

const CTASection = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const elements = entry.target.querySelectorAll('.animate-on-scroll');
          elements.forEach((el, index) => {
            setTimeout(() => {
              el.classList.add('fade-in');
              el.classList.remove('opacity-0');
            }, index * 200);
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
    <section 
      ref={sectionRef}
      className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white py-16 md:py-20 px-6 md:px-10 relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-purple-400 mix-blend-overlay opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-blue-400 mix-blend-overlay opacity-20 animate-pulse delay-700"></div>
        
        {/* Animated particles */}
        <div className="hidden md:block absolute top-10 left-[10%] w-3 h-3 rounded-full bg-white opacity-20 floating"></div>
        <div className="hidden md:block absolute top-20 right-[20%] w-2 h-2 rounded-full bg-white opacity-30 floating animate-delay-300"></div>
        <div className="hidden md:block absolute bottom-10 left-[30%] w-4 h-4 rounded-full bg-white opacity-20 floating animate-delay-200"></div>
        <div className="hidden md:block absolute bottom-32 right-[35%] w-3 h-3 rounded-full bg-white opacity-30 floating animate-delay-400"></div>
        
        {/* Light beam effect */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-on-scroll opacity-0">
          Pronto para <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-yellow-200">Transformar</span> seu Aprendizado?
        </h2>
        <p className="text-lg md:text-xl opacity-90 mb-10 max-w-3xl mx-auto animate-on-scroll opacity-0">
          Junte-se a milhares de estudantes que já estão aproveitando o poder da IA para melhorar 
          seus estudos.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4 animate-on-scroll opacity-0">
          <Button 
            className="bg-white text-[#6366F1] hover:bg-gray-100 text-lg font-medium px-8 py-6 hover-scale shadow-lg"
          >
            Ver Demonstração
          </Button>
          <Button 
            className="bg-[#6366F1] border border-white text-white hover:bg-[#5355d1] text-lg font-medium px-8 py-6 btn-pulse shadow-lg"
          >
            Experimente Agora
          </Button>
        </div>
        
        <div className="mt-16 grid grid-cols-3 gap-4 md:gap-8 animate-on-scroll opacity-0">
          <div className="flex flex-col items-center bg-white bg-opacity-10 rounded-lg p-4 hover-lift backdrop-blur-sm">
            <div className="text-3xl mb-2">🎓</div>
            <p className="text-sm md:text-base font-medium">Aprovado por Educadores</p>
          </div>
          <div className="flex flex-col items-center bg-white bg-opacity-10 rounded-lg p-4 hover-lift backdrop-blur-sm">
            <div className="text-3xl mb-2">🔒</div>
            <p className="text-sm md:text-base font-medium">Privacidade Garantida</p>
          </div>
          <div className="flex flex-col items-center bg-white bg-opacity-10 rounded-lg p-4 hover-lift backdrop-blur-sm">
            <div className="text-3xl mb-2">💯</div>
            <p className="text-sm md:text-base font-medium">Resultados Comprovados</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
