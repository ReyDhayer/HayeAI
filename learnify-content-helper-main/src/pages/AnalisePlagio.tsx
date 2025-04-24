import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from '@/components/FileUpload';
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PlagiarismResult {
  text: string;
  similarity: number;
  source: string;
  url: string;
  explanation?: string;
}

const AnalisePlagio: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<PlagiarismResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzePlagiarism = async (contentToAnalyze: string) => {
    if (!contentToAnalyze.trim()) {
      setError("Por favor, forneça algum texto para análise.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults([]);
    
    try {
      // Usar a chave API fornecida diretamente
      const apiKey = "AIzaSyBJdcax0rOhfbjVpHlDKutHbezIFLN4DDQ";
      
      console.log('Iniciando análise de plágio com a API Gemini');
      
      // Inicializa a API do Google Generative AI com a chave API
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Configura o modelo com parâmetros específicos para análise de plágio
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
      
      // Limita o texto a 10.000 caracteres para evitar exceder limites da API
      const truncatedText = contentToAnalyze.slice(0, 10000);
      
      // Prepara o prompt para análise de plágio
      const prompt = `Você é um especialista em detecção de plágio acadêmico. Analise o seguinte texto em busca de possíveis trechos plagiados. Para cada trecho suspeito, realize uma busca na web para encontrar possíveis fontes originais:

${truncatedText}

IMPORTANTE: Sua resposta DEVE ser um array JSON válido seguindo EXATAMENTE este formato:
[
  {
    "text": "Trecho específico que pode ser plagiado",
    "similarity": número entre 0 e 100 representando a probabilidade de plágio,
    "source": "Nome da fonte original (site específico, título do artigo/livro)",
    "url": "URL real e completa da fonte (NÃO use URLs fictícias)",
    "explanation": "Explicação detalhada de por que este trecho parece plagiado e como foi encontrado"
  }
]

Instruções específicas:
1. Identifique de 1 a 5 trechos que parecem ser plagiados
2. Para cada trecho, PESQUISE NA WEB para encontrar a fonte original
3. Forneça URLs reais e verificáveis das fontes encontradas
4. Se não encontrar a URL exata, forneça a URL da página principal do site fonte
5. Se não encontrar nenhum indício de plágio, retorne um array vazio []
6. Sempre Acerte a URL se a URL não for encontrada e tiver erros verifique novamente e faça dar certo a url encontrada
IMPORTANTE: 
- Sempre forneça URLs reais e funcionais
- Verifique se as fontes citadas realmente existem
- Priorize fontes acadêmicas e sites confiáveis
- Mantenha o formato JSON válido e evite incluir qualquer texto fora da estrutura do array.`;

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
          
          // Se não encontrar um array JSON ou se for um array vazio, significa que não foi detectado plágio
          if (!jsonMatch || jsonMatch === '[]') {
            console.log('Nenhum plágio detectado');
            setResults([]);
            return;
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
              typeof item.text === 'string' &&
              typeof item.similarity === 'number' &&
              typeof item.source === 'string' &&
              typeof item.url === 'string';
            
            return isValid;
          });

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
      console.error('Erro na análise de plágio:', error);
      setError(error.message || 'Ocorreu um erro desconhecido ao analisar o texto');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTextAnalysis = async () => {
    await analyzePlagiarism(text);
  };

  const handleFileAnalysis = async () => {
    if (!file) return;

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        if (e.target?.result) {
          const fileContent = e.target.result as string;
          await analyzePlagiarism(fileContent);
        }
      };
      
      reader.onerror = () => {
        setError('Erro ao ler o arquivo. Verifique se o formato é suportado.');
        setIsAnalyzing(false);
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setError('Erro ao processar o arquivo. Verifique se o formato é suportado.');
      setIsAnalyzing(false);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 80) return 'bg-red-100 border-red-300';
    if (similarity >= 60) return 'bg-orange-100 border-orange-300';
    if (similarity >= 40) return 'bg-yellow-100 border-yellow-300';
    return 'bg-green-100 border-green-300';
  };

  const getSimilarityTextColor = (similarity: number) => {
    if (similarity >= 80) return 'text-red-700';
    if (similarity >= 60) return 'text-orange-700';
    if (similarity >= 40) return 'text-yellow-700';
    return 'text-green-700';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <h1 className="text-3xl font-bold mb-8 text-center">Análise de Plágio</h1>

        <div className="max-w-3xl mx-auto space-y-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Análise por Texto</h2>
            <p className="text-gray-600 mb-4">
              Cole seu texto para verificar possíveis trechos plagiados.
              Nossa ferramenta utiliza IA avançada para identificar similaridades com conteúdos existentes.
            </p>
            <Textarea
              placeholder="Cole seu texto aqui para análise..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mb-4"
              rows={6}
            />
           
            <Button
              onClick={handleTextAnalysis}
              disabled={isAnalyzing || !text.trim()}
              className="w-full mt-4"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                'Analisar Plágio'
              )}
            </Button>
          </Card>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isAnalyzing && (
            <Card className="p-6">
              <div className="text-center py-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Analisando o texto em busca de plágio...</p>
                <p className="text-sm text-gray-500 mb-4">Isso pode levar alguns segundos</p>
                <Progress value={45} className="h-2 w-full" />
              </div>
            </Card>
          )}

          {results.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Resultados da Análise</h2>
              <p className="text-gray-600 mb-4">
                Encontramos {results.length} {results.length === 1 ? 'trecho' : 'trechos'} com possível plágio. 
                Revise cada um e faça as alterações necessárias.
              </p>
              {results.map((result, index) => (
                <Card 
                  key={index} 
                  className={`p-4 border-2 ${getSimilarityColor(result.similarity)}`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Trecho {index + 1}</h3>
                      <div className="flex items-center">
                        <span className={`font-medium ${getSimilarityTextColor(result.similarity)}`}>
                          {result.similarity}% de similaridade
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-white/50 p-3 rounded-md border border-gray-200">
                      <p className="text-gray-800 italic">"{result.text}"</p>
                    </div>
                    
                    {result.explanation && (
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Análise: </span>
                        {result.explanation}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-sm pt-2">
                      <span className="text-gray-600">
                        Possível fonte: <span className="font-medium">{result.source}</span>
                      </span>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Ver Fonte
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : !isAnalyzing && text.trim() && !error ? (
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-xl font-semibold text-green-700 mb-2">Nenhum plágio detectado!</h3>
                <p className="text-green-600">
                  Não encontramos indícios de plágio no texto analisado. O conteúdo parece ser original.
                </p>
              </div>
            </Card>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default AnalisePlagio;