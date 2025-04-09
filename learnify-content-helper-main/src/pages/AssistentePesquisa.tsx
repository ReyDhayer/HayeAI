import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';

interface SearchResult {
  id: number;
  title: string;
  authors: string[];
  abstract: string;
  journal: string;
  year: string;
  citations: number;
  url: string;
}

interface SavedReference {
  id: number;
  reference: SearchResult;
  notes: string;
  tags: string[];
}

const AssistentePesquisa: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [savedReferences, setSavedReferences] = useState<SavedReference[]>([]);
  const [activeTab, setActiveTab] = useState('busca');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    // Simulação de busca - será substituída por integração com APIs acadêmicas
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: 1,
          title: 'Avanços Recentes em Inteligência Artificial',
          authors: ['Silva, J.', 'Santos, M.'],
          abstract: 'Este artigo apresenta uma revisão dos avanços recentes no campo da IA...',
          journal: 'Revista Brasileira de Computação',
          year: '2023',
          citations: 45,
          url: 'https://exemplo.com/artigo1'
        },
        {
          id: 2,
          title: 'Metodologias Inovadoras no Ensino Superior',
          authors: ['Oliveira, A.', 'Pereira, C.'],
          abstract: 'Uma análise das novas metodologias de ensino aplicadas...',
          journal: 'Educação & Tecnologia',
          year: '2022',
          citations: 32,
          url: 'https://exemplo.com/artigo2'
        }
      ];
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 2000);
  };

  const saveReference = (reference: SearchResult) => {
    const newSavedReference: SavedReference = {
      id: Date.now(),
      reference,
      notes: '',
      tags: []
    };
    setSavedReferences([...savedReferences, newSavedReference]);
  };

  const updateNotes = (id: number, notes: string) => {
    setSavedReferences(savedReferences.map(ref =>
      ref.id === id ? { ...ref, notes } : ref
    ));
  };

  const addTag = (id: number, tag: string) => {
    setSavedReferences(savedReferences.map(ref =>
      ref.id === id ? { ...ref, tags: [...ref.tags, tag] } : ref
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Assistente de Pesquisa Acadêmica</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="busca">Buscar Artigos</TabsTrigger>
              <TabsTrigger value="salvos">Referências Salvas</TabsTrigger>
            </TabsList>

            <TabsContent value="busca">
              <Card className="p-6 mb-8">
                <div className="flex gap-4 mb-6">
                  <Input
                    placeholder="Digite sua pesquisa acadêmica..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>

                <div className="space-y-6">
                  {searchResults.map((result) => (
                    <Card key={result.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold">{result.title}</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => saveReference(result)}
                        >
                          Salvar
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {result.authors.join(', ')} • {result.journal} • {result.year}
                      </p>
                      <p className="text-gray-700 mb-2">{result.abstract}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Citações: {result.citations}</span>
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Ver Artigo
                        </a>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="salvos">
              <div className="space-y-6">
                {savedReferences.map((saved) => (
                  <Card key={saved.id} className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{saved.reference.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {saved.reference.authors.join(', ')} • {saved.reference.journal} • {saved.reference.year}
                    </p>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Suas Anotações:</h4>
                      <Textarea
                        value={saved.notes}
                        onChange={(e) => updateNotes(saved.id, e.target.value)}
                        placeholder="Adicione suas anotações aqui..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {saved.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-muted rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Adicionar tag"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            if (input.value.trim()) {
                              addTag(saved.id, input.value.trim());
                              input.value = '';
                            }
                          }
                        }}
                        className="w-40"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AssistentePesquisa;