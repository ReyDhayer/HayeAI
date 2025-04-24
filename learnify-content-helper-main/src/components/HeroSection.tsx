
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const HeroSection = () => {
  useEffect(() => {
    // Animações com interseção de observador para carregar elementos quando visíveis
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px"
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative bg-[#2D1B69] text-white py-20 md:py-32 overflow-hidden">
      {/* Background network effect with animation */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/public/lovable-uploads/829665bf-8df5-4881-9e02-dbba219e9bce.png')] bg-cover bg-center"></div>
      </div>
      
      {/* Animated geometric shapes */}
      <div className="hidden md:block absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 opacity-20 blur-xl floating animate-delay-200"></div>
      <div className="hidden md:block absolute bottom-20 right-10 w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 opacity-20 blur-xl floating animate-delay-300"></div>
      <div className="hidden md:block absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 opacity-20 blur-xl floating animate-delay-400"></div>
      
      <div className="container mx-auto px-6 md:px-10 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 slide-in-bottom">
            <h1 className="text-[#6366F1] text-2xl md:text-3xl font-bold">HayeAI</h1>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 slide-in-bottom animate-delay-100">
            Revolucione seus <span className="text-gradient">Estudos</span> com <span className="block text-gradient">Inteligência Artificial</span>
          </h2>
          
          <p className="text-lg md:text-xl mb-10 opacity-90 max-w-3xl mx-auto slide-in-bottom animate-delay-200">
            Uma plataforma completa que combina IA avançada para transformar sua experiência de 
            aprendizado, desde explicações detalhadas até resumos inteligentes.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 slide-in-bottom animate-delay-300">
            <Button className="btn-primary text-lg px-8 py-6 btn-pulse hover-scale">
              Comece Agora
            </Button>
            <Button variant="outline" className="btn-secondary text-lg px-8 py-6 hover-scale">
              Como Funciona
            </Button>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center slide-in-bottom animate-delay-400 hover-lift">
              <div className="bg-pink-100 bg-opacity-20 p-3 rounded-full mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-lg">Aprendizado Personalizado</p>
            </div>
            
            <div className="flex flex-col items-center slide-in-bottom animate-delay-500 hover-lift">
              <div className="bg-blue-100 bg-opacity-20 p-3 rounded-full mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-lg">Resultados Rápidos</p>
            </div>
            
            <div className="flex flex-col items-center slide-in-bottom animate-delay-500 hover-lift">
              <div className="bg-purple-100 bg-opacity-20 p-3 rounded-full mb-4">
                <svg className="w-6 h-6 spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg">Disponível 24/7</p>
            </div>
          </div>
          
          <div className="mt-14 grid grid-cols-2 gap-8">
            <div className="flex flex-col items-center scale-in hover-lift">
              <div className="text-4xl font-bold text-[#6366F1]">98%</div>
              <div className="text-sm">
                <p>Aprovação</p>
                <p className="text-xs opacity-70">Alunos satisfeitos entre nossos clientes</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center scale-in animate-delay-200 hover-lift">
              <div className="text-4xl font-bold text-[#6366F1]">1M+</div>
              <div className="text-sm">
                <p>Estudantes</p>
                <p className="text-xs opacity-70">Usando nossa plataforma</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
