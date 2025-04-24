import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Youtube, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getVideoDetails } from '@/lib/api/youtube';

interface VideoSummary {
  title: string;
  duration: string;
  mainPoints: string[];
  summary: string;
  timestamps: Array<{
    time: string;
    description: string;
  }>;
  keywords?: string[];
  channel?: string;
}

const ResumoYoutube: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [videoUrl, setVideoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summary, setSummary] = useState<VideoSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidUrl, setIsValidUrl] = useState(false);

  // Função para extrair o ID do vídeo do YouTube da URL
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;

    // Handle direct video ID input
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }

    try {
      const urlObj = new URL(url);
      // Handle youtube.com URLs
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      }
      // Handle youtu.be URLs
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
    } catch {
      // Handle partial URLs or IDs
      const patterns = [
        /(?:v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/,
        /^[a-zA-Z0-9_-]{11}$/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1]) return match[1];
      }
    }
    
    return null;
  };

  // Verifica se a URL é válida quando o usuário digita
  useEffect(() => {
    if (videoUrl.trim()) {
      const videoId = extractYouTubeId(videoUrl);
      setIsValidUrl(!!videoId);
    } else {
      setIsValidUrl(false);
    }
  }, [videoUrl]);

  const analyzeVideo = async () => {
    if (!videoUrl.trim()) {
      toast.error('Por favor, insira uma URL de vídeo do YouTube');
      return;
    }

    if (!isValidUrl) {
      toast.error('URL de vídeo do YouTube inválida. Por favor, verifique o link e tente novamente.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSummary(null);
    
    try {
      // Obter detalhes do vídeo da API do YouTube
      const videoDetails = await getVideoDetails(videoUrl);
      
      if (!videoDetails) {
        throw new Error('Não foi possível obter os detalhes do vídeo. Verifique a URL e tente novamente.');
      }
      
      // Usar a chave API do arquivo .env
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Chave da API não encontrada. Verifique o arquivo .env.');
      }
      
      console.log('Iniciando análise do vídeo:', videoDetails.title);
      
      // Inicializa a API do Google Generative AI com a chave API
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Configura o modelo com parâmetros específicos
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        }
      });

      console.log('Modelo configurado, preparando prompt...');

      // Prepara o prompt para análise do vídeo
      const prompt = `Você é um assistente especializado em resumir vídeos do YouTube para fins educacionais.
      
Analise o vídeo do YouTube:
Título: ${videoDetails.title}
Canal: ${videoDetails.channelTitle}
Descrição: ${videoDetails.description}
Duração: ${videoDetails.duration}
URL: ${videoUrl}

IMPORTANTE: Sua resposta DEVE ser um objeto JSON válido seguindo EXATAMENTE este formato:
{
  "title": "Título do vídeo",
  "duration": "Duração aproximada (ex: 15:30)",
  "channel": "Nome do canal",
  "mainPoints": [
    "Ponto principal 1",
    "Ponto principal 2",
    "Ponto principal 3",
    "Ponto principal 4"
  ],
  "summary": "Resumo detalhado do conteúdo do vídeo em 3-5 parágrafos",
  "timestamps": [
    { "time": "0:00", "description": "Introdução" },
    { "time": "2:30", "description": "Tópico 1" }
  ],
  "keywords": ["palavra-chave1", "palavra-chave2", "palavra-chave3"]
}

Instruções específicas:
1. Identifique os 4-6 pontos principais abordados no vídeo
2. Crie um resumo detalhado e informativo que capture a essência do conteúdo
3. Identifique 5-8 momentos importantes do vídeo com timestamps aproximados
4. Extraia 5-7 palavras-chave relevantes para o conteúdo
5. Mantenha um tom objetivo e educacional

IMPORTANTE: Se você não conseguir acessar o conteúdo do vídeo, faça uma estimativa baseada no título, descrição e outros metadados disponíveis, mas indique claramente no resumo que é uma estimativa. Mantenha o formato JSON válido.`;

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
          
          const parsedSummary = JSON.parse(cleanedJson);
          
          // Valida a estrutura do resumo
          if (!parsedSummary.title || !parsedSummary.summary || !Array.isArray(parsedSummary.mainPoints) || !Array.isArray(parsedSummary.timestamps)) {
            throw new Error('Resposta da API não contém todos os campos necessários');
          }

          setSummary(parsedSummary);
          toast.success('Resumo gerado com sucesso!');
        } catch (parseError) {
          console.error('Erro ao processar resposta da API:', parseError);
          throw new Error('Formato de resposta inválido. Por favor, tente novamente.');
        }
      } catch (apiError) {
        console.error('Erro na chamada da API:', apiError);
        throw new Error(`Erro na chamada da API: ${apiError.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao analisar vídeo:', error);
      setError(error.message || 'Ocorreu um erro desconhecido ao analisar o vídeo');
      toast.error(error.message || 'Ocorreu um erro desconhecido ao analisar o vídeo');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && videoUrl.trim() && !isAnalyzing) {
      analyzeVideo();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Resumo de Vídeos do YouTube</h1>

          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Analisar Vídeo</h2>
            <p className="text-gray-600 mb-4">
              Cole o link de um vídeo do YouTube para gerar um resumo detalhado, pontos principais e momentos importantes.
            </p>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Cole aqui o link do vídeo do YouTube..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`w-full pr-10 ${isValidUrl ? 'border-green-500' : videoUrl.trim() ? 'border-red-500' : ''}`}
                />
                {videoUrl.trim() && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isValidUrl ? (
                      <Youtube className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              <Button
                onClick={analyzeVideo}
                disabled={!isValidUrl || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  'Gerar Resumo'
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
                <p className="text-gray-600 mb-2">Analisando o vídeo...</p>
                <p className="text-sm text-gray-500">Isso pode levar alguns segundos</p>
              </div>
            </Card>
          )}

          {summary && (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-semibold mb-2">{summary.title}</h2>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <span>Duração: {summary.duration}</span>
                    {summary.channel && <span>• Canal: {summary.channel}</span>}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Principais Pontos</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {summary.mainPoints.map((point, index) => (
                      <li key={index} className="text-gray-700">{point}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Resumo</h3>
                  <div className="text-gray-700 whitespace-pre-line">{summary.summary}</div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Momentos Importantes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {summary.timestamps.map((timestamp, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                        <span className="font-mono text-sm bg-primary/10 px-2 py-1 rounded">{timestamp.time}</span>
                        <span className="text-gray-700">{timestamp.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {summary.keywords && summary.keywords.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Palavras-chave</h3>
                    <div className="flex flex-wrap gap-2">
                      {summary.keywords.map((keyword, index) => (
                        <span key={index} className="bg-secondary/20 text-secondary-foreground px-3 py-1 rounded-full text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResumoYoutube;