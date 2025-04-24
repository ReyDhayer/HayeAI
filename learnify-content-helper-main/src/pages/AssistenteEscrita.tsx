import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import FileUpload from '@/components/FileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface WritingAnalysis {
  category: string;
  suggestions: string[];
  examples: string[];
}

const AssistenteEscrita: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [text, setText] = useState('');
  const [documentType, setDocumentType] = useState('artigo');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WritingAnalysis[]>([]);
  const [error, setError] = useState<string | null>(null);

  const analyzeText = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysis([]);
    
    try {
      // Usar a chave API fornecida diretamente
      const apiKey = "AIzaSyBJdcax0rOhfbjVpHlDKutHbezIFLN4DDQ";
      
      console.log(`Iniciando análise de escrita para ${getDocumentTypeName(documentType)} com a API Gemini`);
      
      // Inicializa a API do Google Generative AI com a chave API
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Configura o modelo com parâmetros específicos
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        }
      });

      console.log('Modelo configurado, preparando prompt...');
      
      // Prepara o prompt para análise de escrita acadêmica
      const prompt = `Você é um especialista em escrita acadêmica e revisão de textos científicos. Analise o seguinte texto para um ${getDocumentTypeName(documentType).toLowerCase()}:

${text}

IMPORTANTE: Sua resposta DEVE ser um array JSON válido seguindo EXATAMENTE este formato:
[
  {
    "category": "Nome da categoria de análise",
    "suggestions": ["Sugestão 1", "Sugestão 2", "Sugestão 3"],
    "examples": ["Exemplo 1", "Exemplo 2", "Exemplo 3"]
  }
]

Instruções específicas:
1. Crie 3-5 categorias de análise relevantes para um ${getDocumentTypeName(documentType).toLowerCase()}
2. Para cada categoria, forneça 3-5 sugestões específicas e acionáveis
3. Para cada categoria, inclua 2-4 exemplos concretos ou modelos de escrita
4. Seja construtivo e específico nas sugestões
5. Adapte as categorias e sugestões ao tipo de documento (${getDocumentTypeName(documentType)})

Categorias sugeridas (adapte conforme necessário):
- Estrutura do Texto: organização, fluxo lógico, seções necessárias
- Linguagem Acadêmica: formalidade, precisão, terminologia
- Argumentação: fundamentação, lógica, evidências
- Citações e Referências: formato, integração no texto
- Clareza e Concisão: objetividade, redundâncias

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
          
          const parsedAnalysis = JSON.parse(cleanedJson);
          
          if (!Array.isArray(parsedAnalysis)) {
            console.error('Resposta não é um array:', parsedAnalysis);
            throw new Error('Resposta da API não está no formato esperado de array');
          }

          // Valida a estrutura de cada item da análise
          const validAnalysis = parsedAnalysis.filter(item => {
            const isValid = 
              typeof item === 'object' &&
              item !== null &&
              typeof item.category === 'string' &&
              Array.isArray(item.suggestions) &&
              Array.isArray(item.examples);
            
            return isValid;
          });

          if (validAnalysis.length === 0) {
            throw new Error('Nenhuma análise válida foi encontrada na resposta');
          }

          setAnalysis(validAnalysis);
        } catch (parseError) {
          console.error('Erro ao processar resposta da API:', parseError);
          throw new Error('Formato de resposta inválido. Por favor, tente novamente.');
        }
      } catch (apiError) {
        console.error('Erro na chamada da API:', apiError);
        throw new Error(`Erro na chamada da API: ${apiError.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro na análise de escrita:', error);
      setError(error.message || 'Ocorreu um erro desconhecido ao analisar o texto');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Função para obter o nome completo do tipo de documento
  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'artigo':
        return 'Artigo Científico';
      case 'dissertacao':
        return 'Dissertação';
      case 'tese':
        return 'Tese';
      case 'relatorio':
        return 'Relatório Técnico';
      case 'monografia':
        return 'Monografia';
      case 'resumo':
        return 'Resumo Expandido';
      default:
        return type;
    }
  };

  // Função para obter o valor da tab a partir da categoria
  const getCategoryTabValue = (category: string) => {
    const lowerCategory = category.toLowerCase();
    
    if (lowerCategory.includes('estrutura')) {
      return 'estrutura';
    } else if (lowerCategory.includes('linguagem') || lowerCategory.includes('escrita')) {
      return 'linguagem';
    } else if (lowerCategory.includes('citação') || lowerCategory.includes('referência')) {
      return 'citacoes';
    } else if (lowerCategory.includes('argumento') || lowerCategory.includes('lógica')) {
      return 'argumentacao';
    } else if (lowerCategory.includes('clareza') || lowerCategory.includes('concisão')) {
      return 'clareza';
    }
    
    // Fallback: usa a primeira palavra da categoria
    return lowerCategory.split(' ')[0];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Assistente de Escrita Acadêmica</h1>

          <Card className="p-6 mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Tipo de Documento</h2>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artigo">Artigo Científico</SelectItem>
                  <SelectItem value="dissertacao">Dissertação</SelectItem>
                  <SelectItem value="tese">Tese</SelectItem>
                  <SelectItem value="relatorio">Relatório Técnico</SelectItem>
                  <SelectItem value="monografia">Monografia</SelectItem>
                  <SelectItem value="resumo">Resumo Expandido</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-2">
                Selecione o tipo de documento para receber sugestões específicas para esse formato.
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Seu Texto</h2>
              <Textarea
                placeholder="Cole aqui seu texto acadêmico..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[300px] mb-4"
              />
            
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
                <p className="text-gray-600 mb-2">Analisando seu texto acadêmico...</p>
                <p className="text-sm text-gray-500">Isso pode levar alguns segundos</p>
              </div>
            </Card>
          )}

          {analysis.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Sugestões de Melhoria</h2>
              <Tabs defaultValue={analysis[0] ? getCategoryTabValue(analysis[0].category) : 'estrutura'} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="estrutura">Estrutura</TabsTrigger>
                  <TabsTrigger value="linguagem">Linguagem</TabsTrigger>
                  <TabsTrigger value="citacoes">Citações</TabsTrigger>
                </TabsList>

                {analysis.map((section, index) => (
                  <TabsContent key={index} value={getCategoryTabValue(section.category)}>
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-xl font-semibold">{section.category}</h3>
                        <Badge variant="outline" className="ml-2">
                          {section.suggestions.length} sugestões
                        </Badge>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-4">Sugestões</h3>
                        <ul className="list-disc list-inside space-y-3">
                          {section.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-gray-700">
                              <span className="font-medium">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-4">Exemplos</h3>
                        <div className="bg-muted p-4 rounded-lg space-y-3">
                          {section.examples.map((example, idx) => (
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

export default AssistenteEscrita;