import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '@/components/FileUpload';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface GeneratedEssay {
  title: string;
  content: string;
  outline: string[];
  references: string[];
  keywords: string[];
}

const GeradorRedacoes: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [topic, setTopic] = useState('');
  const [essayType, setEssayType] = useState('enem');
  const [customRequirements, setCustomRequirements] = useState('');
  const [showCustomRequirements, setShowCustomRequirements] = useState(false);
  const [wordCount, setWordCount] = useState('500');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEssay, setGeneratedEssay] = useState<GeneratedEssay | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateEssay = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError(null);
    
    try {
      // Usar a chave API fornecida diretamente
      const apiKey = "AIzaSyBJdcax0rOhfbjVpHlDKutHbezIFLN4DDQ";
      
      console.log('Iniciando geração de redação com a chave API fornecida');
      
      // Inicializa a API do Google Generative AI com a chave API
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Configura o modelo com parâmetros específicos
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.8,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 4096,
        }
      });

      console.log('Modelo configurado, preparando prompt...');

      // Determina o tipo de redação em português
      let essayTypeText = "";
      switch(essayType) {
        case 'dissertativo':
          essayTypeText = "dissertativo-argumentativo";
          break;
        case 'narrativo':
          essayTypeText = "narrativo";
          break;
        case 'descritivo':
          essayTypeText = "descritivo";
          break;
        case 'enem':
          essayTypeText = "no estilo ENEM (dissertativo-argumentativo com proposta de intervenção)";
          break;
        case 'personalizado':
          essayTypeText = `personalizado com os seguintes requisitos: ${customRequirements}`;
          break;
        default:
          essayTypeText = "dissertativo-argumentativo";
      }

      // Prepara o prompt para geração da redação
      const prompt = `Gere uma redação completa sobre o tema "${topic}" no formato ${essayTypeText} com aproximadamente ${wordCount} palavras.

IMPORTANTE: Sua resposta DEVE ser um objeto JSON válido seguindo EXATAMENTE este formato:
{
  "title": "Título da redação",
  "content": "Texto completo da redação, com parágrafos separados por quebras de linha",
  "outline": ["Tópico 1: Introdução", "Tópico 2: Desenvolvimento", "Tópico 3: Conclusão"],
  "references": ["Referência 1", "Referência 2", "Referência 3"],
  "keywords": ["palavra-chave1", "palavra-chave2", "palavra-chave3", "palavra-chave4", "palavra-chave5"]
}

Instruções específicas:
1. A redação deve ser original, bem estruturada e coerente
2. Inclua pelo menos 4 parágrafos bem desenvolvidos
3. O título deve ser criativo e relacionado ao tema
4. A estrutura (outline) deve ter pelo menos 5 tópicos detalhados
5. Inclua pelo menos 3 referências bibliográficas fictícias mas plausíveis
6. Inclua pelo menos 5 palavras-chave relevantes para o tema

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
          
          const parsedEssay = JSON.parse(cleanedJson);
          
          // Valida a estrutura do objeto
          if (!parsedEssay.title || !parsedEssay.content || 
              !Array.isArray(parsedEssay.outline) || 
              !Array.isArray(parsedEssay.references) || 
              !Array.isArray(parsedEssay.keywords)) {
            console.error('Estrutura de resposta inválida:', parsedEssay);
            throw new Error('A resposta da API não contém todos os campos necessários');
          }

          // Formata o conteúdo para exibir quebras de linha corretamente
          parsedEssay.content = parsedEssay.content.replace(/\\n/g, '\n');
          
          setGeneratedEssay(parsedEssay);
        } catch (parseError) {
          console.error('Erro ao processar resposta da API:', parseError);
          throw new Error('Formato de resposta inválido. Por favor, tente novamente.');
        }
      } catch (apiError) {
        console.error('Erro na chamada da API:', apiError);
        throw new Error(`Erro na chamada da API: ${apiError.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao gerar redação:', error);
      setError(error.message || 'Ocorreu um erro desconhecido ao gerar a redação');
      setGeneratedEssay(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Gerador de Redações</h1>

          <Card className="p-6 mb-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Configurações da Redação</h2>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tema da Redação</label>
                    <Input
                      placeholder="Digite o tema da sua redação..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo de Redação</label>
                      <Select 
                        value={essayType} 
                        onValueChange={(value) => {
                          setEssayType(value);
                          setShowCustomRequirements(value === 'personalizado');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dissertativo">Dissertativo-Argumentativo</SelectItem>
                          <SelectItem value="narrativo">Narrativo</SelectItem>
                          <SelectItem value="descritivo">Descritivo</SelectItem>
                          <SelectItem value="enem">ENEM</SelectItem>
                          <SelectItem value="personalizado">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Número de Palavras</label>
                      <Select value={wordCount} onValueChange={setWordCount}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tamanho" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="300">300 palavras</SelectItem>
                          <SelectItem value="500">500 palavras</SelectItem>
                          <SelectItem value="700">700 palavras</SelectItem>
                          <SelectItem value="1000">1000 palavras</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                {showCustomRequirements && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Requisitos Personalizados</label>
                    <Textarea
                      placeholder="Descreva seus requisitos específicos para a redação (estilo, critérios, abordagem, etc.)..."
                      value={customRequirements}
                      onChange={(e) => setCustomRequirements(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                )}
              </div>

              <Button
                onClick={generateEssay}
                disabled={!topic.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Gerando Redação...' : 'Gerar Redação'}
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

          {generatedEssay && (
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">{generatedEssay.title}</h2>
                  <Textarea
                    value={generatedEssay.content}
                    readOnly
                    className="min-h-[400px] mb-4"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Estrutura da Redação</h3>
                  <ul className="list-decimal list-inside space-y-2">
                    {generatedEssay.outline.map((item, index) => (
                      <li key={index} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Palavras-chave</h3>
                    <div className="flex flex-wrap gap-2">
                      {generatedEssay.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-muted rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Referências</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {generatedEssay.references.map((reference, index) => (
                        <li key={index} className="text-gray-700">{reference}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default GeradorRedacoes;