import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '@/components/FileUpload';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';

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

  const generateEssayMock = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    // Simulação de geração - será substituída por integração com IA
    setTimeout(() => {
      const mockEssay: GeneratedEssay = {
        title: 'O Impacto da Tecnologia na Educação Moderna',
        content: `A revolução tecnológica tem transformado significativamente o cenário educacional nas últimas décadas. Com o advento da internet e das ferramentas digitais, o processo de ensino-aprendizagem passou por mudanças substanciais, oferecendo novas possibilidades e desafios para educadores e estudantes.

Primeiramente, é importante destacar como a tecnologia tem democratizado o acesso ao conhecimento. Plataformas de educação online, bibliotecas digitais e recursos educacionais abertos permitem que estudantes de diferentes regiões tenham acesso a conteúdos de qualidade. Além disso, a personalização do aprendizado tornou-se uma realidade, com sistemas adaptativos que identificam as necessidades individuais de cada aluno.

Contudo, é necessário considerar também os desafios dessa transformação. A exclusão digital ainda é uma realidade em muitas regiões, criando disparidades no acesso à educação. Ademais, a dependência excessiva da tecnologia pode impactar negativamente o desenvolvimento de habilidades sociais e práticas fundamentais.

Portanto, é fundamental buscar um equilíbrio na integração da tecnologia na educação, garantindo que ela seja uma ferramenta de apoio ao processo pedagógico, e não um fim em si mesma. O futuro da educação dependerá da nossa capacidade de aproveitar os benefícios da tecnologia enquanto preservamos os aspectos essenciais do desenvolvimento humano.`,
        outline: [
          'Introdução: Contextualização da revolução tecnológica na educação',
          'Democratização do acesso ao conhecimento',
          'Personalização do aprendizado',
          'Desafios e limitações',
          'Conclusão: Importância do equilíbrio na integração tecnológica'
        ],
        references: [
          'SILVA, M. Educação na Era Digital, 2023',
          'SANTOS, P. Tecnologia e Aprendizagem, 2022',
          'OLIVEIRA, R. Desafios da Educação Contemporânea, 2023'
        ],
        keywords: [
          'tecnologia educacional',
          'ensino-aprendizagem',
          'educação digital',
          'inclusão digital',
          'inovação pedagógica'
        ]
      };
      setGeneratedEssay(mockEssay);
      setIsGenerating(false);
    }, 2000);
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
                onClick={generateEssayMock}
                disabled={!topic.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Gerando Redação...' : 'Gerar Redação'}
              </Button>
            </div>
          </Card>

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
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default GeradorRedacoes;