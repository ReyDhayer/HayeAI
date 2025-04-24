import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import FileUpload from '@/components/FileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface AnalysisResult {
  category: string;
  score: number;
  feedback: string;
  suggestions: string[];
}

interface EnemAnalysisResult extends AnalysisResult {
  competencia?: number;
}

interface CustomAnalysisOptions {
  title: string;
  description: string;
}

const CorretorRedacoes: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [essay, setEssay] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [essayType, setEssayType] = useState('enem');
  const [customType, setCustomType] = useState('');
  const [totalScore, setTotalScore] = useState(0);
  const [activeTab, setActiveTab] = useState('input');
  const [error, setError] = useState<string | null>(null);
  
  // Efeito para calcular a nota total quando os resultados mudam (apenas para ENEM)
  useEffect(() => {
    if (essayType === 'enem' && analysisResults.length > 0) {
      const total = analysisResults.reduce((sum, result) => sum + result.score, 0);
      // Usa a soma direta das competências como nota final
      setTotalScore(total);
    }
  }, [analysisResults, essayType]);

  // Função para gerar o prompt baseado no tipo de redação selecionado
  const generatePrompt = () => {
    if (essayType === 'enem') {
      return `Você é um especialista em correção de redações do ENEM. Analise a seguinte redação de acordo com as 5 competências avaliadas no ENEM:

Competência 1: Domínio da norma padrão da língua escrita
Competência 2: Compreensão da proposta e aplicação de conceitos de áreas do conhecimento
Competência 3: Capacidade de organizar e relacionar informações e argumentos
Competência 4: Conhecimento dos mecanismos linguísticos para construção da argumentação
Competência 5: Proposta de intervenção com respeito aos direitos humanos

IMPORTANTE: Sua resposta DEVE ser um array JSON válido com EXATAMENTE 5 objetos (um para cada competência), seguindo EXATAMENTE este formato:
[{
  "category": "Competência 1: Domínio da norma padrão",
  "competencia": 1,
  "score": número de 0 a 200 (representando a nota nesta competência),
  "feedback": "Feedback detalhado sobre esta competência",
  "suggestions": ["Sugestão 1", "Sugestão 2", ...]
}]

Para cada competência:
- Atribua uma pontuação de 0 a 200 (cada competência vale até 200 pontos no ENEM)
- Forneça um feedback construtivo e específico
- Inclua pelo menos 2 sugestões práticas de melhoria

Redação para análise:
${essay}

Lembre-se: Mantenha o formato JSON válido e evite incluir qualquer texto fora da estrutura do array.`;
    } else if (essayType === 'custom' && customType) {
      return `Você é um especialista em correção de redações. Analise a seguinte redação de acordo com os critérios para ${customType}.

Considere os seguintes aspectos na sua análise:
1. Estrutura e organização
2. Argumentação e desenvolvimento
3. Gramática e ortografia
4. Coesão e coerência
5. Adequação ao tema e proposta de ${customType}

IMPORTANTE: Sua resposta DEVE ser um array JSON válido com pelo menos 4 categorias de análise, seguindo EXATAMENTE este formato:
[{
  "category": "Nome da categoria analisada",
  "score": número de 0 a 100,
  "feedback": "Feedback detalhado sobre esta categoria",
  "suggestions": ["Sugestão 1", "Sugestão 2", ...]
}]

Para cada categoria:
- Atribua uma pontuação de 0 a 100
- Forneça um feedback construtivo e específico
- Inclua pelo menos 2 sugestões práticas de melhoria

Redação para análise:
${essay}

Lembre-se: Mantenha o formato JSON válido e evite incluir qualquer texto fora da estrutura do array.`;
    } else {
      return `Analise detalhadamente a seguinte redação, considerando os seguintes aspectos:

1. Estrutura e organização
2. Argumentação e desenvolvimento
3. Gramática e ortografia
4. Coesão e coerência
5. Adequação ao tema

Forneça uma análise construtiva e específica para cada aspecto, identificando pontos fortes e áreas que necessitam de melhoria.

IMPORTANTE: Sua resposta DEVE ser um array JSON válido com pelo menos 3 categorias de análise, seguindo EXATAMENTE este formato:
[{
  "category": "Nome da categoria analisada",
  "score": número de 0 a 100,
  "feedback": "Feedback detalhado sobre esta categoria",
  "suggestions": ["Sugestão 1", "Sugestão 2", ...]
}]

Para cada categoria:
- Atribua uma pontuação de 0 a 100
- Forneça um feedback construtivo e específico
- Inclua pelo menos 2 sugestões práticas de melhoria

Redação para análise:
${essay}

Lembre-se: Mantenha o formato JSON válido e evite incluir qualquer texto fora da estrutura do array.`;
    }
  };

  const processImage = async (file: File): Promise<string> => {
    try {
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

      const prompt = `Analise esta imagem de uma redação e extraia o texto completo dela. Retorne APENAS o texto extraído, sem nenhum comentário adicional.`;

      const result = await model.generateContent([prompt, { inlineData: { data: base64Data, mimeType: "image/jpeg" } }]);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Não foi possível extrair texto da imagem');
      }

      return text;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      throw new Error('Erro ao processar a imagem da redação');
    }
  };

  const analyzeEssay = async () => {
    if (!essay.trim()) return;
    
    // Usar a chave API fornecida diretamente para teste
    const apiKey = "AIzaSyBJdcax0rOhfbjVpHlDKutHbezIFLN4DDQ";
    
    setIsAnalyzing(true);
    setActiveTab('results');
    
    try {
      console.log('Iniciando análise com a chave API fornecida');
      
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

      console.log('Modelo configurado, enviando prompt...');
      
      // Prepara o prompt para análise da redação baseado no tipo selecionado
      const prompt = generatePrompt();

      try {
        // Faz a chamada para a API
        console.log('Enviando requisição para a API...');
        const result = await model.generateContent(prompt);
        console.log('Resposta recebida da API');
        const response = await result.response;
        const text = response.text();
        console.log('Texto da resposta:', text.substring(0, 100) + '...');

        if (!text) {
          throw new Error('Resposta da API está vazia');
        }
        
        let parsedResults;
        try {
          // Tenta extrair JSON da resposta, removendo qualquer texto adicional
          const jsonMatch = text.match(/\[.*\]/s)?.[0];
          if (!jsonMatch) {
            console.error('Texto completo da resposta:', text);
            throw new Error('Não foi possível encontrar um array JSON válido na resposta');
          }
          
          // Remove quebras de linha e espaços extras antes de fazer o parse
          const cleanedJson = jsonMatch.replace(/\s+/g, ' ').trim();
          console.log('JSON limpo:', cleanedJson.substring(0, 100) + '...');
          
          parsedResults = JSON.parse(cleanedJson);
          
          if (!Array.isArray(parsedResults)) {
            console.error('Resposta não é um array:', parsedResults);
            throw new Error('Resposta da API não está no formato esperado de array');
          }

          // Valida a estrutura de cada item da análise
          parsedResults = parsedResults.filter(item => {
            const isValid = 
              typeof item === 'object' &&
              item !== null &&
              typeof item.category === 'string' &&
              typeof item.score === 'number' &&
              typeof item.feedback === 'string' &&
              Array.isArray(item.suggestions);
            
            return isValid;
          });

          if (parsedResults.length === 0) {
            throw new Error('Nenhum resultado válido foi encontrado na resposta');
          }
        } catch (parseError) {
          console.error('Erro ao processar resposta da API:', parseError);
          throw new Error('Formato de resposta inválido. Por favor, tente novamente.');
        }

        setAnalysisResults(parsedResults);
      } catch (apiError) {
        console.error('Erro na chamada da API:', apiError);
        throw new Error(`Erro na chamada da API: ${apiError.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao analisar redação:', error);
      let errorMessage = 'Erro desconhecido';
      
      if (error.response?.status === 403) {
        errorMessage = 'Erro de autenticação. Por favor, verifique se a chave API do Gemini está correta.';
      } else if (error.response?.status === 404) {
        errorMessage = 'API não encontrada. Verifique se está usando o modelo correto ou se a API está disponível.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setAnalysisResults([
        {
          category: 'Erro na Análise',
          score: 0,
          feedback: `Ocorreu um erro ao analisar sua redação: ${errorMessage}`,
          suggestions: [
            'Por favor, tente novamente mais tarde',
            'Verifique se a chave API do Gemini está correta',
            'Tente usar um texto mais longo para análise'
          ]
        }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Lista de opções personalizadas para o tipo de redação
  const customOptions: CustomAnalysisOptions[] = [
    { title: 'Vestibular', description: 'Análise para vestibulares gerais' },
    { title: 'Concurso Público', description: 'Análise para concursos públicos' },
    { title: 'Trabalho Acadêmico', description: 'Análise para trabalhos acadêmicos' },
    { title: 'Redação Escolar', description: 'Análise para redações escolares' }
    
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            className="text-4xl font-bold text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Corretor de Redações
          </motion.h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="input">Sua Redação</TabsTrigger>
              <TabsTrigger value="results" disabled={analysisResults.length === 0}>Resultados</TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-4">
              <Card className="p-6 mb-8 shadow-lg border-t-4 border-t-primary">
                <h2 className="text-2xl font-semibold mb-4">Sua Redação</h2>
                
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-2">Selecione o tipo de correção:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Select value={essayType} onValueChange={setEssayType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de redação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enem">
                            <div className="flex items-center">
                              <span>ENEM</span>
                              <Badge className="ml-2 bg-blue-500">5 Competências</Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="custom">Outros tipos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {essayType === 'custom' && (
                      <div className="space-y-2">
                        <Select value={customType} onValueChange={setCustomType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo específico" />
                          </SelectTrigger>
                          <SelectContent>
                            {customOptions.map((option) => (
                              <SelectItem key={option.title} value={option.title}>
                                <div className="flex flex-col">
                                  <span>{option.title}</span>
                                  <span className="text-xs text-gray-500">{option.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Textarea
                    placeholder="Cole aqui sua redação para análise..."
                    value={essay}
                    onChange={(e) => setEssay(e.target.value)}
                    className="min-h-[300px] transition-all focus:border-primary"
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Ou envie um arquivo:</p>
                    <FileUpload
                      onFileChange={async (files) => {
                        if (files && files[0]) {
                          const file = files[0];
                          try {
                            if (file.type.startsWith('image/')) {
                              const extractedText = await processImage(file);
                              setEssay(extractedText);
                            } else {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                if (e.target?.result) {
                                  setEssay(e.target.result.toString());
                                }
                              };
                              reader.readAsText(file);
                            }
                          } catch (error) {
                            console.error('Erro ao processar arquivo:', error);
                            setError(error.message || 'Erro ao processar o arquivo');
                          }
                        }
                      }}
                      accept=".doc,.docx,.pdf,.txt,.jpg,.jpeg,.png"
                      multiple={false}
                      label="Enviar Arquivo"
                    />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={analyzeEssay}
                      disabled={!essay.trim() || isAnalyzing || (essayType === 'custom' && !customType)}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all"
                    >
                      {isAnalyzing ? (
                        <>
                          <span className="animate-pulse mr-2">Analisando</span>
                          <span className="inline-block animate-bounce">.</span>
                          <span className="inline-block animate-bounce delay-100">.</span>
                          <span className="inline-block animate-bounce delay-200">.</span>
                        </>
                      ) : (
                        'Analisar Redação'
                      )}
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="results">
              {analysisResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="p-6 shadow-lg border-t-4 border-t-primary">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-semibold">Resultado da Análise</h2>
                      {essayType === 'enem' && (
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">{totalScore}</div>
                          <div className="text-sm text-gray-500">Nota Final</div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-8">
                      {analysisResults.map((result, index) => (
                        <motion.div 
                          key={index} 
                          className="space-y-4 p-4 border rounded-lg hover:shadow-md transition-all"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold">{result.category}</h3>
                            <Badge className="text-lg font-medium px-3 py-1">
                              {essayType === 'enem' ? `${result.score}/200` : `${result.score}/100`}
                            </Badge>
                          </div>
                          <Progress 
                            value={essayType === 'enem' ? (result.score / 2) : result.score} 
                            className="h-2 bg-gray-200" 
                          />
                          <p className="text-gray-700">{result.feedback}</p>
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Sugestões de Melhoria:</h4>
                            <ul className="list-disc list-inside space-y-2">
                              {result.suggestions.map((suggestion, idx) => (
                                <li key={idx} className="text-gray-600">{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <Button 
                        onClick={() => setActiveTab('input')} 
                        variant="outline" 
                        className="w-full"
                      >
                        Voltar para Edição
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CorretorRedacoes;