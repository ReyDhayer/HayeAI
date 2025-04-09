import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';

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

  const submitForReviewMock = async () => {
    if (!paperTitle.trim() || !paper.trim()) return;

    setIsSubmitting(true);
    // Simulação de envio para revisão - será substituída por integração com IA
    setTimeout(() => {
      const mockReviews: Review[] = [
        {
          id: 1,
          reviewer: 'Revisor 1',
          comments: 'O trabalho apresenta uma abordagem interessante e bem fundamentada do tema.',
          suggestions: [
            'Considere expandir a seção de metodologia',
            'Adicione mais referências recentes',
            'Esclareça melhor os critérios de seleção'
          ],
          rating: 4
        },
        {
          id: 2,
          reviewer: 'Revisor 2',
          comments: 'Boa estruturação e argumentação, mas alguns pontos precisam ser melhorados.',
          suggestions: [
            'Revise a formatação das citações',
            'Aprofunde a discussão dos resultados',
            'Inclua limitações do estudo'
          ],
          rating: 3
        }
      ];
      setReviews(mockReviews);
      setIsSubmitting(false);
    }, 2000);
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
              onClick={submitForReviewMock}
              disabled={!paper.trim() || !paperTitle.trim() || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar para Revisão'}
            </Button>
          </Card>

          {reviews.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Pareceres dos Revisores</h2>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">{review.reviewer}</h3>
                      <span className="text-yellow-500 text-xl">
                        {renderStars(review.rating)}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{review.comments}</p>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Sugestões de Melhoria:</h4>
                      <ul className="list-disc list-inside space-y-2">
                        {review.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-gray-600">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default SimuladorRevisaoPares;