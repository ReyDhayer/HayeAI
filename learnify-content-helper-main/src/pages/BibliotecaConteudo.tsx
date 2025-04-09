import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    // Aqui será implementada a integração com APIs de busca
    try {
      // Simulação de resultados
      const mockResults: SearchResult[] = [
        {
          title: 'Artigo Acadêmico Exemplo',
          description: 'Um exemplo de artigo acadêmico sobre o tema pesquisado.',
          url: 'https://exemplo.com/artigo',
          type: 'academic',
          source: 'Google Scholar'
        },
        {
          title: 'Conteúdo Web Relevante',
          description: 'Conteúdo web relacionado à sua pesquisa.',
          url: 'https://exemplo.com/web',
          type: 'web',
          source: 'Web Search'
        }
      ];

      setResults(mockResults);
    } catch (error) {
      console.error('Erro na busca:', error);
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
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? 'Pesquisando...' : 'Pesquisar'}
            </Button>
          </div>
        </div>

      <Tabs defaultValue="todos" className="max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="academic">Acadêmico</TabsTrigger>
          <TabsTrigger value="web">Web</TabsTrigger>
          <TabsTrigger value="book">Livros</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          {filteredResults.map((result, index) => (
            <Card key={index} className="p-4">
              <h3 className="text-xl font-semibold mb-2">{result.title}</h3>
              <p className="text-gray-600 mb-2">{result.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Fonte: {result.source}</span>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Ver mais</a>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      </main>
    </div>
  );
};

export default BibliotecaConteudo;