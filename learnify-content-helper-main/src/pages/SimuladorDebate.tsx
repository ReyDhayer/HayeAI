import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface DebateArgument {
  id: number;
  argument: string;
  counterArgument: string;
  type: 'favor' | 'contra';
}

const SimuladorDebate: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [topic, setTopic] = useState('');
  const [position, setPosition] = useState<'favor' | 'contra'>('favor');
  const [isGenerating, setIsGenerating] = useState(false);
  const [debateArguments, setDebateArguments] = useState<DebateArgument[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateDebateArguments = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setDebateArguments([]);
    
    try {
      // Usar a chave API fornecida diretamente
      const apiKey = "AIzaSyBJdcax0rOhfbjVpHlDKutHbezIFLN4DDQ";
      
      console.log('Iniciando geração de argumentos para o debate');
      
      // Inicializa a API do Google Generative AI com a chave API
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Configura o modelo com parâmetros específicos
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      });

      console.log('Modelo configurado, preparando prompt...');

      // Prepara o prompt para geração de argumentos
      const prompt = `Gere argumentos e contra-argumentos para um debate acadêmico sobre o seguinte tema:

"${topic}"

Posição do debatedor: ${position === 'favor' ? 'A favor' : 'Contra'}

IMPORTANTE: Sua resposta DEVE ser um array JSON válido com pelo menos 4 argumentos, seguindo EXATAMENTE este formato:
[{
  "argument": "Argumento detalhado",
  "counterArgument": "Possível contra-argumento que o oponente pode usar",
  "type": "${position}"
}]

Para cada argumento:
- Forneça um argumento bem estruturado e fundamentado
- Inclua dados, estatísticas ou referências quando apropriado
- Forneça um possível contra-argumento que o oponente poderia usar
- Mantenha o tom acadêmico e respeitoso

Lembre-se: Mantenha o formato JSON válido e evite incluir qualquer texto fora da estrutura do array.`;

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
        
        // Tenta extrair o JSON da resposta
        let jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
        if (!jsonMatch) {
          throw new Error('Não foi possível encontrar um JSON válido na resposta');
        }
        
        const jsonStr = jsonMatch[0];
        console.log('JSON extraído:', jsonStr);
        
        try {
          // Tenta fazer o parse do JSON
          const parsedArguments = JSON.parse(jsonStr);
          console.log('JSON parseado com sucesso');
          
          // Adiciona IDs aos argumentos
          const argumentsWithIds = parsedArguments.map((arg: any, index: number) => ({
            ...arg,
            id: index + 1
          }));
          
          setDebateArguments(argumentsWithIds);
        } catch (parseError) {
          console.error('Erro ao fazer parse do JSON:', parseError);
          throw new Error('Erro ao processar a resposta: formato JSON inválido');
        }
      } catch (apiError: any) {
        console.error('Erro na chamada da API:', apiError);
        throw new Error(`Erro na chamada da API: ${apiError.message}`);
      }
    } catch (err: any) {
      console.error('Erro:', err);
      setError(err.message || 'Ocorreu um erro ao gerar os argumentos');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${fadeIn}`}>
      <Header />
      
      <main className="container mx-auto py-6 px-4">
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Prepare-se para o debate acadêmico</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Esta ferramenta ajuda você a preparar argumentos para debates acadêmicos. 
            Insira o tema do debate e escolha sua posição para receber argumentos e possíveis contra-argumentos.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="topic">
              Tema do Debate
            </label>
            <Textarea
              id="topic"
              placeholder="Ex: A inteligência artificial vai substituir os professores no futuro?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Sua Posição
            </label>
            <div className="flex space-x-4">
              <Button 
                variant={position === 'favor' ? 'default' : 'outline'}
                onClick={() => setPosition('favor')}
              >
                A Favor
              </Button>
              <Button 
                variant={position === 'contra' ? 'default' : 'outline'}
                onClick={() => setPosition('contra')}
              >
                Contra
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={generateDebateArguments} 
            disabled={isGenerating || !topic.trim()}
            className="w-full"
          >
            {isGenerating ? 'Gerando Argumentos...' : 'Gerar Argumentos para Debate'}
          </Button>
        </Card>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {debateArguments.length > 0 && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Seus Argumentos para o Debate</h2>
            
            <Tabs defaultValue="arguments">
              <TabsList className="mb-4">
                <TabsTrigger value="arguments">Argumentos</TabsTrigger>
                <TabsTrigger value="preparation">Dicas de Preparação</TabsTrigger>
              </TabsList>
              
              <TabsContent value="arguments">
                <div className="space-y-6">
                  {debateArguments.map((arg) => (
                    <div key={arg.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                      <h3 className="font-bold text-lg mb-2">Argumento {arg.id}</h3>
                      <p className="mb-4">{arg.argument}</p>
                      
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                        <h4 className="font-semibold mb-1">Possível Contra-argumento:</h4>
                        <p>{arg.counterArgument}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="preparation">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Como se preparar para o debate:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Pesquise fontes confiáveis para fortalecer seus argumentos</li>
                    <li>Pratique a apresentação dos argumentos em voz alta</li>
                    <li>Prepare-se para responder aos contra-argumentos listados</li>
                    <li>Mantenha um tom respeitoso e acadêmico durante todo o debate</li>
                    <li>Tenha dados e estatísticas relevantes à mão</li>
                    <li>Escute atentamente os argumentos do oponente antes de responder</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        )}
      </main>
    </div>
  );
};

export default SimuladorDebate;