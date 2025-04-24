import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface FeedbackItem {
  id: number;
  point: string;
  suggestion: string;
  type: 'positive' | 'improvement';
}

const SimuladorDefesa: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [presentation, setPresentation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const analyzePresentation = async () => {
    if (!presentation.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setFeedback([]);
    
    try {
      // Usar a chave API fornecida diretamente
      const apiKey = "AIzaSyBJdcax0rOhfbjVpHlDKutHbezIFLN4DDQ";
      
      console.log('Iniciando análise da apresentação com a chave API fornecida');
      
      // Inicializa a API do Google Generative AI com a chave API
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Configura o modelo com parâmetros específicos
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      });

      console.log('Modelo configurado, preparando prompt...');

      // Prepara o prompt para análise da apresentação
      const prompt = `Analise detalhadamente a seguinte apresentação acadêmica, considerando os seguintes aspectos:

1. Estrutura e organização
2. Clareza e objetividade
3. Fundamentação teórica
4. Metodologia
5. Resultados e conclusões
6. Contribuições para a área

Forneça um feedback construtivo e específico, identificando tanto pontos fortes quanto áreas que necessitam de melhoria. 

IMPORTANTE: Sua resposta DEVE ser um array JSON válido com pelo menos 3 pontos positivos e 3 sugestões de melhoria, seguindo EXATAMENTE este formato:
[{
  "point": "Título do ponto analisado",
  "suggestion": "Feedback detalhado com sugestões específicas",
  "type": "positive" ou "improvement"
}]

Para pontos positivos (type: "positive"):
- Destaque os aspectos bem executados
- Explique por que são efetivos
- Forneça exemplos específicos do texto

Para sugestões de melhoria (type: "improvement"):
- Identifique áreas que precisam de atenção
- Ofereça sugestões práticas e acionáveis
- Explique como implementar as melhorias

Conteúdo da apresentação:
${presentation}

Lembre-se: Mantenha o formato JSON válido e evite incluir qualquer texto fora da estrutura do array.`;

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
          // Procura por um array JSON válido na resposta
          const jsonMatch = text.match(/\[[\s\S]*\]/)?.[0];
          if (!jsonMatch) {
            console.error('Texto completo da resposta:', text);
            throw new Error('Não foi possível encontrar um array JSON válido na resposta');
          }
          
          // Remove quebras de linha e espaços extras antes de fazer o parse
          const cleanedJson = jsonMatch.replace(/\s+/g, ' ').trim();
          console.log('JSON limpo:', cleanedJson.substring(0, 100) + '...');
          
          const parsedFeedback = JSON.parse(cleanedJson);
          
          if (!Array.isArray(parsedFeedback)) {
            console.error('Resposta não é um array:', parsedFeedback);
            throw new Error('Resposta da API não está no formato esperado de array');
          }

          // Valida a estrutura de cada item do feedback
          const validFeedback = parsedFeedback.filter(item => {
            const isValid = 
              typeof item === 'object' &&
              item !== null &&
              typeof item.point === 'string' &&
              typeof item.suggestion === 'string' &&
              (item.type === 'positive' || item.type === 'improvement');
            
            return isValid;
          });

          if (validFeedback.length === 0) {
            throw new Error('Nenhum feedback válido foi encontrado na resposta');
          }

          setFeedback(validFeedback.map((item, index) => ({
            id: index + 1,
            point: item.point,
            suggestion: item.suggestion,
            type: item.type
          })));
        } catch (parseError) {
          console.error('Erro ao processar resposta da API:', parseError);
          throw new Error('Formato de resposta inválido. Por favor, tente novamente.');
        }
      } catch (apiError) {
        console.error('Erro na chamada da API:', apiError);
        throw new Error(`Erro na chamada da API: ${apiError.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao analisar apresentação:', error);
      setError(error.message || 'Ocorreu um erro desconhecido ao analisar a apresentação');
      setFeedback([{
        id: 1,
        point: 'Erro na Análise',
        suggestion: `Ocorreu um erro ao analisar sua apresentação: ${error.message || 'Erro desconhecido'}. Por favor, tente novamente.`,
        type: 'improvement'
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Simulador de Defesa Acadêmica</h1>

          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Preparação da Apresentação</h2>
            <p className="text-gray-600 mb-4">
              Digite o conteúdo da sua apresentação acadêmica para receber feedback construtivo sobre pontos fortes e áreas de melhoria.
              Inclua informações sobre seu tema, objetivos, metodologia, resultados e conclusões.
            </p>
            <Textarea
              placeholder="Digite aqui o conteúdo da sua apresentação..."
              value={presentation}
              onChange={(e) => setPresentation(e.target.value)}
              className="min-h-[200px] mb-4"
            />
            <Button
              onClick={analyzePresentation}
              disabled={!presentation.trim() || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? 'Analisando...' : 'Analisar Apresentação'}
            </Button>
          </Card>

          {error && (
            <Card className="p-6 mb-8 border-red-500">
              <div className="text-red-500 font-medium">
                Erro: {error}
              </div>
            </Card>
          )}

          {feedback.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Feedback da Apresentação</h2>
              <Tabs defaultValue="positive" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="positive">
                    Pontos Positivos ({feedback.filter(item => item.type === 'positive').length})
                  </TabsTrigger>
                  <TabsTrigger value="improvement">
                    Sugestões de Melhoria ({feedback.filter(item => item.type === 'improvement').length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="positive">
                  {feedback
                    .filter(item => item.type === 'positive')
                    .map(item => (
                      <div key={item.id} className="mb-4 p-4 bg-green-50 rounded-lg">
                        <h3 className="font-semibold text-green-700">{item.point}</h3>
                        <p className="text-green-600">{item.suggestion}</p>
                      </div>
                    ))}
                  
                  {feedback.filter(item => item.type === 'positive').length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      Nenhum ponto positivo identificado. Tente fornecer mais detalhes na sua apresentação.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="improvement">
                  {feedback
                    .filter(item => item.type === 'improvement')
                    .map(item => (
                      <div key={item.id} className="mb-4 p-4 bg-yellow-50 rounded-lg">
                        <h3 className="font-semibold text-yellow-700">{item.point}</h3>
                        <p className="text-yellow-600">{item.suggestion}</p>
                      </div>
                    ))}
                  
                  {feedback.filter(item => item.type === 'improvement').length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      Nenhuma sugestão de melhoria identificada. Sua apresentação parece estar muito boa!
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default SimuladorDefesa;