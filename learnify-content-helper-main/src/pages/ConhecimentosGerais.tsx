import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFadeIn } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Header from '@/components/Header';
import { useUserConfig } from '@/lib/userConfig';
import { useGameData } from '@/lib/gameData';
import { v4 as uuidv4 } from 'uuid';

import type { PlayerStats } from '@/lib/gameData';

const ConhecimentosGerais: React.FC = () => {
  // Hooks personalizados
  const userConfig = useUserConfig();
  const gameData = useGameData();

  // Hooks do React Router e animação
  const navigate = useNavigate();
  const fadeIn = useFadeIn(100);

  // Hooks de estado
  const [nickname, setNickname] = useState('');
  const [displayNameType, setDisplayNameType] = useState<'name' | 'nickname'>('name');

  useEffect(() => {
    if (displayNameType === 'name' && userConfig.name) {
      setNickname(userConfig.name);
    } else {
      setNickname('');
    }
  }, [displayNameType, userConfig.name]);

  const createPlayerStats = (displayName: string): PlayerStats => ({
    id: uuidv4(),
    name: userConfig.name,
    displayName,
    avatar: userConfig.avatar,
    totalPoints: 0,
    gamesPlayed: 0,
    victories: 0,
    winStreak: 0,
    bestWinStreak: 0,
    lastGameDate: new Date().toISOString()
  });

  const handleStartGame = () => {
    const trimmedNickname = nickname.trim();
    if (trimmedNickname) {
      userConfig.setDisplayName(trimmedNickname);
      userConfig.setDisplayNameType(displayNameType);
      
      const playerStats = createPlayerStats(trimmedNickname);
      gameData.updatePlayerStats(playerStats);
      navigate('/jogos/conhecimentos-gerais/partida');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">Conhecimentos Gerais</h1>
          
          <div className="bg-card rounded-lg p-8 shadow-lg mb-8">
            <div className="mb-6">
              <Label className="block text-sm font-medium mb-4">Como você quer aparecer no ranking?</Label>
              <RadioGroup
                value={displayNameType}
                onValueChange={(value: 'name' | 'nickname') => setDisplayNameType(value)}
                className="mb-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="name" id="name" />
                  <Label htmlFor="name">Usar nome das configurações{userConfig.name ? `: ${userConfig.name}` : ''}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nickname" id="nickname" />
                  <Label htmlFor="nickname">Usar apelido personalizado</Label>
                </div>
              </RadioGroup>

              {displayNameType === 'nickname' && (
                <div className="mt-4">
                  <Label htmlFor="nickname-input" className="block text-sm font-medium mb-2">
                    Digite seu apelido
                  </Label>
                  <Input
                    id="nickname-input"
                    type="text"
                    placeholder="Digite seu apelido"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="max-w-xs mx-auto"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleStartGame}
                className="w-full max-w-xs bg-primary hover:bg-primary/90 text-white"
                disabled={!nickname.trim()}
              >
                Jogar
              </Button>

              <Button
                onClick={() => navigate('/jogos/conhecimentos-gerais/para-estudar')}
                variant="outline"
                className="w-full max-w-xs"
              >
                Para Estudar
              </Button>

              <Button
                onClick={() => navigate('/jogos')}
                variant="ghost"
                className="w-full max-w-xs"
              >
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConhecimentosGerais;