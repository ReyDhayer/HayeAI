import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '@/components/FileUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';

const Idiomas = () => {
  const fadeIn = useFadeIn(100);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    { value: 'en', label: 'Inglês' },
    { value: 'es', label: 'Espanhol' },
    { value: 'fr', label: 'Francês' },
    { value: 'de', label: 'Alemão' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
  ];

  const handleTranslate = async () => {
    setIsLoading(true);
    try {
      // Implementar lógica de tradução aqui
      setOutputText('Texto traduzido será exibido aqui');
    } catch (error) {
      console.error('Erro na tradução:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrammarCheck = async () => {
    setIsLoading(true);
    try {
      // Implementar lógica de verificação gramatical aqui
      setOutputText('Análise gramatical será exibida aqui');
    } catch (error) {
      console.error('Erro na verificação gramatical:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto p-6 ${fadeIn}`}>
        <h1 className="text-3xl font-bold mb-6">Idiomas e Gramática</h1>
        
        <Tabs defaultValue="translate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="translate">Tradutor</TabsTrigger>
            <TabsTrigger value="grammar">Verificação Gramatical</TabsTrigger>
          </TabsList>

        <TabsContent value="translate">
          <Card>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Digite o texto para traduzir..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>

              <Button
                onClick={handleTranslate}
                disabled={isLoading || !inputText}
                className="w-full"
              >
                {isLoading ? 'Traduzindo...' : 'Traduzir'}
              </Button>

              {outputText && (
                <Textarea
                  value={outputText}
                  readOnly
                  className="min-h-[200px] mt-4"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grammar">
          <Card>
            <CardContent className="space-y-4 pt-4">
              <Textarea
                placeholder="Digite o texto para verificação gramatical..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px]"
              />

              <Button
                onClick={handleGrammarCheck}
                disabled={isLoading || !inputText}
                className="w-full"
              >
                {isLoading ? 'Verificando...' : 'Verificar Gramática'}
              </Button>

              {outputText && (
                <Textarea
                  value={outputText}
                  readOnly
                  className="min-h-[200px] mt-4"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </main>
    </div>
  );
};

export default Idiomas;