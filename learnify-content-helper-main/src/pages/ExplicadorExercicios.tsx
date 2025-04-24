import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import FileUpload from '@/components/FileUpload';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  const [error, setError] = useState<string | null>(null);

  const processImage = async (file: File): Promise<void> => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setAnalysis(null);

      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result.toString().split(',')[1]);
          }
        };
        reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
        reader.readAsDataURL(file);
      });

      const apiKey = "AIzaSyBJdcax0rOhfbjVpHlDKutHbezIFLN4DDQ";
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        }
      });

      let subjectText = "";
      switch(subject) {
        case 'matematica':
          subjectText = "Matemática";
          break;
        case 'fisica':
          subjectText = "Física";
          break;
        case 'quimica':
          subjectText = "Química";
          break;
        case 'biologia':
          subjectText = "Biologia";
          break;
        default:
          subjectText = "Matemática";
      }

      const prompt = `Atue como um professor especialista em ${subjectText}. Analise detalhadamente esta imagem de um exercício e forneça uma explicação completa.

IMPORTANTE: Sua resposta DEVE ser um objeto JSON válido seguindo EXATAMENTE este formato:
{
  "subject": "Área específica da ${subjectText} (ex: Álgebra, Mecânica, etc.)",
  "difficulty": "Nível de dificuldade (Básico, Intermediário ou Avançado)",
  "concepts": ["Conceito 1", "Conceito 2", "Conceito 3"],
  "solution": [
    {
      "step": 1,
      "description": "Título curto do passo",
      "explanation": "Explicação detalhada do passo",
      "formula": "Fórmula relevante (se aplicável)",
      "tip": "Dica útil para este passo (se aplicável)"
    }
  ],
  "additionalResources": ["Recurso adicional 1", "Recurso adicional 2", "Recurso adicional 3"]
}`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Resposta da API está vazia');
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/)?.[0];
      if (!jsonMatch) {
        throw new Error('Não foi possível encontrar um objeto JSON válido na resposta');
      }

      const cleanedJson = jsonMatch.replace(/\s+/g, ' ').trim();
      const parsedAnalysis = JSON.parse(cleanedJson);

      if (!parsedAnalysis.subject || !parsedAnalysis.difficulty ||
          !Array.isArray(parsedAnalysis.concepts) ||
          !Array.isArray(parsedAnalysis.solution) ||
          !Array.isArray(parsedAnalysis.additionalResources)) {
        throw new Error('A resposta da API não contém todos os campos necessários');
      }

      parsedAnalysis.solution = parsedAnalysis.solution.map((step: any, index: number) => {
        if (!step.step) step.step = index + 1;
        if (!step.description) step.description = `Passo ${index + 1}`;
        if (!step.explanation) step.explanation = "Explicação não fornecida";
        return step;
      });

      setAnalysis(parsedAnalysis);
    } catch (error) {
      console.error('Erro ao processar a imagem:', error);
      setError(error.message || 'Ocorreu um erro ao processar a imagem');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeExercise = async () => {
    if (!exercise.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    
    try {
      // Usar a chave API fornecida diretamente
      const apiKey = "AIzaSyBJdcax0rOhfbjVpHlDKutHbezIFLN4DDQ";
      
      console.log('Iniciando análise do exercício com a chave API fornecida');
      
      // Inicializa a API do Google Generative AI com a chave API
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Configura o modelo com parâmetros específicos
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.3, // Temperatura mais baixa para respostas mais precisas
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        }
      });

      console.log('Modelo configurado, preparando prompt...');

      // Traduz o assunto para um formato mais descritivo
      let subjectText = "";
      switch(subject) {
        case 'matematica':
          subjectText = "Matemática";
          break;
        case 'fisica':
          subjectText = "Física";
          break;
        case 'quimica':
          subjectText = "Química";
          break;
        case 'biologia':
          subjectText = "Biologia";
          break;
        default:
          subjectText = "Matemática";
      }

      // Prepara o prompt para análise do exercício
      const prompt = `Atue como um professor especialista em ${subjectText} e analise detalhadamente o seguinte exercício:

"${exercise}"

IMPORTANTE: Sua resposta DEVE ser um objeto JSON válido seguindo EXATAMENTE este formato:
{
  "subject": "Área específica da ${subjectText} (ex: Álgebra, Mecânica, etc.)",
  "difficulty": "Nível de dificuldade (Básico, Intermediário ou Avançado)",
  "concepts": ["Conceito 1", "Conceito 2", "Conceito 3"],
  "solution": [
    {
      "step": 1,
      "description": "Título curto do passo",
      "explanation": "Explicação detalhada do passo",
      "formula": "Fórmula relevante (se aplicável)",
      "tip": "Dica útil para este passo (se aplicável)"
    }
  ],
  "additionalResources": ["Recurso adicional 1", "Recurso adicional 2", "Recurso adicional 3"]
}

Instruções específicas:
1. Identifique corretamente a área específica da ${subjectText} e o nível de dificuldade
2. Liste pelo menos 3 conceitos principais abordados no exercício
3. Forneça uma solução passo a passo com pelo menos 3 passos (mais se necessário)
4. Para cada passo, inclua uma descrição clara, explicação detalhada e, quando relevante, fórmulas e dicas
5. Sugira pelo menos 3 recursos adicionais para o estudante aprofundar o conhecimento

Lembre-se: Mantenha o formato JSON válido e evite incluir qualquer texto fora da estrutura do objeto.`;

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
          
          const parsedAnalysis = JSON.parse(cleanedJson);
          
          // Valida a estrutura do objeto
          if (!parsedAnalysis.subject || !parsedAnalysis.difficulty || 
              !Array.isArray(parsedAnalysis.concepts) || 
              !Array.isArray(parsedAnalysis.solution) || 
              !Array.isArray(parsedAnalysis.additionalResources)) {
            console.error('Estrutura de resposta inválida:', parsedAnalysis);
            throw new Error('A resposta da API não contém todos os campos necessários');
          }

          // Valida a estrutura de cada passo da solução
          parsedAnalysis.solution = parsedAnalysis.solution.map((step: any, index: number) => {
            if (!step.step) step.step = index + 1;
            if (!step.description) step.description = `Passo ${index + 1}`;
            if (!step.explanation) step.explanation = "Explicação não fornecida";
            return step;
          });
          
          setAnalysis(parsedAnalysis);
        } catch (parseError) {
          console.error('Erro ao processar resposta da API:', parseError);
          throw new Error('Formato de resposta inválido. Por favor, tente novamente.');
        }
      } catch (apiError) {
        console.error('Erro na chamada da API:', apiError);
        throw new Error(`Erro na chamada da API: ${apiError.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao analisar exercício:', error);
      setError(error.message || 'Ocorreu um erro desconhecido ao analisar o exercício');
    } finally {
      setIsAnalyzing(false);
    }
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
                <div className="mt-2">
                  <FileUpload
                    onFileChange={async (files) => {
                      if (files && files[0]) {
                        const file = files[0];
                        if (file.type.startsWith('image/')) {
                          try {
                            await processImage(file);
                          } catch (error) {
                            setError('Erro ao processar a imagem. Por favor, tente novamente.');
                          }
                        } else {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            if (e.target?.result) {
                              setExercise(e.target.result as string);
                            }
                          };
                          reader.readAsText(file);
                        }
                      }
                    }}
                    label="Envie uma imagem do exercício"
                    accept=".jpg,.jpeg,.png"
                  />
                </div>
              </div>

              <Button
                onClick={analyzeExercise}
                disabled={!exercise.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analisando...' : 'Explicar Exercício'}
              </Button>
            </div>
          </Card>

          {error && (
            <Card className="p-6 mb-8 border-red-500">
              <div className="text-red-500 font-medium">
                Erro: {error}
              </div>
            </Card>
          )}

          {isAnalyzing && (
            <Card className="p-6 mb-8">
              <div className="text-center py-8">
                <p className="text-gray-600 mb-2">Analisando seu exercício...</p>
                <p className="text-sm text-gray-500">Isso pode levar alguns segundos</p>
              </div>
            </Card>
          )}

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