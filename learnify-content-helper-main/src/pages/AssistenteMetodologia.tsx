import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';

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

  const generateMethodologyMock = async () => {
    if (!researchArea.trim()) return;

    setIsGenerating(true);
    // Simulação de geração - será substituída por integração com IA
    setTimeout(() => {
      const mockSteps: MethodologyStep[] = [
        {
          title: 'Definição do Problema de Pesquisa',
          description: 'Estabeleça claramente o problema ou questão que sua pesquisa pretende abordar.',
          examples: [
            'Qual o impacto da tecnologia X no processo Y?',
            'Como o fenômeno Z afeta determinado grupo social?'
          ],
          tips: [
            'Seja específico e mensurável',
            'Considere a viabilidade da pesquisa',
            'Alinhe com objetivos claros'
          ]
        },
        {
          title: 'Revisão da Literatura',
          description: 'Analise o estado atual do conhecimento sobre o tema.',
          examples: [
            'Artigos em periódicos indexados',
            'Teses e dissertações relacionadas'
          ],
          tips: [
            'Use bases de dados confiáveis',
            'Organize cronologicamente',
            'Identifique lacunas de pesquisa'
          ]
        },
        {
          title: 'Coleta de Dados',
          description: 'Defina os métodos e instrumentos para coletar dados.',
          examples: [
            'Questionários online',
            'Entrevistas semiestruturadas',
            'Observação participante'
          ],
          tips: [
            'Valide seus instrumentos',
            'Considere aspectos éticos',
            'Planeje um piloto'
          ]
        }
      ];

      const mockDesign: ResearchDesign = {
        approach: 'Método misto (qualitativo e quantitativo)',
        methods: [
          'Estudo de caso',
          'Análise documental',
          'Pesquisa de campo'
        ],
        dataCollection: [
          'Entrevistas em profundidade',
          'Questionários estruturados',
          'Observação sistemática'
        ],
        analysis: [
          'Análise de conteúdo',
          'Estatística descritiva',
          'Triangulação de dados'
        ],
        timeline: [
          'Mês 1-2: Revisão da literatura',
          'Mês 3-4: Coleta de dados',
          'Mês 5-6: Análise e interpretação',
          'Mês 7-8: Redação e revisão'
        ]
      };

      setMethodologySteps(mockSteps);
      setResearchDesign(mockDesign);
      setIsGenerating(false);
    }, 2000);
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button
                onClick={generateMethodologyMock}
                disabled={!researchArea.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Gerando Metodologia...' : 'Gerar Metodologia'}
              </Button>
            </div>
          </Card>

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