import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import FileUpload from '@/components/FileUpload';

interface Solution {
  step: number;
  description: string;
  explanation: string;
  formula?: string;
  tip?: string;
}

interface ExerciseAnalysis {
  subject: string;
  difficulty: string;
  concepts: string[];
  solution: Solution[];
  additionalResources: string[];
}

const ExplicadorExercicios: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [exercise, setExercise] = useState('');
  const [subject, setSubject] = useState('matematica');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ExerciseAnalysis | null>(null);

  const analyzeExerciseMock = async () => {
    if (!exercise.trim()) return;

    setIsAnalyzing(true);
    // Simulação de análise - será substituída por integração com IA
    setTimeout(() => {
      const mockAnalysis: ExerciseAnalysis = {
        subject: 'Matemática',
        difficulty: 'Intermediário',
        concepts: [
          'Equações do segundo grau',
          'Fatoração',
          'Gráficos de funções quadráticas'
        ],
        solution: [
          {
            step: 1,
            description: 'Identificar os coeficientes',
            explanation: 'Em uma equação do segundo grau ax² + bx + c, primeiro identificamos os valores de a, b e c.',
            formula: 'ax² + bx + c = 0',
            tip: 'Certifique-se de que a equação está na forma padrão'
          },
          {
            step: 2,
            description: 'Calcular o discriminante',
            explanation: 'O discriminante (Δ) nos ajuda a determinar o número de raízes da equação.',
            formula: 'Δ = b² - 4ac',
            tip: 'O valor de Δ indica: >0 (duas raízes), =0 (uma raiz), <0 (sem raízes reais)'
          },
          {
            step: 3,
            description: 'Aplicar a fórmula de Bhaskara',
            explanation: 'Use a fórmula para encontrar as raízes da equação.',
            formula: 'x = (-b ± √Δ) / (2a)',
            tip: 'Lembre-se do ± ao calcular as duas possíveis raízes'
          }
        ],
        additionalResources: [
          'Vídeo: Resolução de equações quadráticas',
          'Exercícios similares resolvidos',
          'Material sobre funções quadráticas'
        ]
      };
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Explicador de Exercícios</h1>

          <Card className="p-6 mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Matéria</label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a matéria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matematica">Matemática</SelectItem>
                    <SelectItem value="fisica">Física</SelectItem>
                    <SelectItem value="quimica">Química</SelectItem>
                    <SelectItem value="biologia">Biologia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Exercício</label>
                <Textarea
                  placeholder="Cole aqui o exercício que você precisa de ajuda..."
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                  className="min-h-[200px]"
                />
                <FileUpload
                  onFileChange={(files) => {
                    if (files && files[0]) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        if (e.target?.result) {
                          setExercise(e.target.result as string);
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
                onClick={analyzeExerciseMock}
                disabled={!exercise.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analisando...' : 'Explicar Exercício'}
              </Button>
            </div>
          </Card>

          {analysis && (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">Matéria</h3>
                    <p className="text-gray-700">{analysis.subject}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Nível de Dificuldade</h3>
                    <p className="text-gray-700">{analysis.difficulty}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Conceitos Abordados</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.concepts.map((concept, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-muted rounded-full text-sm"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Resolução Passo a Passo</h3>
                  <div className="space-y-6">
                    {analysis.solution.map((step) => (
                      <div key={step.step} className="border-l-4 border-primary pl-4">
                        <h4 className="font-semibold mb-2">
                          Passo {step.step}: {step.description}
                        </h4>
                        <p className="text-gray-700 mb-3">{step.explanation}</p>
                        {step.formula && (
                          <div className="bg-muted p-3 rounded-lg mb-2 font-mono">
                            {step.formula}
                          </div>
                        )}
                        {step.tip && (
                          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                            <span className="font-semibold">Dica:</span> {step.tip}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Recursos Adicionais</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {analysis.additionalResources.map((resource, index) => (
                      <li key={index} className="text-gray-700">{resource}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExplicadorExercicios;