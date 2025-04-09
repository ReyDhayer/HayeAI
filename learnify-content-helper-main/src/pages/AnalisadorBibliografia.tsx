import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';

interface Reference {
  id: number;
  type: string;
  authors: string[];
  title: string;
  year: string;
  source: string;
  formattedReference: string;
}

const AnalisadorBibliografia: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [references, setReferences] = useState<string>('');
  const [citationStyle, setCitationStyle] = useState('abnt');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedReferences, setAnalyzedReferences] = useState<Reference[]>([]);

  const analyzeReferencesMock = async () => {
    if (!references.trim()) return;

    setIsAnalyzing(true);
    // Simulação de análise - será substituída por integração com IA
    setTimeout(() => {
      const mockReferences: Reference[] = [
        {
          id: 1,
          type: 'book',
          authors: ['SILVA, João', 'SANTOS, Maria'],
          title: 'Metodologia da Pesquisa Científica',
          year: '2023',
          source: 'Editora Acadêmica',
          formattedReference: 'SILVA, João; SANTOS, Maria. Metodologia da Pesquisa Científica. São Paulo: Editora Acadêmica, 2023.'
        },
        {
          id: 2,
          type: 'article',
          authors: ['OLIVEIRA, Ana Paula'],
          title: 'Inovações em Educação Digital',
          year: '2022',
          source: 'Revista Brasileira de Educação, v. 27, n. 1, p. 45-62',
          formattedReference: 'OLIVEIRA, Ana Paula. Inovações em Educação Digital. Revista Brasileira de Educação, v. 27, n. 1, p. 45-62, 2022.'
        }
      ];
      setAnalyzedReferences(mockReferences);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Analisador de Bibliografia</h1>

          <Card className="p-6 mb-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Suas Referências</h2>
                <Textarea
                  placeholder="Cole suas referências bibliográficas aqui (uma por linha)..."
                  value={references}
                  onChange={(e) => setReferences(e.target.value)}
                  className="min-h-[200px] mb-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estilo de Citação</label>
                <Select value={citationStyle} onValueChange={setCitationStyle}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o estilo de citação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abnt">ABNT</SelectItem>
                    <SelectItem value="apa">APA</SelectItem>
                    <SelectItem value="vancouver">Vancouver</SelectItem>
                    <SelectItem value="chicago">Chicago</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={analyzeReferencesMock}
                disabled={!references.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analisando...' : 'Analisar Referências'}
              </Button>
            </div>
          </Card>

          {analyzedReferences.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Referências Formatadas</h2>
              <div className="space-y-6">
                {analyzedReferences.map((ref) => (
                  <div key={ref.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{ref.title}</h3>
                        <p className="text-gray-600">{ref.authors.join('; ')}</p>
                      </div>
                      <span className="px-3 py-1 bg-muted rounded-full text-sm">
                        {ref.type}
                      </span>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Referência Formatada:</h4>
                      <p className="text-gray-700">{ref.formattedReference}</p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Ano: </span>
                        <span className="text-gray-600">{ref.year}</span>
                      </div>
                      <div>
                        <span className="font-medium">Fonte: </span>
                        <span className="text-gray-600">{ref.source}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AnalisadorBibliografia;