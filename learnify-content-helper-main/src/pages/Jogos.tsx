import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFadeIn } from '@/lib/animations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const Jogos = () => {
  const navigate = useNavigate();
  const fadeIn = useFadeIn(100);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <h1 className="text-4xl font-bold text-center mb-8">Jogos Educacionais</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6 flex-1">
              <h2 className="text-2xl font-semibold mb-4">Conhecimentos Gerais</h2>
              <p className="text-muted-foreground mb-6">
                Teste seus conhecimentos em diversas áreas e compita com outros jogadores em tempo real!
              </p>
              <div className="flex justify-center">
                <Button 
                  onClick={() => navigate('/jogos/conhecimentos-gerais')}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full"
                >
                  Jogar Agora
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Jogos;