import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FileUpload from '@/components/FileUpload';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

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
  const [error, setError] = useState<string | null>(null);

  const analyzeText = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResults([]);
    
    try {
      // Usar a chave API fornecida diretamente
      const apiKey = "AIzaSyBJdcax0rOhfbjVpHlDKutHbezIFLN4DDQ";
      
      console.log(`Iniciando análise ${analysisType} com a API Gemini`);
      
      // Inicializa a API do Google Generative AI com a chave API
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Configura o modelo com parâmetros específicos
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        }
      });

      console.log('Modelo configurado, preparando prompt...');

      // Determina quais análises solicitar com base no tipo selecionado
      let analysisCategories = [];
      if (analysisType === 'completa') {
        analysisCategories = ['gramatical', 'estilo', 'coesao'];
      } else {
        analysisCategories = [analysisType];
      }
      
      // Prepara o prompt para análise de texto
      const prompt = `Você é um especialista em análise textual e revisão. Analise o seguinte texto em português:

${text}

Realize uma análise detalhada focando nos seguintes aspectos: ${analysisCategories.map(getAnalysisTypeName).join(', ')}.

IMPORTANTE: Sua resposta DEVE ser um array JSON válido seguindo EXATAMENTE este formato:
[
  {
    "category": "Nome da categoria de análise",
    "suggestions": ["Sugestão 1", "Sugestão 2", "Sugestão 3"],
    "examples": ["Exemplo 1", "Exemplo 2", "Exemplo 3"]
  }
]

Instruções específicas:
1. Para cada categoria de análise solicitada, crie um objeto no array
2. Forneça 3-5 sugestões específicas e acionáveis para cada categoria
3. Inclua exemplos concretos extraídos do texto para ilustrar cada sugestão
4. Seja construtivo e específico nas sugestões
5. Mantenha o formato JSON válido

Categorias de análise:
- Gramatical: Foco em erros gramaticais, ortográficos, pontuação e concordância
- Estilo: Foco em clareza, concisão, variação vocabular e estrutura das frases
- Coesão: Foco em conectivos, transições entre parágrafos, argumentação e coerência

IMPORTANTE: Mantenha o formato JSON válido e evite incluir qualquer texto fora da estrutura do array.`;

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
          
          const parsedResults = JSON.parse(cleanedJson);
          
          if (!Array.isArray(parsedResults)) {
            console.error('Resposta não é um array:', parsedResults);
            throw new Error('Resposta da API não está no formato esperado de array');
          }

          // Valida a estrutura de cada item dos resultados
          const validResults = parsedResults.filter(item => {
            const isValid = 
              typeof item === 'object' &&
              item !== null &&
              typeof item.category === 'string' &&
              Array.isArray(item.suggestions) &&
              Array.isArray(item.examples);
            
            return isValid;
          });

          if (validResults.length === 0) {
            throw new Error('Nenhum resultado válido foi encontrado na resposta');
          }

          setResults(validResults);
        } catch (parseError) {
          console.error('Erro ao processar resposta da API:', parseError);
          throw new Error('Formato de resposta inválido. Por favor, tente novamente.');
        }
      } catch (apiError) {
        console.error('Erro na chamada da API:', apiError);
        throw new Error(`Erro na chamada da API: ${apiError.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro na análise de texto:', error);
      setError(error.message || 'Ocorreu um erro desconhecido ao analisar o texto');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Função para obter o nome completo do tipo de análise
  const getAnalysisTypeName = (type: string) => {
    switch (type) {
      case 'gramatical':
        return 'Análise Gramatical';
      case 'estilo':
        return 'Análise de Estilo';
      case 'coesao':
        return 'Coesão e Coerência';
      case 'completa':
        return 'Análise Completa';
      default:
        return type;
    }
  };

  // Função para obter o valor da tab a partir da categoria
  const getCategoryTabValue = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('gramática') || lowerCategory.includes('gramatical')) {
      return 'gramatical';
    } else if (lowerCategory.includes('estilo')) {
      return 'estilo';
    } else if (lowerCategory.includes('coesão') || lowerCategory.includes('coerência')) {
      return 'coesao';
    }
    return lowerCategory.split(' ')[0];
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
                <p className="text-sm text-gray-500 mt-1">
                  {analysisType === 'completa' ? 
                    'Análise completa inclui gramática, estilo e coesão textual.' : 
                    `Foco em ${getAnalysisTypeName(analysisType).toLowerCase()}.`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Texto para Análise</label>
                <Textarea
                  placeholder="Cole aqui o texto para análise..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[200px]"
                />
               
              </div>

              <Button
                onClick={analyzeText}
                disabled={!text.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  'Analisar Texto'
                )}
              </Button>
            </div>
          </Card>

          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isAnalyzing && (
            <Card className="p-6 mb-8">
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Analisando texto...</p>
                <p className="text-sm text-gray-500">Isso pode levar alguns segundos</p>
              </div>
            </Card>
          )}

          {results.length > 0 && (
            <Card className="p-6">
              <Tabs defaultValue={results[0] ? getCategoryTabValue(results[0].category) : 'gramatical'} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="gramatical">Gramática</TabsTrigger>
                  <TabsTrigger value="estilo">Estilo</TabsTrigger>
                  <TabsTrigger value="coesao">Coesão</TabsTrigger>
                </TabsList>

                {results.map((result, index) => (
                  <TabsContent key={index} value={getCategoryTabValue(result.category)}>
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-2xl font-semibold">{result.category}</h2>
                        <Badge variant="outline" className="ml-2">
                          {result.suggestions.length} sugestões
                        </Badge>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-4">Sugestões</h3>
                        <ul className="list-disc list-inside space-y-3">
                          {result.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-gray-700">
                              <span className="font-medium">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-4">Exemplos</h3>
                        <div className="bg-muted p-4 rounded-lg space-y-3">
                          {result.examples.map((example, idx) => (
                            <div key={idx} className="bg-white/50 p-3 rounded border border-gray-200">
                              <p className="text-gray-700">{example}</p>
                            </div>
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