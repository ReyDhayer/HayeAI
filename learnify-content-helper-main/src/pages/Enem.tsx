import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFadeIn } from '@/lib/animations';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Filter, Search, BookOpen, Clock, Target, School } from 'lucide-react';

interface Question {
  id: string;
  statement: string;
  alternatives: string[];
  correct_alternative: number;
  discipline: string;
  subject: string;
  year: number;
  isFavorite?: boolean;
  userAnswer?: number;
  isCorrect?: boolean;
  timeSpent?: number;
}

interface Statistics {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageTime: number;
  currentStreak: number;
  bestStreak: number;
  totalScore: number;
  favoriteQuestions: number;
}

const Enem = () => {
  const navigate = useNavigate();
  const fadeIn = useFadeIn(100);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [statistics, setStatistics] = useState<Statistics>({
    totalQuestions: 0,
    answeredQuestions: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    averageTime: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalScore: 0,
    favoriteQuestions: 0
  });
  const [filters, setFilters] = useState({
    year: '',
    area: '',
    discipline: '',
    question_type: 'objetiva',
    language: 'pt-br',
    page: 1,
    limit: 10,
    search: '',
    showFavorites: false
  });
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  const areas = ['Linguagens', 'Matemática', 'Ciências da Natureza', 'Ciências Humanas'];
  const disciplines = ['Português', 'Matemática', 'Física', 'Química', 'Biologia', 'História', 'Geografia'];
  const years = Array.from({ length: 2024 - 1998 }, (_, i) => (2024 - i).toString());

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  // Função para filtrar questões
  const filterQuestions = (questions: Question[]) => {
    return questions.filter(question => {
      // Filtro por texto de busca (pesquisa no enunciado e alternativas)
      const matchesSearch = filters.search
        ? question.statement.toLowerCase().includes(filters.search.toLowerCase()) ||
          question.alternatives.some(alt => alt.toLowerCase().includes(filters.search.toLowerCase()))
        : true;

      // Filtro por favoritos
      const matchesFavorites = filters.showFavorites ? question.isFavorite : true;

      // Filtro por ano
      const matchesYear = filters.year ? question.year.toString() === filters.year : true;

      // Filtro por área de conhecimento
      const matchesArea = filters.area
        ? question.discipline === filters.area ||
          (filters.area === 'Linguagens' && ['Português', 'Literatura', 'Inglês', 'Espanhol'].includes(question.discipline)) ||
          (filters.area === 'Matemática' && question.discipline === 'Matemática') ||
          (filters.area === 'Ciências da Natureza' && ['Física', 'Química', 'Biologia'].includes(question.discipline)) ||
          (filters.area === 'Ciências Humanas' && ['História', 'Geografia', 'Filosofia', 'Sociologia'].includes(question.discipline))
        : true;

      // Filtro por disciplina específica
      const matchesDiscipline = filters.discipline ? question.discipline === filters.discipline : true;

      return matchesSearch && matchesFavorites && matchesYear && matchesArea && matchesDiscipline;
    });
  };

  // Efeito para atualizar as questões filtradas quando os filtros ou todas as questões mudam
  useEffect(() => {
    const filtered = filterQuestions(allQuestions);
    setFilteredQuestions(filtered);
    setQuestions(filtered);
  }, [filters, allQuestions]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('page', filters.page.toString());
      queryParams.append('limit', filters.limit.toString());
      queryParams.append('question_type', filters.question_type);
      queryParams.append('language', filters.language);
      
      if (filters.year) queryParams.append('year', filters.year);
      if (filters.area) queryParams.append('area', filters.area);
      if (filters.discipline) queryParams.append('discipline', filters.discipline);

      const mockQuestions = [
        {
          id: '1',
          statement: 'Qual é a capital do Brasil?',
          alternatives: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Recife'],
          correct_alternative: 2,
          discipline: 'Geografia',
          subject: 'Capitais',
          year: 2023
        },
        {
          id: '2',
          statement: 'Quem escreveu "Dom Casmurro"?',
          alternatives: ['José de Alencar', 'Machado de Assis', 'Carlos Drummond de Andrade', 'Clarice Lispector', 'Jorge Amado'],
          correct_alternative: 1,
          discipline: 'Literatura',
          subject: 'Literatura Brasileira',
          year: 2023
        },
        {
          id: '3',
          statement: 'Qual é o maior bioma brasileiro em extensão territorial?',
          alternatives: ['Mata Atlântica', 'Cerrado', 'Amazônia', 'Caatinga', 'Pampa'],
          correct_alternative: 2,
          discipline: 'Geografia',
          subject: 'Biomas Brasileiros',
          year: 2023
        },
        {
          id: '4',
          statement: 'Qual é o processo de transformação da água do estado líquido para o gasoso?',
          alternatives: ['Solidificação', 'Condensação', 'Vaporização', 'Fusão', 'Sublimação'],
          correct_alternative: 2,
          discipline: 'Física',
          subject: 'Mudanças de Estado Físico',
          year: 2023
        },
        {
          id: '5',
          statement: 'Qual é o resultado da expressão 2³ + 4² - 7?',
          alternatives: ['8', '9', '10', '11', '12'],
          correct_alternative: 2,
          discipline: 'Matemática',
          subject: 'Expressões Numéricas',
          year: 2023
        },
        {
          id: '6',
          statement: 'Em que ano foi proclamada a República no Brasil?',
          alternatives: ['1888', '1889', '1890', '1891', '1892'],
          correct_alternative: 1,
          discipline: 'História',
          subject: 'História do Brasil',
          year: 1999
        },
        {
          id: '7',
          statement: 'Qual é o principal gás responsável pelo efeito estufa?',
          alternatives: ['Oxigênio', 'Nitrogênio', 'Dióxido de Carbono', 'Hélio', 'Hidrogênio'],
          correct_alternative: 2,
          discipline: 'Química',
          subject: 'Química Ambiental',
          year: 2010
        },
        {
          id: '8',
          statement: 'Qual é a função da mitocôndria na célula?',
          alternatives: ['Digestão celular', 'Produção de energia', 'Armazenamento de água', 'Síntese de proteínas', 'Fotossíntese'],
          correct_alternative: 1,
          discipline: 'Biologia',
          subject: 'Citologia',
          year: 2015
        },
        {
          id: '9',
          statement: 'Quem foi o primeiro presidente do Brasil?',
          alternatives: ['Dom Pedro I', 'Marechal Deodoro da Fonseca', 'Getúlio Vargas', 'Juscelino Kubitschek', 'João Goulart'],
          correct_alternative: 1,
          discipline: 'História',
          subject: 'História do Brasil',
          year: 2005
        },
        {
          id: '10',
          statement: 'Qual é a fórmula química da água?',
          alternatives: ['CO2', 'H2O', 'O2', 'N2', 'CH4'],
          correct_alternative: 1,
          discipline: 'Química',
          subject: 'Química Básica',
          year: 2020
        },
        {
          id: '11',
          statement: 'Qual é o maior planeta do Sistema Solar?',
          alternatives: ['Marte', 'Vênus', 'Júpiter', 'Saturno', 'Urano'],
          correct_alternative: 2,
          discipline: 'Física',
          subject: 'Astronomia',
          year: 2018
        },
        {
          id: '12',
          statement: 'Qual é o autor de "Os Lusíadas"?',
          alternatives: ['Fernando Pessoa', 'Luís de Camões', 'Gil Vicente', 'Eça de Queirós', 'José Saramago'],
          correct_alternative: 1,
          discipline: 'Literatura',
          subject: 'Literatura Portuguesa',
          year: 2012
        },
        {
          id: '13',
          statement: 'Qual é a capital da França?',
          alternatives: ['Londres', 'Madrid', 'Paris', 'Roma', 'Berlim'],
          correct_alternative: 2,
          discipline: 'Geografia',
          subject: 'Geografia Mundial',
          year: 2008
        },
        {
          id: '14',
          statement: 'Qual é o valor de π (pi) arredondado para duas casas decimais?',
          alternatives: ['3.10', '3.14', '3.16', '3.18', '3.20'],
          correct_alternative: 1,
          discipline: 'Matemática',
          subject: 'Números Irracionais',
          year: 2024
        },
        {
          id: '15',
          statement: 'Quem pintou a Mona Lisa?',
          alternatives: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Michelangelo', 'Rafael'],
          correct_alternative: 1,
          discipline: 'História',
          subject: 'História da Arte',
          year: 2022
        }
      ];

      setAllQuestions(mockQuestions);
      const filtered = filterQuestions(mockQuestions);
      setFilteredQuestions(filtered);
      setQuestions(filtered);
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
      setQuestions([]);
      setFilteredQuestions([]);
      setAllQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page when filter changes
    }));
  };

  const handleAnswer = (questionIndex: number, selectedAnswer: number) => {
    const startTime = Date.now();
    const question = questions[questionIndex];
    const isCorrect = selectedAnswer === question.correct_alternative;
    
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = {
      ...question,
      userAnswer: selectedAnswer,
      isCorrect,
      timeSpent: Date.now() - startTime
    };

    setQuestions(updatedQuestions);
    setStatistics(prev => ({
      ...prev,
      answeredQuestions: prev.answeredQuestions + 1,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      incorrectAnswers: prev.incorrectAnswers + (isCorrect ? 0 : 1),
      currentStreak: isCorrect ? prev.currentStreak + 1 : 0,
      bestStreak: isCorrect ? Math.max(prev.currentStreak + 1, prev.bestStreak) : prev.bestStreak,
      totalScore: prev.totalScore + (isCorrect ? 10 : 0),
      averageTime: (prev.averageTime * prev.answeredQuestions + (Date.now() - startTime)) / (prev.answeredQuestions + 1)
    }));
  };

  const toggleFavorite = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    question.isFavorite = !question.isFavorite;
    
    setQuestions(updatedQuestions);
    setStatistics(prev => ({
      ...prev,
      favoriteQuestions: prev.favoriteQuestions + (question.isFavorite ? 1 : -1)
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Banco de Questões ENEM
            </h1>
            <div className="flex items-center space-x-4">
              <div className="stats bg-card rounded-lg p-4 shadow-md">
                <div className="grid grid-cols-3 gap-4">
                  <div className="stat">
                    <div className="stat-title text-sm">Pontuação</div>
                    <div className="stat-value text-2xl text-primary">{statistics.totalScore}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title text-sm">Sequência</div>
                    <div className="stat-value text-2xl text-success">{statistics.currentStreak}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title text-sm">Acertos</div>
                    <div className="stat-value text-2xl text-info">{statistics.correctAnswers}/{statistics.answeredQuestions}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-xl p-6 shadow-lg mb-8"
          >
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Pesquisar questões..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleFilterChange('showFavorites', !filters.showFavorites)}
                  className={`${filters.showFavorites ? 'bg-yellow-100 border-yellow-500' : ''}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${filters.showFavorites ? 'text-yellow-500' : 'text-gray-400'}`}
                    fill={filters.showFavorites ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <span className="ml-2">{filters.showFavorites ? 'Todas as Questões' : 'Favoritas'}</span>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ano</label>
                <Select
                  value={filters.year}
                  onValueChange={(value) => handleFilterChange('year', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os anos</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Área</label>
                <Select
                  value={filters.area}
                  onValueChange={(value) => handleFilterChange('area', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as áreas</SelectItem>
                    {areas.map(area => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Disciplina</label>
                <Select
                  value={filters.discipline}
                  onValueChange={(value) => handleFilterChange('discipline', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as disciplinas</SelectItem>
                    {disciplines.map(discipline => (
                      <SelectItem key={discipline} value={discipline}>{discipline}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Questions List */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center items-center py-12"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </motion.div>
            ) : (
              <motion.div
                key="questions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {questions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={index !== currentQuestionIndex ? 'hidden' : ''}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-300 relative">
                      <div className="flex items-start justify-between mb-4">
                        <Button
                          variant="ghost"
                          className={`absolute top-4 right-4 ${questions[index].isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
                          onClick={() => toggleFavorite(index)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill={questions[index].isFavorite ? "currentColor" : "none"}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </Button>
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{question.discipline}</h3>
                            <p className="text-sm text-muted-foreground">{question.subject}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{question.year}</span>
                        </div>
                      </div>

                      <p className="text-base mb-6">{question.statement}</p>

                      <div className="space-y-3">
                        {question.alternatives.map((alternative, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleAnswer(index, idx)}
                            className={`p-4 rounded-lg border transition-colors duration-200 cursor-pointer ${
                              question.userAnswer === idx
                                ? question.isCorrect
                                  ? 'bg-green-100 border-green-500'
                                  : 'bg-red-100 border-red-500'
                                : 'hover:bg-muted border-border'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                question.userAnswer === idx
                                  ? question.isCorrect
                                    ? 'bg-green-500 text-white'
                                    : 'bg-red-500 text-white'
                                  : 'bg-gray-200'
                              }`}>
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <p className="text-sm flex-1">{alternative}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                ))}

                {/* Navigation Buttons */}
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="w-32"
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={goToNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="w-32"
                  >
                    Próximo
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};

export default Enem;