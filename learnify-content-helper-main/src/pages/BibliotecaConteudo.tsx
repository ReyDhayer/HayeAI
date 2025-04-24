import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface SearchResult {
  title: string;
  description: string;
  url: string;
  type: 'academic' | 'web' | 'book';
  source: string;
}

const BibliotecaConteudo: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeTab, setActiveTab] = useState('todos');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults([]);
    
    try {
      // Usar a chave API fornecida diretamente
      const apiKey = "AIzaSyBJdcax0rOhfbjVpHlDKutHbezIFLN4DDQ";
      
      console.log('Iniciando busca de conteúdo com a chave API fornecida');
      
      // Inicializa a API do Google Generative AI com a chave API
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Configura o modelo com parâmetros específicos
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.2, // Temperatura mais baixa para resultados mais factuais
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        }
      });

      console.log('Modelo configurado, preparando prompt...');

      // Prepara o prompt para busca de conteúdo
      const prompt = `Atue como um assistente de biblioteca acadêmica e forneça uma lista de recursos educacionais relevantes sobre o seguinte tema: "${searchQuery}".

IMPORTANTE: Sua resposta DEVE ser um array JSON válido com pelo menos 5 recursos, seguindo EXATAMENTE este formato:
[
  {
    "title": "Título do recurso",
    "description": "Descrição detalhada do recurso (50-100 palavras)",
    "url": "URL para acessar o recurso (DEVE ser uma URL real e válida)",
    "type": "academic" ou "web" ou "book",
    "source": "Nome da fonte (ex: Google Scholar, Biblioteca Digital, etc.)"
  }
]

Instruções específicas:
1. Inclua uma mistura de tipos de recursos: acadêmicos (artigos, papers), web (sites, blogs, vídeos) e livros
2. Forneça pelo menos 2 recursos de cada tipo
3. Priorize recursos em português, mas pode incluir alguns em inglês se relevantes
4. As descrições devem ser informativas e específicas ao conteúdo
5. IMPORTANTE: Use APENAS URLs reais e válidas de fontes confiáveis:
   - Para artigos acadêmicos: Google Scholar, SciELO, ResearchGate
   - Para livros: Google Books, Amazon, bibliotecas digitais
   - Para web: sites educacionais, blogs acadêmicos, YouTube
6. Verifique se cada URL fornecida é acessível e leva diretamente ao recurso

Lembre-se: Mantenha o formato JSON válido e evite incluir qualquer texto fora da estrutura do array.`

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
              typeof item.title === 'string' &&
              typeof item.description === 'string' &&
              typeof item.url === 'string' &&
              (item.type === 'academic' || item.type === 'web' || item.type === 'book') &&
              typeof item.source === 'string';
            
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
      console.error('Erro na busca:', error);
      setError(error.message || 'Ocorreu um erro desconhecido ao buscar conteúdo');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResults = activeTab === 'todos'
    ? results
    : results.filter(result => result.type === activeTab);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <h1 className="text-3xl font-bold mb-8 text-center">Biblioteca de Conteúdo</h1>
        
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Digite sua pesquisa aqui..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleSearch();
                }
              }}
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
            >
              {isLoading ? 'Pesquisando...' : 'Pesquisar'}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="p-4 mb-6 border-red-500 max-w-3xl mx-auto">
            <div className="text-red-500 font-medium">
              Erro: {error}
            </div>
          </Card>
        )}

        {isLoading && (
          <Card className="p-6 mb-6 max-w-3xl mx-auto">
            <div className="text-center py-8">
              <p className="text-gray-600 mb-2">Buscando conteúdo sobre "{searchQuery}"...</p>
              <p className="text-sm text-gray-500">Isso pode levar alguns segundos</p>
            </div>
          </Card>
        )}

        {results.length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="todos">
                Todos ({results.length})
              </TabsTrigger>
              <TabsTrigger value="academic">
                Acadêmico ({results.filter(r => r.type === 'academic').length})
              </TabsTrigger>
              <TabsTrigger value="web">
                Web ({results.filter(r => r.type === 'web').length})
              </TabsTrigger>
              <TabsTrigger value="book">
                Livros ({results.filter(r => r.type === 'book').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredResults.length > 0 ? (
                filteredResults.map((result, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-semibold mb-2">{result.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        result.type === 'academic' ? 'bg-blue-100 text-blue-800' : 
                        result.type === 'web' ? 'bg-green-100 text-green-800' : 
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {result.type === 'academic' ? 'Acadêmico' : 
                         result.type === 'web' ? 'Web' : 'Livro'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{result.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Fonte: {result.source}</span>
                      <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Ver mais</a>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum resultado encontrado para este tipo de conteúdo.
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!isLoading && results.length === 0 && !error && (
          <div className="text-center py-8 text-gray-500 max-w-3xl mx-auto">
            Digite um termo de pesquisa e clique em "Pesquisar" para encontrar conteúdo relevante.
          </div>
        )}
      </main>
    </div>
  );
};

export default BibliotecaConteudo;