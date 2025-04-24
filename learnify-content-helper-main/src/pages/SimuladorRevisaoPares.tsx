import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Review {
  id: number;
  reviewer: string;
  comments: string;
  suggestions: string[];
  rating: number;
}

const SimuladorRevisaoPares: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [paper, setPaper] = useState('');
  const [paperTitle, setPaperTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);

  const submitForReview = async () => {
    if (!paperTitle.trim() || !paper.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setReviews([]);
    
    try {
      // Usar a chave API fornecida diretamente
      const apiKey = "AIzaSyBJdcax0rOhfbjVpHlDKutHbezIFLN4DDQ";
      
      console.log('Iniciando simulação de revisão por pares com a chave API fornecida');
      
      // Inicializa a API do Google Generative AI com a chave API
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Configura o modelo com parâmetros específicos
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        }
      });

      console.log('Modelo configurado, preparando prompt...');

      // Prepara o prompt para simulação de revisão por pares
      const prompt = `Atue como três diferentes revisores acadêmicos e forneça feedback sobre o seguinte trabalho acadêmico:

Título: "${paperTitle}"

Conteúdo:
${paper}

IMPORTANTE: Sua resposta DEVE ser um array JSON válido com exatamente 3 revisões, seguindo EXATAMENTE este formato:
[
  {
    "id": 1,
    "reviewer": "Nome do revisor (ex: Revisor 1, Prof. Silva, etc.)",
    "comments": "Comentários gerais sobre o trabalho (100-200 palavras)",
    "suggestions": ["Sugestão 1", "Sugestão 2", "Sugestão 3", "Sugestão 4"],
    "rating": número de 1 a 5 representando a avaliação geral
  }
]

Instruções específicas:
1. Cada revisor deve ter uma perspectiva e estilo de feedback diferentes
2. Forneça comentários construtivos e específicos ao conteúdo
3. Inclua pelo menos 3 sugestões práticas e acionáveis para cada revisor
4. Atribua uma classificação de 1 a 5 (onde 5 é excelente)
5. Mantenha um tom profissional e acadêmico

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
          
          const parsedReviews = JSON.parse(cleanedJson);
          
          if (!Array.isArray(parsedReviews)) {
            console.error('Resposta não é um array:', parsedReviews);
            throw new Error('Resposta da API não está no formato esperado de array');
          }

          // Valida a estrutura de cada item das revisões
          const validReviews = parsedReviews.filter(item => {
            const isValid = 
              typeof item === 'object' &&
              item !== null &&
              typeof item.id === 'number' &&
              typeof item.reviewer === 'string' &&
              typeof item.comments === 'string' &&
              Array.isArray(item.suggestions) &&
              typeof item.rating === 'number' &&
              item.rating >= 1 &&
              item.rating <= 5;
            
            return isValid;
          });

          if (validReviews.length === 0) {
            throw new Error('Nenhuma revisão válida foi encontrada na resposta');
          }

          setReviews(validReviews);
        } catch (parseError) {
          console.error('Erro ao processar resposta da API:', parseError);
          throw new Error('Formato de resposta inválido. Por favor, tente novamente.');
        }
      } catch (apiError) {
        console.error('Erro na chamada da API:', apiError);
        throw new Error(`Erro na chamada da API: ${apiError.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao simular revisão por pares:', error);
      setError(error.message || 'Ocorreu um erro desconhecido ao simular a revisão por pares');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Simulador de Revisão por Pares</h1>

          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Submeter Trabalho</h2>
            <p className="text-gray-600 mb-4">
              Submeta seu trabalho acadêmico para receber feedback de três revisores simulados.
              Forneça um título e o conteúdo completo para obter revisões mais precisas.
            </p>
            <Input
              placeholder="Título do trabalho"
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              className="mb-4"
            />
            <Textarea
              placeholder="Cole aqui o conteúdo do seu trabalho..."
              value={paper}
              onChange={(e) => setPaper(e.target.value)}
              className="min-h-[300px] mb-4"
            />
            <Button
              onClick={submitForReview}
              disabled={!paper.trim() || !paperTitle.trim() || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar para Revisão'}
            </Button>
          </Card>

          {error && (
            <Card className="p-6 mb-8 border-red-500">
              <div className="text-red-500 font-medium">
                Erro: {error}
              </div>
            </Card>
          )}

          {isSubmitting && (
            <Card className="p-6 mb-8">
              <div className="text-center py-8">
                <p className="text-gray-600 mb-2">Simulando processo de revisão por pares...</p>
                <p className="text-sm text-gray-500">Isso pode levar alguns segundos</p>
              </div>
            </Card>
          )}

          {reviews.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Pareceres dos Revisores</h2>
              
              <Tabs defaultValue="1" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  {reviews.map((review) => (
                    <TabsTrigger key={review.id} value={review.id.toString()}>
                      {review.reviewer}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {reviews.map((review) => (
                  <TabsContent key={review.id} value={review.id.toString()} className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">{review.reviewer}</h3>
                      <div className="flex items-center">
                        <span className="text-yellow-500 text-xl mr-2">
                          {renderStars(review.rating)}
                        </span>
                        <span className="text-gray-600">
                          {review.rating}/5
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">Comentários Gerais:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700">{review.comments}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Sugestões de Melhoria:</h4>
                      <div className="bg-muted p-4 rounded-lg">
                        <ul className="list-disc list-inside space-y-2">
                          {review.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-gray-600">{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">Avaliação Geral</h3>
                <p className="text-blue-600">
                  Média das avaliações: {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}/5
                </p>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default SimuladorRevisaoPares;