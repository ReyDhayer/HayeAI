import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import FileUpload from '@/components/FileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';

interface ArticleAnalysis {
  section: string;
  score: number;
  feedback: string;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
}

const AnaliseArtigos: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [article, setArticle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ArticleAnalysis[]>([]);

  const analyzeArticleMock = async () => {
    if (!article.trim()) return;

    setIsAnalyzing(true);
    // Simulação de análise - será substituída por integração com IA
    setTimeout(() => {
      const mockAnalysis: ArticleAnalysis[] = [
        {
          section: 'Metodologia',
          score: 85,
          feedback: 'A metodologia está bem estruturada, mas pode ser mais detalhada.',
          recommendations: [
            'Detalhe melhor os critérios de seleção da amostra',
            'Explique o processo de validação dos instrumentos',
            'Adicione justificativas para as escolhas metodológicas'
          ],
          strengths: [
            'Procedimentos bem descritos',
            'Métodos apropriados para os objetivos'
          ],
          weaknesses: [
            'Falta de detalhamento em alguns procedimentos',
            'Limitações do estudo não totalmente exploradas'
          ]
        },
        {
          section: 'Resultados',
          score: 90,
          feedback: 'Apresentação clara dos resultados com boa análise estatística.',
          recommendations: [
            'Inclua mais visualizações dos dados',
            'Relacione os resultados com a literatura existente',
            'Destaque as descobertas mais significativas'
          ],
          strengths: [
            'Análise estatística robusta',
            'Apresentação clara dos dados'
          ],
          weaknesses: [
            'Algumas correlações poderiam ser mais exploradas',
            'Faltam comparações com estudos similares'
          ]
        },
        {
          section: 'Discussão e Conclusões',
          score: 88,
          feedback: 'Boa discussão dos resultados, mas pode ser mais abrangente.',
          recommendations: [
            'Explore mais as implicações práticas',
            'Sugira direções para pesquisas futuras',
            'Fortaleça a conexão com o referencial teórico'
          ],
          strengths: [
            'Conclusões bem fundamentadas',
            'Boa síntese dos resultados'
          ],
          weaknesses: [
            'Algumas limitações não foram discutidas',
            'Implicações práticas pouco exploradas'
          ]
        }
      ];
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Análise de Artigos Acadêmicos</h1>

          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Submeter Artigo</h2>
            <Textarea
              placeholder="Cole aqui o texto do seu artigo para análise..."
              value={article}
              onChange={(e) => setArticle(e.target.value)}
              className="min-h-[300px] mb-4"
            />
            <FileUpload
              onFileChange={(files) => {
                if (files && files[0]) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    if (e.target?.result) {
                      setArticle(e.target.result as string);
                    }
                  };
                  reader.readAsText(files[0]);
                }
              }}
              label="Ou envie um arquivo"
              accept=".doc,.docx,.pdf,.txt,.jpg,.jpeg,.png"
            />
            <Button
              onClick={analyzeArticleMock}
              disabled={!article.trim() || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? 'Analisando...' : 'Analisar Artigo'}
            </Button>
          </Card>

          {analysis.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Resultado da Análise</h2>
              <Tabs defaultValue="metodologia" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="metodologia">Metodologia</TabsTrigger>
                  <TabsTrigger value="resultados">Resultados</TabsTrigger>
                  <TabsTrigger value="discussao">Discussão</TabsTrigger>
                </TabsList>

                {analysis.map((section, index) => (
                  <TabsContent key={index} value={section.section.toLowerCase().replace(' e conclusões', '')}>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">{section.section}</h3>
                        <span className="text-lg font-medium">{section.score}/100</span>
                      </div>
                      <Progress value={section.score} className="h-2" />
                      <p className="text-gray-700">{section.feedback}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-700 mb-2">Pontos Fortes</h4>
                          <ul className="list-disc list-inside space-y-2">
                            {section.strengths.map((strength, idx) => (
                              <li key={idx} className="text-green-600">{strength}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-yellow-700 mb-2">Pontos a Melhorar</h4>
                          <ul className="list-disc list-inside space-y-2">
                            {section.weaknesses.map((weakness, idx) => (
                              <li key={idx} className="text-yellow-600">{weakness}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-700 mb-2">Recomendações</h4>
                        <ul className="list-disc list-inside space-y-2">
                          {section.recommendations.map((recommendation, idx) => (
                            <li key={idx} className="text-blue-600">{recommendation}</li>
                          ))}
                        </ul>
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

export default AnaliseArtigos;