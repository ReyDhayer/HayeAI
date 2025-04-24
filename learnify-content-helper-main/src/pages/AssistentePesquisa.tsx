import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { ExternalLink } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface SearchResult {
  id: number;
  title: string;
  subtitle?: string;
  authors: string[];
  abstract: string;
  journal: string;
  year: string;
  citations: number;
  url: string;
  source?: string;
}

type SearchMode = 'urls' | 'web' | 'custom';

interface SearchOptions {
  mode: SearchMode;
  customUrl?: string;
}

interface ColoredTag {
  text: string;
  color: string;
}

interface SavedReference {
  id: number;
  reference: SearchResult;
  notes: string;
  tags: ColoredTag[];
  sites: string[];
  color: string;
  isEditing?: boolean;
}

const RESULTS_PER_PAGE = 5;

const AssistentePesquisa: React.FC = () => {
  const [subtitle, setSubtitle] = useState('Encontre, salve e personalize referências acadêmicas com facilidade.');
  const [subtitleInput, setSubtitleInput] = useState(subtitle);
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const fadeIn = useFadeIn(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [allSearchResults, setAllSearchResults] = useState<SearchResult[]>([]);
  const [displayedSearchResults, setDisplayedSearchResults] = useState<SearchResult[]>([]);
  const [savedReferences, setSavedReferences] = useState<SavedReference[]>([]);
  const [editBuffer, setEditBuffer] = useState<{ [id: number]: Partial<SearchResult> & { subtitle?: string; tags?: ColoredTag[]; sites?: string[]; color?: string; notes?: string } }>({});
  const [newSiteInput, setNewSiteInput] = useState<{ [id: number]: string }>({});
  // Removido controle de abas, só haverá web

  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchMode, setSearchMode] = useState<SearchMode>('urls');
  const [customUrl, setCustomUrl] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1'); // padrão: Indigo
  const tagColors = ['#6366f1', '#10b981', '#f59e42', '#f43f5e', '#a21caf', '#06b6d4'];

  const [newSite, setNewSite] = useState('');
  const [newCardColor, setNewCardColor] = useState('#6366f1'); // padrão: Indigo
  const cardColors = ['#6366f1', '#10b981', '#f59e42', '#f43f5e', '#a21caf', '#06b6d4'];
  const [searchSaved, setSearchSaved] = useState('');

  // Filtro de referências salvas por nome ou tag
  const filteredSavedReferences = savedReferences.filter(ref => {
  const query = searchSaved.toLowerCase();
  return (
    ref.reference.title.toLowerCase().includes(query) ||
    ref.tags.some(tag => typeof tag.text === 'string' && tag.text.toLowerCase().includes(query))
  );
});

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const generateRealUrl = (title: string, journal: string) => {
    const baseUrls = {
      'Google Scholar': 'https://scholar.google.com.br/scholar?q=',
      'SciELO': 'https://scielo.org/search/',
      'PubMed': 'https://pubmed.ncbi.nlm.nih.gov/?term=',
      'ScienceDirect': 'https://www.sciencedirect.com/search?qs=',
      'SpringerLink': 'https://link.springer.com/search?query=',
      'Wiley Online Library': 'https://onlinelibrary.wiley.com/action/doSearch?AllField=',
      'IEEE Xplore': 'https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=',
      'ResearchGate': 'https://www.researchgate.net/search/publication?q=',
      'DOAJ': 'https://doaj.org/search?source={%22query%22:{%22query_string%22:{%22query%22:',
      'Periódicos CAPES': 'https://periodicos.capes.gov.br/?option=com_jresearch&view=search&Itemid=122&lang=pt_BR&search='
    };

    let baseUrl = 'https://www.google.com/search?q=';
    for (const [key, url] of Object.entries(baseUrls)) {
      if (journal.includes(key)) {
        baseUrl = url;
        break;
      }
    }

    const encodedTitle = encodeURIComponent(title);
    return `${baseUrl}${encodedTitle}`;
  };

  useEffect(() => {
    const saved = localStorage.getItem('savedReferences');
    if (saved) {
      try {
        setSavedReferences(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar referências salvas:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savedReferences', JSON.stringify(savedReferences));
  }, [savedReferences]);

  useEffect(() => {
    if (allSearchResults.length > 0) {
      const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
      const endIndex = startIndex + RESULTS_PER_PAGE;
      setDisplayedSearchResults(allSearchResults.slice(startIndex, endIndex));
    }
  }, [currentPage, allSearchResults]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Por favor, insira um termo de pesquisa');
      return;
    }

    setIsSearching(true);
    setError(null);
    
    try {
      const simulatedResults = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Resultado sobre "${searchQuery.trim()}" - Artigo ${i + 1}`,
        authors: ['Autor Principal', 'Coautor Secundário'],
        abstract: `Este é um resumo do artigo sobre "${searchQuery.trim()}". Este artigo discute aspectos importantes relacionados ao tema e apresenta conclusões relevantes para a área.`,
        journal: 'Revista Acadêmica',
        year: new Date().getFullYear().toString(),
        citations: Math.floor(Math.random() * 100),
        source: generateRealUrl(searchQuery.trim(), 'Google Scholar'),
        url: generateRealUrl(searchQuery.trim(), 'Google Scholar')
      }));
      
      setAllSearchResults(simulatedResults);
      setDisplayedSearchResults(simulatedResults.slice(0, RESULTS_PER_PAGE));
      setTotalPages(Math.ceil(simulatedResults.length / RESULTS_PER_PAGE));
      toast.success(`${simulatedResults.length} resultados encontrados!`);
    } catch (error) {
      console.error('Erro ao buscar resultados:', error);
      setError('Ocorreu um erro ao buscar resultados. Por favor, tente novamente.');
      toast.error('Erro ao buscar resultados');
    } finally {
      setIsSearching(false);
    }
  };

  const saveReference = (reference: SearchResult) => {
  const newSavedReference: SavedReference = {
    id: Date.now(),
    reference,
    notes: '',
    tags: [],
    sites: [],
    color: newCardColor,
    isEditing: false
  };
  setSavedReferences([...savedReferences, newSavedReference]);
  toast.success('Referência salva com sucesso!');
};

  const toggleEdit = (id: number) => {
  setSavedReferences(savedReferences.map(ref =>
    ref.id === id ? { ...ref, isEditing: !ref.isEditing } : { ...ref, isEditing: false }
  ));
  // Preenche o editBuffer com os dados atuais ao entrar em edição
  const refToEdit = savedReferences.find(ref => ref.id === id);
  if (refToEdit) {
    setEditBuffer(prev => ({ ...prev, [id]: { ...refToEdit.reference } }));
  }
};

  const updateReference = (id: number) => {
  const buffer = editBuffer[id];
  if (!buffer) return;
  setSavedReferences(savedReferences.map(ref => {
    if (ref.id === id) {
      return {
        ...ref,
        reference: { ...ref.reference, ...buffer },
        tags: buffer.tags || ref.tags,
        sites: buffer.sites || ref.sites,
        color: buffer.color || ref.color,
        isEditing: false
      };
    }
    return { ...ref, isEditing: false };
  }));
  setEditBuffer(prev => {
    const { [id]: _, ...rest } = prev;
    return rest;
  });
  toast.success('Referência atualizada com sucesso!');
};

const cancelEdit = (id: number) => {
  setSavedReferences(savedReferences.map(ref =>
    ref.id === id ? { ...ref, isEditing: false } : ref
  ));
  setEditBuffer(prev => {
    const { [id]: _, ...rest } = prev;
    return rest;
  });
};

const handleEditBufferChange = (id: number, field: keyof SearchResult, value: any) => {
  setEditBuffer(prev => ({
    ...prev,
    [id]: { ...prev[id], [field]: value }
  }));
};

  const updateNotes = (id: number, notes: string) => {
    setSavedReferences(savedReferences.map(ref =>
      ref.id === id ? { ...ref, notes } : ref
    ));
    toast.success('Anotações atualizadas!');
  };

  const addTag = (id: number, tag: string, color: string) => {
  if (!tag.trim()) return;
  setSavedReferences(savedReferences.map(ref => {
    if (ref.id === id) {
      if (ref.tags.some(t => t.text === tag.trim())) {
        toast.error('Esta tag já existe!');
        return ref;
      }
      return { ...ref, tags: [...ref.tags, { text: tag.trim(), color }] };
    }
    return ref;
  }));
  toast.success('Tag adicionada!');
};

  const removeReference = (id: number) => {
    setSavedReferences(savedReferences.filter(ref => ref.id !== id));
    toast.success('Referência removida!');
  };

  const removeTag = (referenceId: number, tagIndex: number) => {
  setSavedReferences(prev => prev.map(ref => {
    if (ref.id === referenceId) {
      return {
        ...ref,
        tags: ref.tags.filter((_, index) => index !== tagIndex)
      };
    }
    return ref;
  }));
  toast.success('Tag removida com sucesso!');
};

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

    return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-2">Assistente de Pesquisa Acadêmica</h1>
            {/* Subtítulo editável */}
            <div className="flex flex-col items-center mb-8">
              {!isEditingSubtitle ? (
                <>
                  <span className="text-lg text-muted-foreground text-center">{subtitle}</span>
                  <Button variant="ghost" size="sm" className="mt-1" onClick={() => setIsEditingSubtitle(true)}>
                    Editar subtítulo
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 w-full max-w-xl">
                  <Input
                    value={subtitleInput}
                    onChange={e => setSubtitleInput(e.target.value)}
                    className="w-full"
                    placeholder="Digite o subtítulo da página..."
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { setSubtitle(subtitleInput); setIsEditingSubtitle(false); }}>Salvar</Button>
                    <Button size="sm" variant="outline" onClick={() => { setSubtitleInput(subtitle); setIsEditingSubtitle(false); }}>Cancelar</Button>
                  </div>
                </div>
              )}
            </div>
          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Apenas conteúdo da busca web, removendo Tabs e blocos duplicados */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Digite sua pesquisa na web..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Pesquisando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Pesquisar
                  </>
                )}
              </Button>
            </div>

            {isSearching && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {displayedSearchResults.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Resultados da Pesquisa</h2>
                {displayedSearchResults.map((result) => (
                  <Card key={result.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <span>{result.title}</span>
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </CardTitle>
                      <CardDescription>{result.abstract}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => saveReference(result)}
                        >
                          Salvar Referência
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.year}
                      </div>
                    </CardFooter>
                  </Card>
                ))}

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="mx-2">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Campo de busca por referência salva */}
          {savedReferences.length > 0 && (
  <div className="mt-12">
    <h2 className="text-2xl font-semibold mb-6">Referências Salvas</h2>
    <div className="mb-4 flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
      <Input
        placeholder="Buscar por nome ou tag..."
        value={searchSaved}
        onChange={e => setSearchSaved(e.target.value)}
        className="w-full md:w-1/2"
      />
    </div>
    <div className="space-y-4">
      {filteredSavedReferences.map((savedRef) => {
  const cardColor = savedRef.color || '#6366f1';
  return (
    <div
      key={savedRef.id}
      className={`relative rounded-xl shadow-lg transition-transform duration-300 bg-white dark:bg-zinc-900 overflow-hidden ${savedRef.isEditing ? 'ring-4 ring-offset-2 ring-offset-background scale-[1.01]' : ''}`}
      style={{ borderLeft: `8px solid ${cardColor}` }}
    >
      <div className={`w-full h-2`} style={{ background: cardColor }} />
      <div className={`p-6 transition-all duration-500 ${savedRef.isEditing ? 'animate-fade-in' : ''}`}>
        {/* Título com animação e cor */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl font-bold" style={{ color: cardColor }}>{savedRef.reference.title}</span>
{savedRef.reference.subtitle && (
  <div className="text-sm text-muted-foreground mt-1">{savedRef.reference.subtitle}</div>
)}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="transition hover:scale-105"
              onClick={() => toggleEdit(savedRef.id)}
            >
              {savedRef.isEditing ? 'Cancelar' : 'Editar'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="transition hover:scale-105"
              onClick={() => removeReference(savedRef.id)}
            >
              Remover
            </Button>
          </div>
        </div>
        {/* Abstract */}
        <div className="text-sm text-muted-foreground mb-2 animate-fade-in">
          {savedRef.reference.abstract}
        </div>
        {/* Sites */}
        <div className="mb-3">
          <Label className="text-base font-semibold" style={{ color: cardColor }}>Sites</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {savedRef.sites && savedRef.sites.map((site, idx) => (
              <a
                key={idx}
                href={site}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 rounded bg-opacity-80 text-white text-xs transition hover:scale-105"
                style={{ background: cardColor }}
              >
                {site}
              </a>
            ))}
          </div>
          {savedRef.isEditing && (
            <div className="flex gap-2 mt-2">
              <Input
  value={newSiteInput[savedRef.id] || ''}
  onChange={e => setNewSiteInput(prev => ({ ...prev, [savedRef.id]: e.target.value }))}
  placeholder="Adicionar link do site..."
  className="w-64"
  onKeyDown={e => {
    if (e.key === 'Enter' && (newSiteInput[savedRef.id] || '').trim()) {
      const url = (newSiteInput[savedRef.id] || '').trim();
      setEditBuffer(prev => {
  const prevSites = Array.isArray(prev[savedRef.id]?.sites) ? prev[savedRef.id]?.sites : savedRef.sites;
  return {
    ...prev,
    [savedRef.id]: {
      ...prev[savedRef.id],
      sites: [...prevSites, url],
    }
  };
});
      setNewSiteInput(prev => ({ ...prev, [savedRef.id]: '' }));
    }
  }}
/>
<Button
  variant="outline"
  size="sm"
  style={{ background: cardColor, color: 'white' }}
  onClick={() => {
    const url = (newSiteInput[savedRef.id] || '').trim();
    if (url) {
      setEditBuffer(prev => {
  const prevSites = Array.isArray(prev[savedRef.id]?.sites) ? prev[savedRef.id]?.sites : savedRef.sites;
  return {
    ...prev,
    [savedRef.id]: {
      ...prev[savedRef.id],
      sites: [...prevSites, url],
    }
  };
});
      setNewSiteInput(prev => ({ ...prev, [savedRef.id]: '' }));
    }
  }}
>
  Adicionar
</Button>
            </div>
          )}
        </div>
        {/* Anotações */}
        <div className="mb-3">
          <Label className="text-base font-semibold">Anotações</Label>
          {savedRef.isEditing ? (
            <Textarea
  value={editBuffer[savedRef.id]?.notes ?? savedRef.notes}
  onChange={e => setEditBuffer(prev => ({
    ...prev,
    [savedRef.id]: {
      ...prev[savedRef.id],
      notes: e.target.value
    }
  }))}
  placeholder="Adicione suas anotações aqui..."
  className="mt-2 animate-fade-in"
/>
          ) : (
            <div className="mt-2 text-sm animate-fade-in">{savedRef.notes}</div>
          )}
        </div>
        {/* Título e subtítulo */}
        {savedRef.isEditing && (
  <div className="mb-3">
    <Label className="text-base font-semibold">Título e Subtítulo</Label>
    <Input
      value={editBuffer[savedRef.id]?.title ?? savedRef.reference.title}
      onChange={e => handleEditBufferChange(savedRef.id, 'title', e.target.value)}
      placeholder="Título"
      className="font-semibold text-lg"
    />
    <Input
      value={editBuffer[savedRef.id]?.subtitle ?? savedRef.reference.subtitle ?? ''}
      onChange={e => handleEditBufferChange(savedRef.id, 'subtitle', e.target.value)}
      placeholder="Subtítulo (opcional)"
      className="text-sm mt-2"
    />
    <Label className="text-base font-semibold mt-4">Resumo Personalizado</Label>
    <textarea
      value={editBuffer[savedRef.id]?.abstract ?? savedRef.reference.abstract}
      onChange={e => handleEditBufferChange(savedRef.id, 'abstract', e.target.value)}
      placeholder="Digite o resumo personalizado do artigo aqui..."
      className="w-full border rounded p-2 mt-1 text-sm min-h-[70px]"
      style={{ resize: 'vertical' }}
    />
  </div>
)}
        {/* Tags */}
        <div>
          <Label className="text-base font-semibold">Tags</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {savedRef.tags.map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold shadow-sm cursor-pointer select-none transition hover:scale-105"
                style={{ background: tag.color, color: '#fff' }}
              >
                {tag.text}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeTag(savedRef.id, tagIndex)}
                />
              </span>
            ))}
            {savedRef.isEditing && (
              <>
                <Input
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder="Nova tag"
                  className="w-24"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newTag.trim()) {
                      addTag(savedRef.id, newTag, newTagColor);
                      setNewTag('');
                    }
                  }}
                />
                <select
                  value={newTagColor}
                  onChange={e => setNewTagColor(e.target.value)}
                  className="rounded px-2 py-1 border border-gray-300 focus:outline-none"
                  style={{ background: newTagColor, color: '#fff' }}
                >
                  {tagColors.map(color => (
                    <option key={color} value={color} style={{ background: color, color: '#fff' }}>{color}</option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ background: newTagColor, color: 'white' }}
                  onClick={() => {
                    if (newTag.trim()) {
                      addTag(savedRef.id, newTag, newTagColor);
                      setNewTag('');
                    }
                  }}
                >
                  Adicionar
                </Button>
              </>
            )}
          </div>
        </div>
        {/* Cor do cartão no modo edição */}
        {savedRef.isEditing && (
          <div className="mt-4 flex gap-2 items-center animate-fade-in">
            <Label>Cor do Cartão:</Label>
            <select
              value={editBuffer[savedRef.id]?.color ?? savedRef.color}
              onChange={e => setEditBuffer(prev => ({ ...prev, [savedRef.id]: { ...prev[savedRef.id], color: e.target.value } }))}
              className="rounded px-2 py-1 border border-gray-300 focus:outline-none"
              style={{ background: editBuffer[savedRef.id]?.color ?? savedRef.color, color: '#fff' }}
            >
              {cardColors.map(color => (
                <option key={color} value={color} style={{ background: color, color: '#fff' }}>{color}</option>
              ))}
            </select>
            <Button
              size="sm"
              variant="default"
              className="ml-auto animate-fade-in"
              style={{ background: editBuffer[savedRef.id]?.color ?? savedRef.color, color: '#fff' }}
              onClick={() => updateReference(savedRef.id)}
            >
              Salvar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
})}
    </div>
  </div>
)}
        </div>
      </main>
    </div>
  );
};

export default AssistentePesquisa;