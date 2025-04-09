import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFadeIn } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

import { useGameData } from '@/lib/gameData';

interface PlayerScore {
  id: string;
  name: string;
  displayName: string;
  avatar: string;
  totalPoints: number;
  gamesPlayed: number;
  victories: number;
  winStreak: number;
  bestWinStreak: number;
  lastGameDate: string;
}

const ConhecimentosGeraisRanking = () => {
  const navigate = useNavigate();
  const fadeIn = useFadeIn(100);
  const [showHistory, setShowHistory] = useState(false);
  const gameData = useGameData();
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);

  useEffect(() => {
    const sortedPlayers = [...gameData.players].sort((a, b) => b.totalPoints - a.totalPoints);
    setPlayerScores(sortedPlayers);
  }, [gameData.players]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Ranking - Conhecimentos Gerais</h1>

          <div className="bg-card rounded-lg p-6 shadow-lg mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left">Posição</th>
                    <th className="py-3 px-4 text-left">Jogador</th>
                    <th className="py-3 px-4 text-right">Pontuação</th>
                    <th className="py-3 px-4 text-right">Partidas</th>
                    <th className="py-3 px-4 text-right">Vitórias</th>
                    <th className="py-3 px-4 text-right">Sequência</th>
                    <th className="py-3 px-4 text-right">Melhor Sequência</th>
                    <th className="py-3 px-4 text-right">Última Partida</th>
                  </tr>
                </thead>
                <tbody>
                  {playerScores.map((player, index) => (
                    <tr key={player.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4">{index + 1}º</td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        {player.avatar && (
                          <img
                            src={player.avatar}
                            alt={player.displayName}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span>{player.displayName}</span>
                      </td>
                      <td className="py-3 px-4 text-right">{player.totalPoints}</td>
                      <td className="py-3 px-4 text-right">{player.gamesPlayed}</td>
                      <td className="py-3 px-4 text-right">{player.victories}</td>
                      <td className="py-3 px-4 text-right">{player.winStreak}</td>
                      <td className="py-3 px-4 text-right">{player.bestWinStreak}</td>
                      <td className="py-3 px-4 text-right">{new Date(player.lastGameDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="outline"
              className="w-full max-w-xs"
            >
              {showHistory ? 'Ocultar Histórico' : 'Ver Histórico da Minha Pontuação'}
            </Button>

            <Button
              onClick={() => navigate('/jogos/conhecimentos-gerais')}
              variant="ghost"
              className="w-full max-w-xs"
            >
              Voltar ao Lobby
            </Button>
          </div>

          {showHistory && (
            <div className="mt-8 bg-card rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Meu Histórico de Pontuação</h2>
              <div className="space-y-4">
                {/* Em produção, isso viria de uma API */}
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span>Hoje, 15:30</span>
                  <span className="text-success">8 pontos</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span>Hoje, 14:15</span>
                  <span className="text-success">7 pontos</span>
                </div>
                {/* Adicionar mais histórico aqui */}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ConhecimentosGeraisRanking;