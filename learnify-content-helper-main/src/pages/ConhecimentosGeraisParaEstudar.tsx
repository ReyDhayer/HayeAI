import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFadeIn } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

interface StudyQuestion {
  id: number;
  text: string;
  answer: string;
}

const ConhecimentosGeraisParaEstudar = () => {
  const navigate = useNavigate();
  const fadeIn = useFadeIn(100);
  const [studyQuestions, setStudyQuestions] = useState<StudyQuestion[]>([]);
  const [showAnswers, setShowAnswers] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const savedQuestions = JSON.parse(localStorage.getItem('studyQuestions') || '[]');
    setStudyQuestions(savedQuestions);
  }, []);

  const handleRemoveQuestion = (questionId: number) => {
    const updatedQuestions = studyQuestions.filter(q => q.id !== questionId);
    setStudyQuestions(updatedQuestions);
    localStorage.setItem('studyQuestions', JSON.stringify(updatedQuestions));
  };

  const toggleAnswer = (questionId: number) => {
    setShowAnswers(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Perguntas Para Estudar</h1>

          {studyQuestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground mb-4">
                Você ainda não salvou nenhuma pergunta para estudar.
              </p>
              <Button
                onClick={() => navigate('/jogos/conhecimentos-gerais')}
                variant="outline"
              >
                Voltar ao Jogo
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {studyQuestions.map((question) => (
                <div key={question.id} className="bg-card rounded-lg p-6 shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{question.text}</h3>
                    <Button
                      onClick={() => handleRemoveQuestion(question.id)}
                      variant="ghost"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      Remover
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => toggleAnswer(question.id)}
                      variant="outline"
                      className="w-full text-left justify-start"
                    >
                      {showAnswers[question.id] ? 'Ocultar Resposta' : 'Mostrar Resposta'}
                    </Button>

                    {showAnswers[question.id] && (
                      <div className="p-4 bg-muted rounded-md">
                        <p className="font-medium">Resposta: {question.answer}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => navigate('/jogos/conhecimentos-gerais')}
                  variant="ghost"
                  className="mx-2"
                >
                  Voltar ao Lobby
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ConhecimentosGeraisParaEstudar;