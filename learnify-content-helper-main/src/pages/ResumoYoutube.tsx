import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';

interface VideoSummary {
  title: string;
  duration: string;
  mainPoints: string[];
  summary: string;
  timestamps: Array<{
    time: string;
    description: string;
  }>;
}

const ResumoYoutube: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [videoUrl, setVideoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summary, setSummary] = useState<VideoSummary | null>(null);

  const analyzeVideoMock = async () => {
    if (!videoUrl.trim()) return;

    setIsAnalyzing(true);
    // Simulação de análise - será substituída por integração com API do YouTube e IA
    setTimeout(() => {
      const mockSummary: VideoSummary = {
        title: 'Título do Vídeo Exemplo',
        duration: '15:30',
        mainPoints: [
          'Introdução ao tema principal',
          'Desenvolvimento dos conceitos básicos',
          'Exemplos práticos e aplicações',
          'Conclusões e considerações finais'
        ],
        summary: 'Este vídeo aborda de forma abrangente o tema X, começando com uma introdução clara e progredindo através de conceitos fundamentais. O apresentador utiliza exemplos práticos para ilustrar os pontos principais e conclui com recomendações valiosas.',
        timestamps: [
          { time: '0:00', description: 'Introdução' },
          { time: '3:45', description: 'Conceitos Básicos' },
          { time: '7:20', description: 'Exemplos Práticos' },
          { time: '12:15', description: 'Conclusão' }
        ]
      };
      setSummary(mockSummary);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Resumo de Vídeos do YouTube</h1>

          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Analisar Vídeo</h2>
            <div className="space-y-4">
              <Input
                placeholder="Cole aqui o link do vídeo do YouTube..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full"
              />
              <Button
                onClick={analyzeVideoMock}
                disabled={!videoUrl.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analisando...' : 'Gerar Resumo'}
              </Button>
            </div>
          </Card>

          {summary && (
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{summary.title}</h2>
                  <p className="text-gray-600">Duração: {summary.duration}</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Principais Pontos</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {summary.mainPoints.map((point, index) => (
                      <li key={index} className="text-gray-700">{point}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Resumo</h3>
                  <p className="text-gray-700">{summary.summary}</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Momentos Importantes</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {summary.timestamps.map((timestamp, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-muted rounded-lg">
                        <span className="font-mono text-sm">{timestamp.time}</span>
                        <span className="text-gray-700">{timestamp.description}</span>
                      </div>
                    ))}
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

export default ResumoYoutube;