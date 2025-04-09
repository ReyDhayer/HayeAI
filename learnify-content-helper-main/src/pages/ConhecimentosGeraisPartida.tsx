import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFadeIn } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { useGameData } from '@/lib/gameData';

const ConhecimentosGeraisPartida: React.FC = () => {
  const navigate = useNavigate();
  const fadeIn = useFadeIn(100);
  const gameData = useGameData();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">Partida em Andamento</h1>
          <Button
            onClick={() => navigate('/jogos/conhecimentos-gerais')}
            variant="ghost"
            className="mx-2"
          >
            Voltar ao Lobby
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ConhecimentosGeraisPartida;