import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MethodologyStep {
  title: string;
  description: string;
  examples: string[];
  tips: string[];
}

interface ResearchDesign {
  approach: string;
  methods: string[];
  dataCollection: string[];
  analysis: string[];
  timeline: string[];
}

const AssistenteMetodologia: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [researchArea, setResearchArea] = useState('');
  const [researchType, setResearchType] = useState('qualitativa');
  const [isGenerating, setIsGenerating] = useState(false);
  const [methodologySteps, setMethodologySteps] = useState<MethodologyStep[]>([]);
  const [researchDesign, setResearchDesign] = useState<ResearchDesign | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateMethodology = async () => {
    if (!researchArea.trim()) return;

    setIsGenerating(true);
    setError(null);
    setMethodologySteps([]);
    setResearchDesign(null);
    
    try {
      // Usar a chave API fornecida diretamente
      const apiKey = "AIzaSyBJdcax0rOhfbjVpHlDKutHbezIFLN4DDQ";
      
      console.log('Iniciando geração de metodologia com a API Gemini');
      
      // Inicializa a API do Google Generative AI com a chave API
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Configura o modelo com parâmetros específicos
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        }
      });

      console.log('Modelo configurado, preparando prompt...');

      // Prepara o prompt para geração de metodologia
      const prompt = `Você é um especialista em metodologia científica. Crie uma metodologia detalhada para a seguinte pesquisa:

Área/Tema: ${researchArea}
Tipo de Pesquisa: ${researchType}

IMPORTANTE: Sua resposta DEVE ser um objeto JSON válido seguindo EXATAMENTE este formato:
{
  "methodologySteps": [
    {
      "title": "Título da etapa metodológica",
      "description": "Descrição detalhada da etapa",
      "examples": ["Exemplo 1", "Exemplo 2", "Exemplo 3"],
      "tips": ["Dica 1", "Dica 2", "Dica 3"]
    }
  ],
  "researchDesign": {
    "approach": "Descrição da abordagem metodológica",
    "methods": ["Método 1", "Método 2", "Método 3"],
    "dataCollection": ["Técnica de coleta 1", "Técnica de coleta 2", "Técnica de coleta 3"],
    "analysis": ["Técnica de análise 1", "Técnica de análise 2", "Técnica de análise 3"],
    "timeline": ["Fase 1: descrição", "Fase 2: descrição", "Fase 3: descrição"]
  }
}

Instruções específicas:
1. Crie de 4 a 6 etapas metodológicas detalhadas e relevantes para a área de pesquisa
2. Para cada etapa, forneça 2-4 exemplos práticos e 3-5 dicas úteis
3. O design da pesquisa deve ser coerente com o tipo de pesquisa especificado (${researchType})
4. Inclua métodos de coleta e análise de dados apropriados para a área
5. Crie um cronograma realista com 4-6 fases
6. Use terminologia acadêmica apropriada

IMPORTANTE: Mantenha o formato JSON válido e evite incluir qualquer texto fora da estrutura do objeto.`;

      console.log('Enviando requisição para a API...');
      
      try {
        // Faz a chamada para a API
        const result = await model.generateContent(prompt);
        console.log('Resposta recebida da API');
        const response = await result.response;
        const text = response.text();
        console.log('Texto da resposta recebido');

        if (!text) {
          throw new Error('Resposta da API está vazia');
        }
        
        // Tenta extrair JSON da resposta
        try {
          // Procura por um objeto JSON válido na resposta
          const jsonMatch = text.match(/\{[\s\S]*\}/)?.[0];
          if (!jsonMatch) {
            console.error('Texto completo da resposta:', text);
            throw new Error('Não foi possível encontrar um objeto JSON válido na resposta');
          }
          
          // Remove quebras de linha e espaços extras antes de fazer o parse
          const cleanedJson = jsonMatch.replace(/\s+/g, ' ').trim();
          console.log('JSON limpo:', cleanedJson.substring(0, 100) + '...');
          
          const parsedData = JSON.parse(cleanedJson);
          
          // Valida a estrutura da resposta
          if (!parsedData.methodologySteps || !Array.isArray(parsedData.methodologySteps) || 
              !parsedData.researchDesign || typeof parsedData.researchDesign !== 'object') {
            throw new Error('Resposta da API não contém a estrutura esperada');
          }

          // Valida cada etapa metodológica
          const validSteps = parsedData.methodologySteps.filter((step: any) => {
            return typeof step === 'object' && 
                   step !== null && 
                   typeof step.title === 'string' && 
                   typeof step.description === 'string' && 
                   Array.isArray(step.examples) && 
                   Array.isArray(step.tips);
          });

          if (validSteps.length === 0) {
            throw new Error('Nenhuma etapa metodológica válida foi encontrada na resposta');
          }

          // Valida o design da pesquisa
          const design = parsedData.researchDesign;
          if (typeof design.approach !== 'string' || 
              !Array.isArray(design.methods) || 
              !Array.isArray(design.dataCollection) || 
              !Array.isArray(design.analysis) || 
              !Array.isArray(design.timeline)) {
            throw new Error('Design da pesquisa inválido na resposta');
          }

          setMethodologySteps(validSteps);
          setResearchDesign(design);
        } catch (parseError) {
          console.error('Erro ao processar resposta da API:', parseError);
          throw new Error('Formato de resposta inválido. Por favor, tente novamente.');
        }
      } catch (apiError) {
        console.error('Erro na chamada da API:', apiError);
        throw new Error(`Erro na chamada da API: ${apiError.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao gerar metodologia:', error);
      setError(error.message || 'Ocorreu um erro desconhecido ao gerar a metodologia');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Assistente de Metodologia</h1>

          <Card className="p-6 mb-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Configurar Pesquisa</h2>
                <p className="text-gray-600 mb-4">
                  Forneça informações sobre sua pesquisa para gerar uma metodologia personalizada e detalhada.
                </p>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Área de Pesquisa</label>
                    <Input
                      placeholder="Digite a área ou tema da sua pesquisa..."
                      value={researchArea}
                      onChange={(e) => setResearchArea(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Pesquisa</label>
                    <Select value={researchType} onValueChange={setResearchType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tipo de pesquisa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="qualitativa">Qualitativa</SelectItem>
                        <SelectItem value="quantitativa">Quantitativa</SelectItem>
                        <SelectItem value="mista">Mista</SelectItem>
                        <SelectItem value="exploratória">Exploratória</SelectItem>
                        <SelectItem value="descritiva">Descritiva</SelectItem>
                        <SelectItem value="experimental">Experimental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button
                onClick={generateMethodology}
                disabled={!researchArea.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando Metodologia...
                  </>
                ) : (
                  'Gerar Metodologia'
                )}
              </Button>
            </div>
          </Card>

          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isGenerating && (
            <Card className="p-6 mb-8">
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Gerando metodologia personalizada...</p>
                <p className="text-sm text-gray-500">Isso pode levar alguns segundos</p>
              </div>
            </Card>
          )}

          {methodologySteps.length > 0 && researchDesign && (
            <Card className="p-6">
              <Tabs defaultValue="steps" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="steps">Etapas Metodológicas</TabsTrigger>
                  <TabsTrigger value="design">Design da Pesquisa</TabsTrigger>
                </TabsList>

                <TabsContent value="steps">
                  <div className="space-y-8">
                    {methodologySteps.map((step, index) => (
                      <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                        <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                        <p className="text-gray-700 mb-4">{step.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Exemplos:</h4>
                            <ul className="list-disc list-inside space-y-2">
                              {step.examples.map((example, idx) => (
                                <li key={idx} className="text-gray-600">{example}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Dicas:</h4>
                            <ul className="list-disc list-inside space-y-2">
                              {step.tips.map((tip, idx) => (
                                <li key={idx} className="text-gray-600">{tip}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="design">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Abordagem</h3>
                      <p className="text-gray-700">{researchDesign.approach}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-3">Métodos</h3>
                        <ul className="list-disc list-inside space-y-2">
                          {researchDesign.methods.map((method, index) => (
                            <li key={index} className="text-gray-700">{method}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">Coleta de Dados</h3>
                        <ul className="list-disc list-inside space-y-2">
                          {researchDesign.dataCollection.map((item, index) => (
                            <li key={index} className="text-gray-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Análise</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {researchDesign.analysis.map((item, index) => (
                          <li key={index} className="text-gray-700">{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Cronograma</h3>
                      <div className="bg-muted p-4 rounded-lg">
                        <ul className="space-y-2">
                          {researchDesign.timeline.map((item, index) => (
                            <li key={index} className="text-gray-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AssistenteMetodologia;