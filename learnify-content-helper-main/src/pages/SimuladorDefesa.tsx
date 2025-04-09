import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';

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

  const analyzePresentationMock = async () => {
    setIsAnalyzing(true);
    // Simulação de análise - será substituída por integração com IA
    setTimeout(() => {
      const mockFeedback: FeedbackItem[] = [
        {
          id: 1,
          point: 'Estrutura clara',
          suggestion: 'Sua apresentação tem uma estrutura bem organizada.',
          type: 'positive'
        },
        {
          id: 2,
          point: 'Argumentação',
          suggestion: 'Considere adicionar mais exemplos práticos para fortalecer seus argumentos.',
          type: 'improvement'
        }
      ];
      setFeedback(mockFeedback);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Simulador de Defesa Acadêmica</h1>

          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Preparação da Apresentação</h2>
            <Textarea
              placeholder="Digite aqui o conteúdo da sua apresentação..."
              value={presentation}
              onChange={(e) => setPresentation(e.target.value)}
              className="min-h-[200px] mb-4"
            />
            <Button
              onClick={analyzePresentationMock}
              disabled={!presentation.trim() || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? 'Analisando...' : 'Analisar Apresentação'}
            </Button>
          </Card>

          {feedback.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Feedback da Apresentação</h2>
              <Tabs defaultValue="positive" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="positive">Pontos Positivos</TabsTrigger>
                  <TabsTrigger value="improvement">Sugestões de Melhoria</TabsTrigger>
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