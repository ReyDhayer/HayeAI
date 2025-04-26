
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
// Removendo importação não utilizada do SDK do Mercado Pago
import { Helmet } from "react-helmet";

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
  // Refs para cada card de plano
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Estado para modal de pagamento
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<any>(null);
  const [form, setForm] = useState({
    email: '',
    metodo: 'pix',
    valor: 0,
    docType: 'CPF',
    docNumber: '',
    cardToken: '',
    installments: 1,
  });

  // Abrir modal e preencher valor
  const handleStartCheckout = (plan: Plan, cardElement?: HTMLDivElement) => {
    setSelectedPlan(plan);
    setForm(f => ({...f, valor: isAnnual ? Math.round(plan.monthly * 12 * 0.8) : plan.monthly }));
    setShowCheckout(true);
    setCheckoutError(null);
    setCheckoutSuccess(null);
    // Scroll até o card do plano selecionado
    setTimeout(() => {
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Enviar pagamento via Mercado Pago
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutLoading(true);
    setCheckoutError(null);
    setCheckoutSuccess(null);
    try {
      // Preparar dados para o Mercado Pago
      const paymentData = {
        ...form,
        // Garantir que o valor seja um número
        valor: Number(form.valor),
        // Garantir que o método de pagamento esteja no formato esperado pelo Mercado Pago
        metodo: form.metodo === 'visa' ? 'visa' : 
                form.metodo === 'master' ? 'master' : 
                form.metodo === 'bolbradesco' ? 'bolbradesco' : 'pix'
      };
      
      console.log('Enviando dados para processamento:', paymentData);
      try {
        // Validar dados antes de enviar
        if (!paymentData.email) {
          throw new Error('Email é obrigatório');
        }
        
        if ((paymentData.metodo === 'bolbradesco' || paymentData.metodo === 'pix') && !paymentData.docNumber) {
          throw new Error('CPF/CNPJ é obrigatório para pagamentos com boleto ou PIX');
        }
        
        const res = await axios.post("/api/pagamento/pagar", paymentData);
        console.log('Resposta do processamento:', res.data);
        setCheckoutSuccess(res.data);
      } catch (axiosError: any) {
        console.error('Erro na requisição:', axiosError);
        if (axiosError.response) {
          // O servidor respondeu com um status de erro
          console.error('Dados da resposta de erro:', axiosError.response.data);
          console.error('Status do erro:', axiosError.response.status);
          setCheckoutError(axiosError.response.data?.error || axiosError.response.data?.details || `Erro ${axiosError.response.status}: ${axiosError.response.statusText}`);
        } else if (axiosError.request) {
          // A requisição foi feita mas não houve resposta
          console.error('Sem resposta do servidor');
          setCheckoutError('Não foi possível conectar ao servidor de pagamento. Verifique sua conexão.');
        } else {
          // Erro na configuração da requisição
          console.error('Erro na configuração da requisição:', axiosError.message);
          setCheckoutError('Erro na configuração da requisição: ' + axiosError.message);
        }
      }
    } catch (err: any) {
      console.error('Erro geral no checkout:', err);
      setCheckoutError('Erro ao processar pagamento: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setCheckoutLoading(false);
    }
  };


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
      {/* Modal de Checkout */}
      {showCheckout && selectedPlan && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Overlay moderno e claro com blur */}
    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm transition-opacity animate-fade-in-fast" onClick={() => setShowCheckout(false)} />
    {/* Modal animado */}
    <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-blue-100 animate-slide-up">
      <button
        className="absolute top-3 right-4 text-gray-400 hover:text-[#6366F1] transition-colors text-2xl"
        onClick={() => setShowCheckout(false)}
        title="Fechar"
        type="button"
        aria-label="Fechar"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] p-3 rounded-full shadow-lg animate-pop">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M7 13l3 3 7-7" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 animate-fade-in">Checkout: {selectedPlan.title}</h3>
        <div className="mb-2 text-lg font-semibold text-[#6366F1] animate-fade-in-delay">
          {isAnnual ? `R$${Math.round(selectedPlan.monthly * 12 * 0.8)} (anual)` : `R$${selectedPlan.monthly} (mensal)`}
        </div>
      </div>
      <form onSubmit={handleCheckout} className="space-y-4 animate-fade-in-delay">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#6366F1] outline-none transition"
            placeholder="Seu melhor email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Método de Pagamento</label>
          <div className="flex gap-2">
            <button type="button" className={`flex-1 px-2 py-2 rounded-lg border transition-all ${form.metodo === 'pix' ? 'border-[#6366F1] bg-gradient-to-r from-blue-100 to-purple-100 text-[#6366F1] font-bold' : 'border-gray-200 bg-white text-gray-500'}`} onClick={() => setForm(f => ({...f, metodo: 'pix'}))}>
              <span role="img" aria-label="Pix">💸</span> Pix
            </button>
            <button type="button" className={`flex-1 px-2 py-2 rounded-lg border transition-all ${form.metodo === 'bolbradesco' ? 'border-[#6366F1] bg-gradient-to-r from-blue-100 to-purple-100 text-[#6366F1] font-bold' : 'border-gray-200 bg-white text-gray-500'}`} onClick={() => setForm(f => ({...f, metodo: 'bolbradesco'}))}>
              <span role="img" aria-label="Boleto">🏦</span> Boleto
            </button>
            <button type="button" className={`flex-1 px-2 py-2 rounded-lg border transition-all ${form.metodo === 'visa' ? 'border-[#6366F1] bg-gradient-to-r from-blue-100 to-purple-100 text-[#6366F1] font-bold' : 'border-gray-200 bg-white text-gray-500'}`} onClick={() => setForm(f => ({...f, metodo: 'visa'}))}>
              <span role="img" aria-label="Cartão">💳</span> Cartão
            </button>
          </div>
        </div>
        {(form.metodo === 'visa' || form.metodo === 'master' || form.metodo === 'bolbradesco' || form.metodo === 'pix') && (
          <div className="animate-fade-in-delay">
            <label className="block text-sm font-medium mb-1">CPF</label>
            <input
              type="text"
              required
              value={form.docNumber}
              onChange={e => setForm(f => ({ ...f, docNumber: e.target.value }))}
              className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#6366F1] outline-none transition"
              placeholder="Digite seu CPF (somente números)"
              pattern="\d{11}"
              maxLength={11}
            />
            <span className="text-xs text-gray-400">Informe o CPF para gerar o pagamento.</span>
          </div>
        )}
        
        {/* Campos para cartão de crédito */}
        {(form.metodo === 'visa' || form.metodo === 'master') && (
          <div className="space-y-3 animate-fade-in-delay">
            <div>
              <label className="block text-sm font-medium mb-1">Número do Cartão</label>
              <input
                type="text"
                required
                id="cardNumber"
                placeholder="Número do cartão"
                className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#6366F1] outline-none transition"
                onChange={e => {
                  // Implementação básica - em produção, use uma biblioteca de processamento de cartão
                  const value = e.target.value.replace(/\D/g, '');
                  e.target.value = value.replace(/(.{4})/g, '$1 ').trim();
                }}
                maxLength={19}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Validade</label>
                <input
                  type="text"
                  required
                  placeholder="MM/AA"
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#6366F1] outline-none transition"
                  onChange={e => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 2) {
                      value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    }
                    e.target.value = value;
                  }}
                  maxLength={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CVV</label>
                <input
                  type="text"
                  required
                  placeholder="Código de segurança"
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#6366F1] outline-none transition"
                  onChange={e => {
                    e.target.value = e.target.value.replace(/\D/g, '');
                  }}
                  maxLength={4}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Nome no Cartão</label>
              <input
                type="text"
                required
                placeholder="Nome como está no cartão"
                className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#6366F1] outline-none transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Parcelas</label>
              <select 
                className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#6366F1] outline-none transition"
                onChange={e => setForm(f => ({ ...f, installments: Number(e.target.value) }))}
                defaultValue="1"
              >
                <option value="1">1x de R${form.valor} (à vista)</option>
                <option value="2">2x de R${Math.ceil(form.valor / 2)}</option>
                <option value="3">3x de R${Math.ceil(form.valor / 3)}</option>
                <option value="6">6x de R${Math.ceil(form.valor / 6)}</option>
                <option value="12">12x de R${Math.ceil(form.valor / 12)}</option>
              </select>
            </div>
          </div>
        )}
        <button
          type="submit"
          disabled={checkoutLoading}
          className={`w-full py-2 rounded-lg font-bold text-white transition-all bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] shadow-md hover:from-[#5355d1] hover:to-[#7B4CF5] focus:ring-2 focus:ring-[#6366F1] focus:outline-none ${checkoutLoading ? 'opacity-60 cursor-wait' : ''}`}
        >
          {checkoutLoading ? (
            <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Processando...</span>
          ) : 'Pagar'}
        </button>
      </form>
      {checkoutError && <div className="mt-4 text-red-600 text-sm animate-fade-in">{checkoutError}</div>}
      {checkoutSuccess && (
        <div className="mt-6 text-center animate-fade-in-delay">
          <b className="text-lg text-[#6366F1] flex items-center justify-center gap-2"><svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#D1FAE5"/><path d="M7 13l3 3 7-7" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Pagamento iniciado!</b>
          {form.metodo === 'pix' && checkoutSuccess.point_of_interaction?.transaction_data?.qr_code_base64 && (
            <>
              <div className="my-2">Escaneie o QR Code abaixo para pagar:</div>
              <img src={`data:image/png;base64,${checkoutSuccess.point_of_interaction.transaction_data.qr_code_base64}`} alt="QR Code Pix" className="mx-auto w-44 h-44 rounded-xl border shadow-md animate-pop" />
              {checkoutSuccess.point_of_interaction.transaction_data.qr_code && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Ou copie o código Pix:</p>
                  <div className="relative">
                    <input 
                      type="text" 
                      readOnly 
                      value={checkoutSuccess.point_of_interaction.transaction_data.qr_code} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-10 text-xs font-mono" 
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(checkoutSuccess.point_of_interaction.transaction_data.qr_code);
                        alert('Código Pix copiado!');
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6366F1] hover:text-[#4F46E5] transition-colors"
                      title="Copiar código Pix"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          {form.metodo === 'bolbradesco' && checkoutSuccess.barcode && (
            <div className="my-2">
              <p>Código do boleto:</p>
              <div className="relative mt-1">
                <input 
                  type="text" 
                  readOnly 
                  value={checkoutSuccess.barcode} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-10 text-xs font-mono" 
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(checkoutSuccess.barcode);
                    alert('Código do boleto copiado!');
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6366F1] hover:text-[#4F46E5] transition-colors"
                  title="Copiar código do boleto"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
              {checkoutSuccess.transaction_details?.external_resource_url && (
                <a 
                  href={checkoutSuccess.transaction_details.external_resource_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-[#6366F1] hover:underline text-sm"
                >
                  Abrir boleto para pagamento
                </a>
              )}
            </div>
          )}
          {form.metodo === 'visa' && checkoutSuccess.status === 'approved' && (
            <div className="my-2 text-green-700 font-semibold">Pagamento aprovado! Obrigado.</div>
          )}
          {form.metodo === 'visa' && checkoutSuccess.status === 'in_process' && (
            <div className="my-2 text-yellow-600 font-semibold">Pagamento em processamento. Você receberá uma confirmação em breve.</div>
          )}
          {form.metodo === 'visa' && checkoutSuccess.status === 'rejected' && (
            <div className="my-2 text-red-600 font-semibold">Pagamento recusado. Por favor, tente novamente com outro cartão.</div>
          )}
          <div className="mt-2 text-xs text-gray-500">ID: {checkoutSuccess.id}</div>
          <button
            className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-bold shadow hover:from-[#5355d1] hover:to-[#7B4CF5] transition"
            onClick={() => setShowCheckout(false)}
          >Fechar</button>
        </div>
      )}
    </div>
  </div>
)}
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
  const isSelected = showCheckout && selectedPlan && selectedPlan.title === plan.title;
  const cardRef = cardRefs[index];
  return (
    <div key={index} ref={el => cardRefs.current[index] = el} className="flex pricing-card opacity-0 relative" style={{transitionDelay: `${index * 0.1}s`}}>
      <Card className={cn(
        "w-full border transform transition-all duration-500",
        plan.popular ? "border-[#6366F1] shadow-xl relative hover-lift" : "hover-scale"
      )}>
        {/* Modal de Checkout LOCAL, acima do card */}
        {isSelected && (
          <div className="absolute left-1/2 -top-6 z-30 w-[360px] max-w-[90vw] -translate-x-1/2 animate-slide-up">
            <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl p-8 border border-blue-100">
              <button
                className="absolute top-3 right-4 text-gray-400 hover:text-[#6366F1] transition-colors text-2xl"
                onClick={() => setShowCheckout(false)}
                title="Fechar"
                type="button"
                aria-label="Fechar"
              >
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] p-3 rounded-full shadow-lg animate-pop">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M7 13l3 3 7-7" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 animate-fade-in">Checkout: {plan.title}</h3>
                <div className="mb-2 text-lg font-semibold text-[#6366F1] animate-fade-in-delay">
                  {isAnnual ? `R$${Math.round(plan.monthly * 12 * 0.8)} (anual)` : `R$${plan.monthly} (mensal)`}
                </div>
              </div>
              <form onSubmit={handleCheckout} className="space-y-4 animate-fade-in-delay">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#6366F1] outline-none transition"
                    placeholder="Seu melhor email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Método de Pagamento</label>
                  <div className="flex gap-2">
                    <button type="button" className={`flex-1 px-2 py-2 rounded-lg border transition-all ${form.metodo === 'pix' ? 'border-[#6366F1] bg-gradient-to-r from-blue-100 to-purple-100 text-[#6366F1] font-bold' : 'border-gray-200 bg-white text-gray-500'}`} onClick={() => setForm(f => ({...f, metodo: 'pix'}))}>
                      <span role="img" aria-label="Pix">💸</span> Pix
                    </button>
                    <button type="button" className={`flex-1 px-2 py-2 rounded-lg border transition-all ${form.metodo === 'bolbradesco' ? 'border-[#6366F1] bg-gradient-to-r from-blue-100 to-purple-100 text-[#6366F1] font-bold' : 'border-gray-200 bg-white text-gray-500'}`} onClick={() => setForm(f => ({...f, metodo: 'bolbradesco'}))}>
                      <span role="img" aria-label="Boleto">🏦</span> Boleto
                    </button>
                    <button type="button" className={`flex-1 px-2 py-2 rounded-lg border transition-all ${form.metodo === 'visa' ? 'border-[#6366F1] bg-gradient-to-r from-blue-100 to-purple-100 text-[#6366F1] font-bold' : 'border-gray-200 bg-white text-gray-500'}`} onClick={() => setForm(f => ({...f, metodo: 'visa'}))}>
                      <span role="img" aria-label="Cartão">💳</span> Cartão
                    </button>
                  </div>
                </div>
                {(form.metodo === 'visa' || form.metodo === 'master') && (
                  <div className="animate-fade-in-delay">
                    <label className="block text-sm font-medium mb-1">CPF</label>
                    <input
                      type="text"
                      required
                      value={form.docNumber}
                      onChange={e => setForm(f => ({ ...f, docNumber: e.target.value }))}
                      className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#6366F1] outline-none transition"
                      placeholder="Digite seu CPF"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className={`w-full py-2 rounded-lg font-bold text-white transition-all bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] shadow-md hover:from-[#5355d1] hover:to-[#7B4CF5] focus:ring-2 focus:ring-[#6366F1] focus:outline-none ${checkoutLoading ? 'opacity-60 cursor-wait' : ''}`}
                >
                  {checkoutLoading ? (
                    <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Processando...</span>
                  ) : 'Pagar'}
                </button>
              </form>
              {checkoutError && <div className="mt-4 text-red-600 text-sm animate-fade-in">{checkoutError}</div>}
              {checkoutSuccess && (
                <div className="mt-6 text-center animate-fade-in-delay">
                  <b className="text-lg text-[#6366F1] flex items-center justify-center gap-2"><svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#D1FAE5"/><path d="M7 13l3 3 7-7" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Pagamento iniciado!</b>
                  {form.metodo === 'pix' && checkoutSuccess.point_of_interaction?.transaction_data?.qr_code_base64 && (
                    <>
                      <div className="my-2">Escaneie o QR Code abaixo para pagar:</div>
                      <img src={`data:image/png;base64,${checkoutSuccess.point_of_interaction.transaction_data.qr_code_base64}`} alt="QR Code Pix" className="mx-auto w-44 h-44 rounded-xl border shadow-md animate-pop" />
                    </>
                  )}
                  {form.metodo === 'bolbradesco' && checkoutSuccess.barcode && (
                    <div className="my-2">Código do boleto: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-lg">{checkoutSuccess.barcode}</span></div>
                  )}
                  {form.metodo === 'visa' && checkoutSuccess.status === 'approved' && (
                    <div className="my-2 text-green-700 font-semibold">Pagamento aprovado! Obrigado.</div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">ID: {checkoutSuccess.id}</div>
                  <button
                    className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-bold shadow hover:from-[#5355d1] hover:to-[#7B4CF5] transition"
                    onClick={() => setShowCheckout(false)}
                  >Fechar</button>
                </div>
              )}
            </div>
          </div>
        )}
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
  <Button
    className={cn(
      "w-full mt-8 hover-scale",
      plan.popular
        ? "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5355d1] hover:to-[#7B4CF5] text-white shadow-lg"
        : "bg-[#6366F1] hover:bg-[#5355d1] text-white"
    )}
    onClick={() => handleStartCheckout(plan, cardRefs.current[index])}
  >
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
