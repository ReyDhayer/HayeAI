import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar a API Gemini
const genAI = new GoogleGenerativeAI('AIzaSyBJdcax0rOhfbjVpHlDKutHbezIFLN4DDQ');

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
  const [error, setError] = useState<string | null>(null);

  const analyzeReferences = async () => {
    if (!references.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Configurar o modelo
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
        },
      });

      // Construir o prompt
      const prompt = `
      Analise as seguintes referências bibliográficas e formate-as corretamente de acordo com o estilo de citação ${citationStyle.toUpperCase()}.
      Para cada referência, identifique:
      1. Tipo (livro, artigo, tese, site, etc.)
      2. Autores
      3. Título
      4. Ano
      5. Fonte (editora, revista, universidade, etc.)
      6. Referência formatada completa no estilo ${citationStyle.toUpperCase()}

      Retorne os resultados em formato JSON com a seguinte estrutura:
      {
        "references": [
          {
            "type": "string",
            "authors": ["string"],
            "title": "string",
            "year": "string",
            "source": "string",
            "formattedReference": "string"
          }
        ]
      }

      Referências a serem analisadas:
      ${references}
      `;

      console.log("Enviando prompt para a API Gemini:", prompt);
      
      // Fazer a chamada para a API
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log("Resposta da API Gemini:", text);

      // Extrair o JSON da resposta
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```\n([\s\S]*?)\n```/) || 
                        text.match(/{[\s\S]*?}/);
                        
      let jsonStr = '';
      
      if (jsonMatch) {
        jsonStr = jsonMatch[1] || jsonMatch[0];
      } else {
        jsonStr = text;
      }

      // Parsear o JSON
      const data = JSON.parse(jsonStr);
      
      if (!data.references || !Array.isArray(data.references)) {
        throw new Error("Formato de resposta inválido");
      }

      // Mapear os resultados para o formato esperado
      const formattedReferences: Reference[] = data.references.map((ref: any, index: number) => ({
        id: index + 1,
        type: ref.type || "desconhecido",
        authors: Array.isArray(ref.authors) ? ref.authors : [ref.authors || "Autor desconhecido"],
        title: ref.title || "Título desconhecido",
        year: ref.year || "Ano desconhecido",
        source: ref.source || "Fonte desconhecida",
        formattedReference: ref.formattedReference || "Referência não formatada"
      }));

      setAnalyzedReferences(formattedReferences);
    } catch (err) {
      console.error("Erro ao analisar referências:", err);
      setError("Ocorreu um erro ao analisar as referências. Por favor, tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
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
                onClick={analyzeReferences}
                disabled={!references.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analisando...' : 'Analisar Referências'}
              </Button>
            </div>
          </Card>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

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