import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from '@/components/FileUpload';
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';

interface PlagiarismResult {
  text: string;
  similarity: number;
  source: string;
  url: string;
}

const AnalisePlagio: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<PlagiarismResult[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleTextAnalysis = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
      // Simulação de análise de plágio
      const mockResults: PlagiarismResult[] = [
        {
          text: 'Este trecho apresenta similaridade com outro conteúdo.',
          similarity: 85,
          source: 'Site Acadêmico',
          url: 'https://exemplo.com/fonte1'
        }
      ];

      setResults(mockResults);
    } catch (error) {
      console.error('Erro na análise:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileAnalysis = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    try {
      // Aqui será implementada a lógica de análise do arquivo
      const mockResults: PlagiarismResult[] = [
        {
          text: 'Conteúdo similar encontrado no arquivo.',
          similarity: 75,
          source: 'Repositório Acadêmico',
          url: 'https://exemplo.com/fonte2'
        }
      ];

      setResults(mockResults);
    } catch (error) {
      console.error('Erro na análise do arquivo:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <h1 className="text-3xl font-bold mb-8 text-center">Análise de Plágio</h1>

        <div className="max-w-3xl mx-auto space-y-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Análise por Texto</h2>
          <Textarea
            placeholder="Cole seu texto aqui para análise..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mb-4"
            rows={6}
          />
          <FileUpload
            onFileChange={(files) => {
              if (files && files[0]) {
                setFile(files[0]);
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (e.target?.result) {
                    setText(e.target.result as string);
                  }
                };
                reader.readAsText(files[0]);
              }
            }}
            label="Enviar arquivo"
            accept=".doc,.docx,.pdf,.txt"
          />
          <Button
            onClick={handleTextAnalysis}
            disabled={isAnalyzing || (!text.trim() && !file)}
            className="w-full mt-4"
          >
            {isAnalyzing ? 'Analisando...' : 'Analisar'}
          </Button>
          </Card>

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Resultados da Análise</h2>
            {results.map((result, index) => (
              <Alert key={index} className={`${result.similarity > 80 ? 'bg-red-50' : 'bg-yellow-50'}`}>
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Trecho analisado:</p>
                    <p className="text-gray-600">"{result.text}"</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        Similaridade: {result.similarity}% | Fonte: {result.source}
                      </span>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Ver Fonte
                      </a>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </div>
      </main>
    </div>
  );
};

export default AnalisePlagio;