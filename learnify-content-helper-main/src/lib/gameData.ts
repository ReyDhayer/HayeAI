import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Question {
  id: string;
  text: string;
  answer: string;
  category: string;
  difficulty: number;
}

export interface PlayerStats {
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

interface GameState {
  questions: Question[];
  players: PlayerStats[];
  usedQuestions: string[];
  addQuestion: (question: Question) => void;
  removeQuestion: (id: string) => void;
  markQuestionAsUsed: (id: string) => void;
  updatePlayerStats: (stats: Partial<PlayerStats>) => void;
  getRandomQuestion: () => Question | null;
  resetUsedQuestions: () => void;
}

export const useGameData = create<GameState>()(
  persist(
    (set, get) => ({
      questions: [
        {
          id: '1',
          text: 'Qual é a capital do Brasil?',
          answer: 'Brasília',
          category: 'Geografia',
          difficulty: 1
        },
        {
          id: '2',
          text: 'Quem pintou a Mona Lisa?',
          answer: 'Leonardo da Vinci',
          category: 'Arte',
          difficulty: 1
        },
        {
          id: '3',
          text: 'Qual é o maior planeta do Sistema Solar?',
          answer: 'Júpiter',
          category: 'Astronomia',
          difficulty: 1
        },
        {
          id: '4',
          text: 'Qual é o elemento químico mais abundante no universo?',
          answer: 'Hidrogênio',
          category: 'Ciência',
          difficulty: 2
        },
        {
          id: '5',
          text: 'Quem escreveu Dom Casmurro?',
          answer: 'Machado de Assis',
          category: 'Literatura',
          difficulty: 2
        },
        {
          id: '6',
          text: 'Em que ano começou a Primeira Guerra Mundial?',
          answer: '1914',
          category: 'História',
          difficulty: 2
        },
        {
          id: '7',
          text: 'Qual é a fórmula química da água?',
          answer: 'H2O',
          category: 'Ciência',
          difficulty: 1
        },
        {
          id: '8',
          text: 'Quem foi o primeiro presidente do Brasil?',
          answer: 'Deodoro da Fonseca',
          category: 'História',
          difficulty: 2
        },
        {
          id: '9',
          text: 'Qual é o maior oceano do mundo?',
          answer: 'Pacífico',
          category: 'Geografia',
          difficulty: 1
        },
        {
          id: '10',
          text: 'Quem é considerado o pai da física moderna?',
          answer: 'Isaac Newton',
          category: 'Ciência',
          difficulty: 2
        }
      ],
      players: [],
      usedQuestions: [],
      
      addQuestion: (question) =>
        set((state) => ({
          questions: [...state.questions, question]
        })),
      
      removeQuestion: (id) =>
        set((state) => ({
          questions: state.questions.filter((q) => q.id !== id)
        })),
      
      markQuestionAsUsed: (id) =>
        set((state) => ({
          usedQuestions: [...state.usedQuestions, id]
        })),
      
      updatePlayerStats: (stats) =>
        set((state) => {
          const existingPlayerIndex = state.players.findIndex(
            (p) => p.id === stats.id
          );
          
          if (existingPlayerIndex >= 0) {
            const updatedPlayers = [...state.players];
            updatedPlayers[existingPlayerIndex] = {
              ...updatedPlayers[existingPlayerIndex],
              ...stats
            };
            return { players: updatedPlayers };
          }
          
          return { players: [...state.players, stats as PlayerStats] };
        }),
      
      getRandomQuestion: () => {
        const state = get();
        const availableQuestions = state.questions.filter(
          (q) => !state.usedQuestions.includes(q.id)
        );
        
        if (availableQuestions.length === 0) {
          return null;
        }
        
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        return availableQuestions[randomIndex];
      },
      
      resetUsedQuestions: () =>
        set({ usedQuestions: [] })
    }),
    {
      name: 'game-data'
    }
  )
);