import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '@/components/FileUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';

const AprimoradorCodigo = () => {
  const fadeIn = useFadeIn(100);
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);

  const programmingLanguages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'swift', label: 'Swift' },
    { value: 'typescript', label: 'TypeScript' },
  ];

  const handleCodeOptimization = async () => {
    setIsLoading(true);
    try {
      // Implementar lógica de otimização de código aqui
      setOutputCode('Código otimizado será exibido aqui');
    } catch (error) {
      console.error('Erro na otimização:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto p-6 ${fadeIn}`}>
        <h1 className="text-3xl font-bold mb-6">Aprimorador de Código</h1>
        
        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione a linguagem" />
              </SelectTrigger>
              <SelectContent>
                {programmingLanguages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Código Original</label>
              <Textarea
                placeholder="Cole seu código aqui..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="min-h-[400px] font-mono"
              />
              <FileUpload
                onFileChange={(files) => {
                  if (files && files[0]) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      if (e.target?.result) {
                        setInputCode(e.target.result as string);
                      }
                    };
                    reader.readAsText(files[0]);
                  }
                }}
                label="Ou envie um arquivo"
                accept=".js,.jsx,.ts,.tsx,.html,.css,.json,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.sql"
                multiple={false}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Código Otimizado</label>
              <Textarea
                value={outputCode}
                readOnly
                className="min-h-[400px] font-mono"
                placeholder="O código otimizado aparecerá aqui..."
              />
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={handleCodeOptimization}
              disabled={isLoading || !inputCode}
              className="w-full md:w-auto"
            >
              {isLoading ? 'Otimizando...' : 'Otimizar Código'}
            </Button>
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Sugestões de Melhorias</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Análise de complexidade e performance</li>
              <li>Sugestões de boas práticas</li>
              <li>Detecção de possíveis bugs</li>
              <li>Formatação e estilo de código</li>
            </ul>
          </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AprimoradorCodigo;