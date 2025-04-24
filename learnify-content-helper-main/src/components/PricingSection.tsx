
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type PlanFeature = {
  feature: string;
  included: boolean;
};

type Plan = {
  title: string;
  price: string;
  monthly: number;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
};

const plans: Plan[] = [
  {
    title: "Estudante",
    price: "R$29",
    monthly: 29,
    description: "Perfeito para estudantes do ensino médio que buscam apoio nos estudos.",
    features: [
      { feature: "Assistente de Aprendizagem (5 matérias)", included: true },
      { feature: "Gerador de Redações (5/mês)", included: true },
      { feature: "Tradutor de Idiomas Básico", included: true },
      { feature: "Resumidor de Textos (2000 palavras)", included: true },
      { feature: "Aprimorador de Código", included: false },
      { feature: "Análise de Escrita", included: false },
    ],
  },
  {
    title: "Intermediário",
    price: "R$49",
    monthly: 49,
    description: "Ideal para estudantes avançados",
    popular: true,
    features: [
      { feature: "Assistente de Escrita Acadêmica", included: true },
      { feature: "Corretor Avançado de Trabalhos", included: true },
      { feature: "Biblioteca de Conteúdo Ilimitada", included: true },
      { feature: "Gerador de Citações Avançado", included: true },
      { feature: "Corretor de Redações", included: true },
      { feature: "Gerador de Redações", included: true },
      { feature: "Mapa Mental AI", included: true },
      { feature: "Suporte Premium 24/7", included: true },
    ],
  },
  {
    title: "Universitário",
    price: "R$129",
    monthly: 129,
    description: "Ideal para Graduação e Pós",
    features: [
      { feature: "Todas as funcionalidades do Plano Intermediário", included: true },
      { feature: "Assistente de Pesquisa Acadêmica", included: true },
      { feature: "Gerador de Citações e Referências", included: true },
      { feature: "Análise de Artigos Científicos", included: true },
      { feature: "Monitor de Prazos", included: true },
      { feature: "Simulador de Defesa", included: true },
      { feature: "Gestão Financeira", included: true },
      { feature: "Assistente de Metodologia", included: true },
      { feature: "Análise de Plágio (avançada e ilimitada)", included: true },
      { feature: "IA avançada personalizada", included: true },
      { feature: "Suporte prioritário 24/7", included: true },
    ],
  },
];

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Calcula o valor anual e economia baseado no preço mensal
  const getAnnualPrice = (monthly: number) => Math.round(monthly * 12 * 0.8);
  const getAnnualOriginal = (monthly: number) => monthly * 12;
  const getAnnualSavings = (monthly: number) => getAnnualOriginal(monthly) - getAnnualPrice(monthly);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -100px 0px"
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const cards = entry.target.querySelectorAll('.pricing-card');
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('slide-in-bottom');
              card.classList.remove('opacity-0');
            }, index * 150);
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
    <section ref={sectionRef} id="planos" className="py-16 md:py-24 px-6 md:px-10 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full opacity-30 blur-3xl"></div>
      </div>
      
      <div className="text-center mb-12 slide-in-bottom">
        <div className="inline-block bg-blue-100 text-[#6366F1] px-4 py-1 rounded-full text-sm font-medium mb-4">
          Planos Acessíveis
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
          Escolha o Plano <span className="text-gradient">Ideal</span> para Você
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto mt-4">
          Oferecemos planos personalizados para cada tipo de estudante, desde iniciantes até profissionais em
          busca de aperfeiçoamento.
        </p>
      </div>

      <div className="flex justify-center items-center space-x-4 mb-12 scale-in">
        <span className={cn("text-sm font-medium", !isAnnual && "text-[#6366F1]")}>Mensal</span>
        <Switch
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
          className="data-[state=checked]:bg-[#6366F1]"
        />
        <span className={cn("text-sm font-medium", isAnnual && "text-[#6366F1]")}>
          Anual <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full ml-1">Economize 20%</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10">
        {plans.map((plan, index) => {
  const annualTotal = getAnnualPrice(plan.monthly);
  const annualOriginal = getAnnualOriginal(plan.monthly);
  const annualSavings = getAnnualSavings(plan.monthly);
  return (
    <div key={index} className="flex pricing-card opacity-0" style={{transitionDelay: `${index * 0.1}s`}}>
      <Card className={cn(
        "w-full border transform transition-all duration-500",
        plan.popular ? "border-[#6366F1] shadow-xl relative hover-lift" : "hover-scale"
      )}>
        {plan.popular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
            Mais Popular
          </div>
        )}
        <CardHeader>
  <CardTitle className="text-2xl font-bold">{plan.title}</CardTitle>
  <div className="mt-4 mb-2">
    {isAnnual ? (
      <>
        <span className="text-4xl font-bold text-gradient">
          R${Math.floor(annualTotal / 12)}
        </span>
        <span className="text-gray-500 text-sm">/mês</span>
        <div className="text-lg font-semibold mt-1">
          <span className="text-gradient">R${annualTotal}</span> <span className="text-gray-500 text-sm">/ano</span>
        </div>
        <div className="text-green-700 bg-green-100 rounded px-2 py-0.5 text-xs inline-block mt-1">
          Economize R${annualSavings} por ano
        </div>
      </>
    ) : (
      <>
        <span className="text-4xl font-bold text-gradient">{plan.price}</span>
        <span className="text-gray-500 text-sm">/mês</span>
      </>
    )}
  </div>
  <div className="text-sm text-gray-500 mb-4">
    {isAnnual ? "Cobrado anualmente" : "Cobrado mensalmente"}
  </div>
  <p className="text-gray-600 mb-6">{plan.description}</p>
</CardHeader>
<CardContent>
  <ul className="space-y-3">
    {plan.features.map((feature, i) => (
      <li key={i} className="flex items-start">
        <div className="text-[#6366F1] mr-2">
          {feature.included ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <span className={cn("text-sm", !feature.included && "text-gray-400")}>{feature.feature}</span>
      </li>
    ))}
  </ul>
  <Button className={cn(
    "w-full mt-8 hover-scale",
    plan.popular
      ? "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5355d1] hover:to-[#7B4CF5] text-white shadow-lg"
      : "bg-[#6366F1] hover:bg-[#5355d1] text-white"
  )}>
    Começar Agora
  </Button>
</CardContent>
</Card>
</div>
);
})}
</div>
</section>
);
};

export default PricingSection;
