import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '@/components/FileUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OptimizationResult {
  optimizedCode: string;
  improvements: Array<{
    category: string;
    suggestions: string[];
  }>;
}

const AprimoradorCodigo = () => {
  const fadeIn = useFadeIn(100);
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [improvements, setImprovements] = useState<Array<{category: string; suggestions: string[]}>>([]);

  const programmingLanguages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'swift', label: 'Swift' },
    { value: 'typescript', label: 'TypeScript' },
  ];

  const handleCodeOptimization = async () => {
    if (!inputCode.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setOutputCode('');
    setImprovements([]);
    
    try {
      // Usar a chave API fornecida diretamente
      const apiKey = "AIzaSyBJdcax0rOhfbjVpHlDKutHbezIFLN4DDQ";
      
      console.log(`Iniciando otimização de código ${selectedLanguage}`);
      
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
      
      // Prepara o prompt para otimização de código
      const prompt = `Você é um especialista em desenvolvimento de software e otimização de código. Analise e otimize o seguinte código ${selectedLanguage}:

\`\`\`${selectedLanguage}
${inputCode}
\`\`\`

IMPORTANTE: Sua resposta DEVE ser um objeto JSON válido seguindo EXATAMENTE este formato:
{
  "optimizedCode": "Código otimizado completo",
  "improvements": [
    {
      "category": "Nome da categoria de melhoria (ex: Performance, Legibilidade, etc.)",
      "suggestions": ["Sugestão detalhada 1", "Sugestão detalhada 2"]
    }
  ]
}

Instruções específicas:
1. Otimize o código mantendo sua funcionalidade original
2. Foque em melhorias de performance, legibilidade, boas práticas e correção de bugs
3. Organize as melhorias em categorias claras (Performance, Legibilidade, Segurança, etc.)
4. Para cada categoria, forneça 2-4 sugestões específicas e acionáveis
5. Mantenha o formato JSON válido

IMPORTANTE: Mantenha o formato JSON válido e evite incluir qualquer texto fora da estrutura do objeto.`;

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
          
          const parsedResult = JSON.parse(cleanedJson) as OptimizationResult;
          
          // Valida a estrutura do objeto
          if (!parsedResult.optimizedCode || !Array.isArray(parsedResult.improvements)) {
            console.error('Estrutura de resposta inválida:', parsedResult);
            throw new Error('A resposta da API não contém todos os campos necessários');
          }

          setOutputCode(parsedResult.optimizedCode);
          setImprovements(parsedResult.improvements);
        } catch (parseError) {
          console.error('Erro ao processar resposta da API:', parseError);
          throw new Error('Formato de resposta inválido. Por favor, tente novamente.');
        }
      } catch (apiError) {
        console.error('Erro na chamada da API:', apiError);
        throw new Error(`Erro na chamada da API: ${apiError.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro na otimização de código:', error);
      setError(error.message || 'Ocorreu um erro desconhecido ao otimizar o código');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto p-6 ${fadeIn}`}>
        <h1 className="text-3xl font-bold mb-6">Aprimorador de Código</h1>
        
        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione a linguagem" />
              </SelectTrigger>
              <SelectContent>
                {programmingLanguages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Código Original</label>
              <Textarea
                placeholder="Cole seu código aqui..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="min-h-[400px] font-mono"
              />
             
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Código Otimizado</label>
              <Textarea
                value={outputCode}
                readOnly
                className="min-h-[400px] font-mono"
                placeholder="O código otimizado aparecerá aqui..."
              />
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={handleCodeOptimization}
              disabled={isLoading || !inputCode}
              className="w-full md:w-auto"
            >
              {isLoading ? 'Otimizando...' : 'Otimizar Código'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {improvements.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Sugestões de Melhorias</h2>
              {improvements.map((improvement, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-lg font-medium mb-2">{improvement.category}</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {improvement.suggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {!improvements.length && !error && !isLoading && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Sugestões de Melhorias</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Análise de complexidade e performance</li>
                <li>Sugestões de boas práticas</li>
                <li>Detecção de possíveis bugs</li>
                <li>Formatação e estilo de código</li>
              </ul>
            </div>
          )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AprimoradorCodigo;