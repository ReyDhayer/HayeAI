import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import FileUpload from '@/components/FileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';

interface AnalysisResult {
  category: string;
  score: number;
  feedback: string;
  suggestions: string[];
}

const CorretorRedacoes: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [essay, setEssay] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);

  const analyzeEssayMock = async () => {
    setIsAnalyzing(true);
    // Simulação de análise - será substituída por integração com IA
    setTimeout(() => {
      const mockResults: AnalysisResult[] = [
        {
          category: 'Estrutura',
          score: 85,
          feedback: 'Boa organização dos parágrafos e ideias.',
          suggestions: [
            'Considere adicionar uma transição mais suave entre o segundo e terceiro parágrafos',
            'A conclusão poderia retomar mais claramente os argumentos principais'
          ]
        },
        {
          category: 'Argumentação',
          score: 90,
          feedback: 'Argumentos bem desenvolvidos e fundamentados.',
          suggestions: [
            'Adicione mais exemplos concretos para fortalecer o argumento principal',
            'Explore contrapontos para enriquecer a discussão'
          ]
        },
        {
          category: 'Gramática e Ortografia',
          score: 95,
          feedback: 'Excelente domínio das regras gramaticais.',
          suggestions: [
            'Revise o uso de vírgulas em algumas orações subordinadas',
            'Verifique a concordância verbal no penúltimo parágrafo'
          ]
        }
      ];
      setAnalysisResults(mockResults);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Corretor de Redações</h1>

          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Sua Redação</h2>
            <div className="space-y-4">
              <Textarea
                placeholder="Cole aqui sua redação para análise..."
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                className="min-h-[300px]"
              />
              <div className="space-y-2">
                <p className="text-sm font-medium">Ou envie um arquivo:</p>
                <FileUpload
                  onFileChange={(files) => {
                    if (files && files[0]) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        if (e.target?.result) {
                          setEssay(e.target.result.toString());
                        }
                      };
                      reader.readAsText(files[0]);
                    }
                  }}
                  accept=".doc,.docx,.pdf,.txt"
                  multiple={false}
                  label="Enviar Arquivo"
                />
              </div>
              <Button
                onClick={analyzeEssayMock}
                disabled={!essay.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analisando...' : 'Analisar Redação'}
              </Button>
            </div>
          </Card>

          {analysisResults.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Resultado da Análise</h2>
              <div className="space-y-8">
                {analysisResults.map((result, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">{result.category}</h3>
                      <span className="text-lg font-medium">{result.score}/100</span>
                    </div>
                    <Progress value={result.score} className="h-2" />
                    <p className="text-gray-700">{result.feedback}</p>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Sugestões de Melhoria:</h4>
                      <ul className="list-disc list-inside space-y-2">
                        {result.suggestions.map((suggestion, idx) => (
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

export default CorretorRedacoes;