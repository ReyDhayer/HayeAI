import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '@/components/FileUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GrammarCheck {
  correctedText: string;
  errors: Array<{
    original: string;
    correction: string;
    explanation: string;
  }>;
  suggestions: string[];
}

const Idiomas = () => {
  const fadeIn = useFadeIn(100);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grammarCheck, setGrammarCheck] = useState<GrammarCheck | null>(null);

  const languages = [
    { value: 'en', label: 'Inglês' },
    { value: 'es', label: 'Espanhol' },
    { value: 'fr', label: 'Francês' },
    { value: 'de', label: 'Alemão' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'ja', label: 'Japonês' },
    { value: 'zh', label: 'Chinês' },
    { value: 'ru', label: 'Russo' },
    { value: 'ar', label: 'Árabe' },
  ];

  const getLanguageName = (code: string) => {
    const language = languages.find(lang => lang.value === code);
    return language ? language.label : code;
  };

  const callGeminiAPI = async (prompt: string) => {
    try {
      // Usar a chave API fornecida diretamente
      const apiKey = "AIzaSyBJdcax0rOhfbjVpHlDKutHbezIFLN4DDQ";
      
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

      // Faz a chamada para a API
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Resposta da API está vazia');
      }

      return text;
    } catch (error) {
      console.error('Erro na chamada da API:', error);
      throw new Error(`Erro na chamada da API: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setOutputText('');
    setGrammarCheck(null);
    
    try {
      console.log(`Iniciando tradução para ${getLanguageName(selectedLanguage)}`);
      
      // Prepara o prompt para tradução
      const prompt = `Traduza o seguinte texto para ${getLanguageName(selectedLanguage)}:

${inputText}

IMPORTANTE: Retorne apenas o texto traduzido, sem explicações adicionais ou comentários.`;

      const translatedText = await callGeminiAPI(prompt);
      setOutputText(translatedText);
    } catch (error) {
      console.error('Erro na tradução:', error);
      setError(error.message || 'Ocorreu um erro desconhecido ao traduzir o texto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrammarCheck = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setOutputText('');
    setGrammarCheck(null);
    
    try {
      console.log('Iniciando verificação gramatical');
      
      // Prepara o prompt para verificação gramatical
      const prompt = `Você é um especialista em gramática e linguística. Analise o seguinte texto, identifique erros gramaticais, ortográficos ou estilísticos e forneça correções:

${inputText}

IMPORTANTE: Sua resposta DEVE ser um objeto JSON válido seguindo EXATAMENTE este formato:
{
  "correctedText": "Texto completo corrigido",
  "errors": [
    {
      "original": "texto original com erro",
      "correction": "texto corrigido",
      "explanation": "explicação do erro e da correção"
    }
  ],
  "suggestions": ["sugestão 1 para melhorar o texto", "sugestão 2", "sugestão 3"]
}

Se não houver erros, retorne um array vazio para "errors" e forneça apenas sugestões gerais de melhoria.
Mantenha o formato JSON válido e evite incluir qualquer texto fora da estrutura do objeto.`;

      const response = await callGeminiAPI(prompt);
      
      try {
        // Procura por um objeto JSON válido na resposta
        const jsonMatch = response.match(/\{[\s\S]*\}/)?.[0];
        if (!jsonMatch) {
          console.error('Texto completo da resposta:', response);
          throw new Error('Não foi possível encontrar um objeto JSON válido na resposta');
        }
        
        // Remove quebras de linha e espaços extras antes de fazer o parse
        const cleanedJson = jsonMatch.replace(/\s+/g, ' ').trim();
        
        const parsedData = JSON.parse(cleanedJson);
        
        // Valida a estrutura da resposta
        if (!parsedData.correctedText || !Array.isArray(parsedData.errors) || !Array.isArray(parsedData.suggestions)) {
          throw new Error('Resposta da API não contém a estrutura esperada');
        }

        setGrammarCheck(parsedData);
        setOutputText(parsedData.correctedText);
      } catch (parseError) {
        console.error('Erro ao processar resposta da API:', parseError);
        throw new Error('Formato de resposta inválido. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Erro na verificação gramatical:', error);
      setError(error.message || 'Ocorreu um erro desconhecido ao verificar o texto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto p-6 ${fadeIn}`}>
        <h1 className="text-3xl font-bold mb-6">Idiomas e Gramática</h1>
        
        <Tabs defaultValue="translate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="translate">Tradutor</TabsTrigger>
            <TabsTrigger value="grammar">Verificação Gramatical</TabsTrigger>
          </TabsList>

        <TabsContent value="translate">
          <Card>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Digite o texto para traduzir..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>

              <Button
                onClick={handleTranslate}
                disabled={isLoading || !inputText}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traduzindo...
                  </>
                ) : (
                  'Traduzir'
                )}
              </Button>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isLoading && (
                <div className="text-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Processando tradução...</p>
                </div>
              )}

              {outputText && !isLoading && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Tradução para {getLanguageName(selectedLanguage)}:</p>
                  <Textarea
                    value={outputText}
                    readOnly
                    className="min-h-[200px]"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grammar">
          <Card>
            <CardContent className="space-y-4 pt-4">
              <Textarea
                placeholder="Digite o texto para verificação gramatical..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px]"
              />

              <Button
                onClick={handleGrammarCheck}
                disabled={isLoading || !inputText}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar Gramática'
                )}
              </Button>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isLoading && (
                <div className="text-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Analisando texto...</p>
                </div>
              )}

              {grammarCheck && !isLoading && (
                <div className="space-y-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Texto corrigido:</p>
                    <Textarea
                      value={grammarCheck.correctedText}
                      readOnly
                      className="min-h-[200px]"
                    />
                  </div>

                  {grammarCheck.errors.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Erros encontrados:</h3>
                      <div className="space-y-3">
                        {grammarCheck.errors.map((error, index) => (
                          <div key={index} className="bg-red-50 p-3 rounded-md border border-red-200">
                            <div className="flex gap-2 mb-1">
                              <span className="font-medium">Original:</span>
                              <span className="text-red-600">{error.original}</span>
                            </div>
                            <div className="flex gap-2 mb-1">
                              <span className="font-medium">Correção:</span>
                              <span className="text-green-600">{error.correction}</span>
                            </div>
                            <div>
                              <span className="font-medium">Explicação:</span>
                              <p className="text-gray-700 text-sm mt-1">{error.explanation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {grammarCheck.suggestions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Sugestões de melhoria:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {grammarCheck.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-gray-700">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </main>
    </div>
  );
};

export default Idiomas;