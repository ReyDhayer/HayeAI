import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FileUpload from '@/components/FileUpload';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';

interface AnalysisResult {
  category: string;
  suggestions: string[];
  examples: string[];
}

const CorretorAvancado: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [text, setText] = useState('');
  const [analysisType, setAnalysisType] = useState('gramatical');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);

  const analyzeTextMock = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    // Simulação de análise - será substituída por integração com IA
    setTimeout(() => {
      const mockResults: AnalysisResult[] = [
        {
          category: 'Análise Gramatical',
          suggestions: [
            'Revise a concordância verbal na terceira linha',
            'Verifique a pontuação no segundo parágrafo',
            'Ajuste o uso de pronomes relativos'
          ],
          examples: [
            'Forma correta: "Os alunos estudam" em vez de "Os alunos estuda"',
            'Use vírgula antes de conjunções adversativas',
            'Substitua "onde" por "em que" quando não houver referência a lugar'
          ]
        },
        {
          category: 'Análise Estilística',
          suggestions: [
            'Evite repetições desnecessárias de palavras',
            'Varie a estrutura das frases',
            'Use conectivos mais sofisticados'
          ],
          examples: [
            'Use sinônimos para evitar repetições',
            'Alterne entre períodos curtos e longos',
            'Em vez de "mas", use "entretanto" ou "contudo"'
          ]
        },
        {
          category: 'Coesão e Coerência',
          suggestions: [
            'Melhore as transições entre parágrafos',
            'Fortaleça a argumentação com exemplos',
            'Mantenha a unidade temática'
          ],
          examples: [
            'Use expressões como "além disso", "por outro lado"',
            'Cite casos concretos para ilustrar argumentos',
            'Mantenha o foco no tema central'
          ]
        }
      ];
      setResults(mockResults);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Corretor Avançado</h1>

          <Card className="p-6 mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Análise</label>
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo de análise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gramatical">Análise Gramatical</SelectItem>
                    <SelectItem value="estilo">Análise de Estilo</SelectItem>
                    <SelectItem value="coesao">Coesão e Coerência</SelectItem>
                    <SelectItem value="completa">Análise Completa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Texto para Análise</label>
                <Textarea
                  placeholder="Cole aqui o texto para análise..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[200px]"
                />
                <FileUpload
                  onFileChange={(files) => {
                    if (files && files[0]) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        if (e.target?.result) {
                          setText(e.target.result as string);
                        }
                      };
                      reader.readAsText(files[0]);
                    }
                  }}
                  label="Ou envie um arquivo"
                  accept=".doc,.docx,.pdf,.txt,.jpg,.jpeg,.png"
                />
              </div>

              <Button
                onClick={analyzeTextMock}
                disabled={!text.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analisando...' : 'Analisar Texto'}
              </Button>
            </div>
          </Card>

          {results.length > 0 && (
            <Card className="p-6">
              <Tabs defaultValue="gramatical" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="gramatical">Gramática</TabsTrigger>
                  <TabsTrigger value="estilo">Estilo</TabsTrigger>
                  <TabsTrigger value="coesao">Coesão</TabsTrigger>
                </TabsList>

                {results.map((result, index) => (
                  <TabsContent key={index} value={result.category.toLowerCase().split(' ')[0]}>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Sugestões</h3>
                        <ul className="list-disc list-inside space-y-2">
                          {result.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-gray-700">{suggestion}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-4">Exemplos</h3>
                        <div className="bg-muted p-4 rounded-lg space-y-3">
                          {result.examples.map((example, idx) => (
                            <p key={idx} className="text-gray-700">{example}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default CorretorAvancado;