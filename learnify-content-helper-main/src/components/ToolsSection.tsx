
import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tools = [
  {
    icon: "✏️",
    title: "Assistente de Aprendizagem",
    description:
      "Obtenha explicações detalhadas sobre qualquer assunto, desde matemática até literatura, com nosso assistente inteligente personalizado.",
  },
  {
    icon: "📚",
    title: "Gerador de Conteúdo",
    description:
      "Crie facilmente poemas, blogs, ensaios e outros textos acadêmicos com nossa ferramenta de geração de conteúdo inteligente.",
  },
  {
    icon: "🌎",
    title: "Idiomas e Gramática",
    description:
      "Traduza textos para diferentes idiomas e verifique a gramática dos seus trabalhos acadêmicos com precisão.",
  },
  {
    icon: "📝",
    title: "Ajudante de Ensaios",
    description:
      "Aprimore seus textos acadêmicos com sugestões inteligentes de paráfrase e estruturação de conteúdo.",
  },
  {
    icon: "📋",
    title: "Resumidor Inteligente",
    description:
      "Resuma textos, livros e extraia palavras-chave automaticamente, otimizando seu tempo de estudo e revisão.",
  },
  {
    icon: "💻",
    title: "Aprimorador de Código",
    description:
      "Melhore, otimize e corrija seu código com sugestões inteligentes para projetos de programação.",
  },
];

const ToolsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    // Observe elements to animate when scrolling into view
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -100px 0px"
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const cards = entry.target.querySelectorAll('.tool-card');
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('scale-in');
              card.classList.remove('opacity-0');
            }, index * 100);
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
    <section ref={sectionRef} id="recursos" className="py-16 md:py-24 px-6 md:px-10 bg-white relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-purple-100 opacity-20 blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blue-100 opacity-30 blur-xl"></div>
      </div>
      
      <div className="text-center mb-12 slide-in-bottom">
        <div className="inline-block bg-blue-100 text-[#6366F1] px-4 py-1 rounded-full text-sm font-medium mb-4">
          Recursos
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ferramentas de <span className="text-gradient">Aprendizado Inteligente</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Nossa plataforma oferece recursos avançados para transformar sua experiência de aprendizado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10">
        {tools.map((tool, index) => (
          <div key={index} className={cn(
            "group p-1 tool-card opacity-0 transition-all duration-500",
            index % 3 === 0 && "border-t-4 border-indigo-500",
            index % 3 === 1 && "border-t-4 border-purple-500",
            index % 3 === 2 && "border-t-4 border-pink-500",
          )}>
            <Card className={cn("tool-card scale-in hover-lift transition-all duration-500", index % 2 === 0 ? "hover-lift" : "hover-lift-alt")}>
              <CardContent className="p-6">
                <div className="mb-5">
                  <div className="inline-block bg-blue-50 rounded-xl p-3 floating">
                    <span className="text-2xl">{tool.icon}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{tool.title}</h3>
                <p className="text-gray-600 mb-4">{tool.description}</p>
                <div className="text-[#6366F1] font-medium flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  Saiba mais 
                  <svg className="w-4 h-4 ml-1 group-hover:ml-2 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ToolsSection;
