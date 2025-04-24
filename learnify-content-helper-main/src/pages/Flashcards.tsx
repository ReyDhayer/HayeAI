import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Card, Form, Badge, Modal, ProgressBar, Tab, Tabs } from 'react-bootstrap';
import { Search, Plus, Volume, Award, RotateCw, Save, Upload, Download, Trash2, Pencil, Calendar, Brain, Library, Zap, Star, FileText, BarChart, Settings, Mic, Check, X, Sparkles, Book, Trophy, Play } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ConfettiEffect from '@/components/ConfettiEffect';
import ParticleEffect from '@/components/ParticleEffect';
import '../styles/flashcards.css';

// Efeitos sonoros para feedback
const successSound = new Audio('/success.mp3');
const errorSound = new Audio('/error.mp3');
const flipSound = new Audio('/flip.mp3');

// Função para tocar som com fallback silencioso
const playSound = (sound: HTMLAudioElement) => {
  try {
    if (sound.readyState === 0) {
      sound.load();
    }
    sound.volume = 0.3;
    sound.play().catch(e => {
      console.error('Erro ao tocar som:', e);
      toast.error('Não foi possível reproduzir o som');
    });
  } catch (error) {
    console.error('Erro ao tocar som:', error);
    toast.error('Não foi possível reproduzir o som');
  }
};

// Tipos de dados
interface Flashcard {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: string;
  dificuldade: 'fácil' | 'médio' | 'difícil';
  ultimaRevisao: Date;
  proximaRevisao: Date;
  acertos: number;
  erros: number;
  intervaloDias: number; // Para o sistema de repetição espaçada
  tags: string[]; // Tags para melhor categorização
  favorito: boolean; // Marcar como favorito
  notas: string; // Notas adicionais sobre o flashcard
  imagem?: string; // URL ou base64 da imagem associada
  audio?: string; // URL ou base64 do áudio associado
  tempoEstudo: number; // Tempo total gasto estudando este card (em segundos)
  ultimaPontuacao: number; // Última pontuação obtida no modo desafio
  fatorFacilidade?: number; // Fator de facilidade para o algoritmo SM-2
  estilo?: {
    corFundo?: string;
    corTexto?: string;
    fonte?: string;
    tamanhoFonte?: number;
  }; // Personalização visual
}

interface Categoria {
  id: string;
  nome: string;
  cor: string;
}

interface Conquista {
  id: string;
  nome: string;
  descricao: string;
  icone: string; // Nome do ícone do Lucide ou URL da imagem
  pontos: number; // Pontos concedidos ao desbloquear
  requisito: {
    tipo: 'acertos' | 'sequencia' | 'cards_criados' | 'tempo_estudo' | 'dias_consecutivos' | 'categorias' | 'dificuldade';
    valor: number; // Valor necessário para desbloquear
    dificuldade?: 'fácil' | 'médio' | 'difícil'; // Para conquistas específicas de dificuldade
    categoria?: string; // Para conquistas específicas de categoria
  };
  desbloqueada: boolean;
  dataDesbloqueio?: Date;
}

interface Estatisticas {
  totalCards: number;
  cardsRevisados: number;
  acertos: number;
  erros: number;
  tempoMedioResposta: number;
  sequenciaAtual: number; // Sequência atual de acertos consecutivos
  maiorSequencia: number; // Maior sequência de acertos já alcançada
  pontuacaoTotal: number; // Pontuação total acumulada no modo desafio
  nivelUsuario: number; // Nível do usuário baseado na pontuação
  diasConsecutivos: number; // Dias consecutivos de estudo
  ultimoDiaEstudo: Date; // Último dia em que o usuário estudou
  tempoTotalEstudo: number; // Tempo total de estudo em segundos
  conquistasDesbloqueadas: string[]; // IDs das conquistas desbloqueadas
  cardsFavoritos: number; // Quantidade de cards marcados como favoritos
  distribuicaoEstudoPorDia: Record<string, number>; // Registro de cards estudados por dia
}

import { useNavigate } from 'react-router-dom';
import { Chart } from 'react-chartjs-2';
import { ArrowLeft } from 'lucide-react';

const Flashcards: React.FC = () => {
  const navigate = useNavigate();

  // Estados principais
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [modoAtual, setModoAtual] = useState<'desafio' | 'revisao' | 'favoritos'>('revisao');
  const [pontuacaoDesafio, setPontuacaoDesafio] = useState<number>(0);
  const [sequenciaAcertos, setSequenciaAcertos] = useState<number>(0);
  const [cardsFavoritos, setCardsFavoritos] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('flashcardsFavoritos');
    return saved ? JSON.parse(saved) : [];
  });
  const [indiceAtual, setIndiceAtual] = useState<number>(0);
  const [estudoEmAndamento, setEstudoEmAndamento] = useState<boolean>(false);
  const [mostrarResposta, setMostrarResposta] = useState<boolean>(false);

  // Resetar mostrarResposta e remover classe flipped quando mudar de cartão
  useEffect(() => {
    setMostrarResposta(false);
    const flipper = document.querySelector('.flipper');
    if (flipper) {
      flipper.classList.remove('flipped');
    }
  }, [indiceAtual]);
  
  const handleVoltarClick = () => {
    navigate('/ferramentas');
  };

  const [categorias, setCategorias] = useState<Categoria[]>([
    { id: uuidv4(), nome: 'Geral', cor: '#007bff' },
    { id: uuidv4(), nome: 'Matemática', cor: '#28a745' },
    { id: uuidv4(), nome: 'História', cor: '#dc3545' },
    { id: uuidv4(), nome: 'Ciências', cor: '#6f42c1' },
    { id: uuidv4(), nome: 'Línguas', cor: '#fd7e14' },
  ]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    totalCards: 0,
    cardsRevisados: 0,
    acertos: 0,
    erros: 0,
    tempoMedioResposta: 0,
    sequenciaAtual: 0,
    maiorSequencia: 0,
    pontuacaoTotal: 0,
    nivelUsuario: 1,
    diasConsecutivos: 0,
    ultimoDiaEstudo: new Date(),
    tempoTotalEstudo: 0,
    conquistasDesbloqueadas: [],
    cardsFavoritos: 0,
    distribuicaoEstudoPorDia: {},
  });
  
  // Estado para conquistas
  const [conquistas, setConquistas] = useState<Conquista[]>([
    {
      id: uuidv4(),
      nome: 'Primeiro Passo',
      descricao: 'Complete sua primeira sessão de estudo',
      icone: 'Award',
      pontos: 10,
      requisito: { tipo: 'cards_criados', valor: 1 },
      desbloqueada: false
    },
    {
      id: uuidv4(),
      nome: 'Estudante Dedicado',
      descricao: 'Estude por 3 dias consecutivos',
      icone: 'Calendar',
      pontos: 30,
      requisito: { tipo: 'dias_consecutivos', valor: 3 },
      desbloqueada: false
    },
    {
      id: uuidv4(),
      nome: 'Mestre da Memória',
      descricao: 'Acerte 10 flashcards consecutivos',
      icone: 'Brain',
      pontos: 50,
      requisito: { tipo: 'sequencia', valor: 10 },
      desbloqueada: false
    },
    {
      id: uuidv4(),
      nome: 'Colecionador',
      descricao: 'Crie 20 flashcards',
      icone: 'Library',
      pontos: 40,
      requisito: { tipo: 'cards_criados', valor: 20 },
      desbloqueada: false
    },
    {
      id: uuidv4(),
      nome: 'Desafiador',
      descricao: 'Complete um estudo com 5 flashcards difíceis',
      icone: 'Zap',
      pontos: 60,
      requisito: { tipo: 'dificuldade', valor: 5, dificuldade: 'difícil' },
      desbloqueada: false
    },
  ]);

  // Estados de filtro e visualização
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroDificuldade, setFiltroDificuldade] = useState<string>('todas');
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [modoEstudo, setModoEstudo] = useState<'revisao' | 'desafio'>('revisao');

  // Estados de modais
  const [showModalNovoCard, setShowModalNovoCard] = useState(false);
  const [showModalCategoria, setShowModalCategoria] = useState(false);
  const [showModalImportar, setShowModalImportar] = useState(false);
  const [showModalGerarAI, setShowModalGerarAI] = useState(false);
  const [showModalEditarCard, setShowModalEditarCard] = useState(false);
  const [flashcardEmEdicao, setFlashcardEmEdicao] = useState<Flashcard | null>(null);
  const [personalizacaoAtiva, setPersonalizacaoAtiva] = useState(false);

  // Componente de Modo de Estudo
  const ModoEstudoPanel = () => {
    if (cardAtual) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="modo-estudo-container glass-morphism p-4"
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="gradient-text">Modo Estudo</h3>
            <div className="d-flex align-items-center">
              <Badge 
                bg="info" 
                className="me-2"
                style={{ backgroundColor: getCorCategoria(cardAtual.categoria) }}
              >
                {cardAtual.categoria}
              </Badge>
            </div>
          </div>

          <Card className="flashcard-container mb-4">
            <Card.Body>
              <div className="text-center">
                <h4>{cardAtual.pergunta}</h4>
                {mostrarResposta && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="resposta mt-4"
                  >
                    <h5>{cardAtual.resposta}</h5>
                  </motion.div>
                )}
              </div>
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-center gap-3">
            {!mostrarResposta ? (
              <Button
                variant="primary"
                onClick={() => {
                  setMostrarResposta(true);
                  playSound(flipSound);
                }}
              >
                Mostrar Resposta
              </Button>
            ) : (
              <>
                <Button
                  variant="success"
                  onClick={() => responderFlashcard(true)}
                >
                  <Check size={20} className="me-2" />
                  Acertei
                </Button>
                <Button
                  variant="danger"
                  onClick={() => responderFlashcard(false)}
                >
                  <X size={20} className="me-2" />
                  Errei
                </Button>
              </>
            )}
          </div>

          {modoEstudo === 'desafio' && (
            <div className="mt-4 text-center">
              <h5>Pontuação: {pontuacao}</h5>
              <h6>Sequência de Acertos: {sequenciaAcertos}</h6>
            </div>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="modo-estudo-container glass-morphism p-4 text-center"
      >
        <h3 className="gradient-text mb-4">Nenhum estudo em andamento</h3>
        <p className="mb-4">Selecione um modo de estudo para começar</p>
        
        <div className="d-flex justify-content-center gap-3">
          <Button
            variant="primary"
            onClick={iniciarRevisao}
            className="modo-estudo-btn"
          >
            <RotateCw size={20} className="me-2" />
            Iniciar Revisão
          </Button>
          <Button
            variant="warning"
            onClick={iniciarDesafio}
            className="modo-estudo-btn"
          >
            <Zap size={20} className="me-2" />
            Iniciar Desafio
          </Button>
        </div>
      </motion.div>
    );
  };

  // Componente de Estatísticas
  const EstatisticasPanel = () => {
    const chartData = {
      labels: ['Acertos', 'Erros'],
      datasets: [{
        data: [estatisticas.acertos, estatisticas.erros],
        backgroundColor: ['#4CAF50', '#f44336'],
        borderWidth: 0,
        borderRadius: 15,
        hoverOffset: 4
      }]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            font: { size: 14, family: '"Inter", sans-serif' },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#000',
          bodyColor: '#666',
          bodyFont: { size: 14 },
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeInOutCubic' as const
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="estatisticas-card glass-morphism mb-4 p-4"
      >
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="d-flex align-items-center mb-4"
        >
          <Button
            variant="light"
            className="btn-voltar me-3"
            onClick={handleVoltarClick}
          >
            <ArrowLeft size={20} />
          </Button>
          <h3 className="m-0 gradient-text">Estatísticas de Desempenho</h3>
        </motion.div>
        
        <Row className="mb-4 g-4">
          <Col md={4}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="stat-card text-center p-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="stat-icon mb-2">
                <Library size={24} />
              </div>
              <h4 className="stat-value">{estatisticas.totalCards}</h4>
              <p className="stat-label">Total de Cards</p>
            </motion.div>
          </Col>
          <Col md={4}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="stat-card text-center p-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="stat-icon mb-2">
                <Zap size={24} />
              </div>
              <h4 className="stat-value">{estatisticas.sequenciaAtual}</h4>
              <p className="stat-label">Sequência Atual</p>
            </motion.div>
          </Col>
          <Col md={4}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className="stat-card text-center p-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="stat-icon mb-2">
                <Star size={24} />
              </div>
              <h4 className="stat-value">{estatisticas.cardsFavoritos}</h4>
              <p className="stat-label">Cards Favoritos</p>
            </motion.div>
          </Col>
        </Row>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="chart-container mb-4"
          style={{ height: '300px' }}
        >
          <Chart 
            type="doughnut" 
            data={chartData} 
            options={chartOptions}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="nivel-container p-3"
        >
          <div className="d-flex align-items-center mb-2">
            <Award size={20} className="me-2" />
            <h5 className="m-0">Nível do Usuário</h5>
          </div>
          <ProgressBar
            now={((estatisticas.nivelUsuario - 1) % 100)}
            label={`Nível ${estatisticas.nivelUsuario}`}
            className="nivel-progress custom-progress"
            variant="info"
          />
        </motion.div>
      </motion.div>
    );
  };

  // Estado para novo flashcard
  const [novoFlashcard, setNovoFlashcard] = useState<Omit<Flashcard, 'id' | 'ultimaRevisao' | 'proximaRevisao' | 'acertos' | 'erros' | 'intervaloDias' | 'tempoEstudo' | 'ultimaPontuacao'>>({ 
    pergunta: '',
    resposta: '',
    categoria: 'Geral',
    dificuldade: 'médio',
    tags: [],
    favorito: false,
    notas: '',
    imagem: '',
    audio: '',

  });

  // Estado para geração com IA
  const [promptIA, setPromptIA] = useState('');
  const [gerando, setGerando] = useState(false);

  // Função para gerar flashcard com IA
  const gerarFlashcardIA = async () => {
    if (!promptIA.trim()) {
      toast.error('Digite um prompt para gerar o flashcard');
      return;
    }

    try {
      setGerando(true);
      // Simula a geração com IA (substitua por sua implementação real)
      const flashcardGerado = {
        pergunta: 'Pergunta gerada pela IA baseada no prompt: ' + promptIA,
        resposta: 'Resposta gerada pela IA',
        categoria: 'Geral',
        dificuldade: 'médio'
      };
      
      setNovoFlashcard(prev => ({
        ...prev,
        pergunta: flashcardGerado.pergunta,
        resposta: flashcardGerado.resposta,
        categoria: flashcardGerado.categoria,
        dificuldade: flashcardGerado.dificuldade as 'fácil' | 'médio' | 'difícil'
      }));
      
      toast.success('Flashcard gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar flashcard:', error);
      toast.error('Erro ao gerar flashcard com IA');
    } finally {
      setGerando(false);
      setShowModalGerarAI(false);
    }
  };
  
  // Estado para edição do flashcard
  const [novaCategoria, setNovaCategoria] = useState<Omit<Categoria, 'id'>>({ 
    nome: '',
    cor: '#' + Math.floor(Math.random()*16777215).toString(16), // Cor aleatória
  });

  // Função para editar flashcard
  const handleEditarFlashcard = (flashcard: Flashcard) => {
    try {
      if (!flashcard) return;
      
      // Configura o flashcard para edição
      setFlashcardEmEdicao({
        ...flashcard,
        estilo: {
          corFundo: flashcard.estilo?.corFundo || '#ffffff',
          corTexto: flashcard.estilo?.corTexto || '#000000', 
          fonte: flashcard.estilo?.fonte || 'Inter',
          tamanhoFonte: flashcard.estilo?.tamanhoFonte || 16
        }
      });
      setShowModalEditarCard(true);

      // Remove botões de personalização desnecessários
      const botoesPersonalizacao = document.querySelectorAll('.btn-personalizacao');
      botoesPersonalizacao.forEach(botao => {
        if (!botao.classList.contains('btn-editar')) {
          botao.remove();
        }
      });
    } catch (error) {
      console.error('Erro ao editar flashcard:', error);
      toast.error('Erro ao editar flashcard');
    }
  };

  // Função para salvar edição do flashcard
  const handleSalvarEdicaoFlashcard = (flashcardEditado: Flashcard) => {
    try {
      if (!flashcardEditado || !flashcardEmEdicao) return;

      setFlashcards(prev => prev.map(card => 
        card.id === flashcardEditado.id ? flashcardEditado : card
      ));

      setFlashcardEmEdicao(null);
      setShowModalEditarCard(false);
      toast.success('Flashcard atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar edição do flashcard:', error);
      toast.error('Erro ao salvar edição do flashcard');
    }
  };

  // Estado para estudo
  const [cardAtual, setCardAtual] = useState<Flashcard | null>(null);
  const [cardsEstudo, setCardsEstudo] = useState<Flashcard[]>([]);
  const [tempoInicio, setTempoInicio] = useState<number>(0);
  const [pontuacao, setPontuacao] = useState<number>(0);

  // Função para iniciar revisão
  const iniciarRevisao = () => {
    try {
      const cardsParaRevisar = filtrarFlashcards()
        .sort(() => Math.random() - 0.5); // Embaralha os cards

      if (cardsParaRevisar.length === 0) {
        toast.error('Nenhum flashcard disponível para revisão');
        return;
      }

      // Configura o modo de estudo
      setCardsEstudo(cardsParaRevisar);
      setCardAtual(cardsParaRevisar[0]);
      setMostrarResposta(false);
      setTempoInicio(Date.now());
      setModoEstudo('revisao');
      setPontuacao(0);
      setIndiceAtual(0);
      setEstudoEmAndamento(true);

      // Atualiza estatísticas básicas
      const hoje = new Date();
      setEstatisticas(prev => ({
        ...prev,
        ultimoDiaEstudo: hoje
      }));

      toast.success('Modo revisão iniciado!');
    } catch (error) {
      console.error('Erro ao iniciar revisão:', error);
      toast.error('Erro ao iniciar modo de revisão');
    }
  };

  // Função para iniciar desafio
  const iniciarDesafio = () => {
    try {
      const cardsParaDesafio = filtrarFlashcards()
        .sort(() => Math.random() - 0.5)
        .slice(0, 10); // Limita a 10 cards por desafio

      if (cardsParaDesafio.length === 0) {
        toast.error('Nenhum flashcard disponível para o desafio');
        return;
      }

      // Configura o modo de estudo
      setCardsEstudo(cardsParaDesafio);
      setCardAtual(cardsParaDesafio[0]);
      setMostrarResposta(false);
      setTempoInicio(Date.now());
      setModoEstudo('desafio');
      setPontuacao(0);
      setIndiceAtual(0);
      setEstudoEmAndamento(true);

      // Atualiza estatísticas básicas
      const hoje = new Date();
      setEstatisticas(prev => ({
        ...prev,
        ultimoDiaEstudo: hoje
      }));

      toast.success('Modo desafio iniciado!');
    } catch (error) {
      console.error('Erro ao iniciar desafio:', error);
      toast.error('Erro ao iniciar modo de desafio');
    }
  };

  // Função para responder flashcard
  const responderFlashcard = (acertou: boolean) => {
    if (!cardAtual || !estudoEmAndamento) return;

    try {
      // Toca o som de feedback
      playSound(acertou ? successSound : errorSound);
      // Reseta o estado de mostrar resposta
      setMostrarResposta(false);

      // Reinicia o estado de mostrar resposta
      setMostrarResposta(false);

      // Calcula o tempo de resposta
      const tempoResposta = (Date.now() - tempoInicio) / 1000;
      const respostaRapida = tempoResposta < 5;
      const respostaLenta = tempoResposta > 15;

      // Calcula pontuação base e bônus
      let pontuacaoBase = acertou ? 10 : 0;
      let bonusSequencia = Math.floor(sequenciaAcertos / 3) * 5;
      let bonusDificuldade = {
        'fácil': 0,
        'médio': 5,
        'difícil': 10
      }[cardAtual.dificuldade];
      let bonusTempo = respostaRapida ? 5 : (respostaLenta ? -2 : 0);

      // Atualiza estatísticas do card
      const novoCard = {
        ...cardAtual,
        acertos: cardAtual.acertos + (acertou ? 1 : 0),
        erros: cardAtual.erros + (acertou ? 0 : 1),
        ultimaRevisao: new Date(),
        proximaRevisao: new Date(Date.now() + cardAtual.intervaloDias * 24 * 60 * 60 * 1000),
        tempoEstudo: cardAtual.tempoEstudo + tempoResposta,
        ultimaPontuacao: pontuacaoBase + bonusSequencia + bonusDificuldade + bonusTempo
      };

      // Atualiza o card na lista
      setFlashcards(prev => prev.map(card =>
        card.id === cardAtual.id ? novoCard : card
      ));

      // Atualiza estatísticas gerais
      setEstatisticas(prev => ({
        ...prev,
        acertos: prev.acertos + (acertou ? 1 : 0),
        erros: prev.erros + (acertou ? 0 : 1),
        cardsRevisados: prev.cardsRevisados + 1,
        tempoTotalEstudo: prev.tempoTotalEstudo + tempoResposta,
        sequenciaAtual: acertou ? prev.sequenciaAtual + 1 : 0,
        maiorSequencia: Math.max(prev.maiorSequencia, acertou ? prev.sequenciaAtual + 1 : 0),
        tempoMedioResposta: (prev.tempoMedioResposta * prev.cardsRevisados + tempoResposta) / (prev.cardsRevisados + 1)
      }));

      // Feedback personalizado
      if (acertou) {
        if (respostaRapida) {
          toast.success('Resposta rápida e correta! +5 pontos de bônus! 🚀');
        } else if (!respostaLenta) {
          toast.success('Correto! Continue assim! ✨');
        } else {
          toast.success('Correto, mas tente responder mais rápido! 🐢');
        }
      } else {
        toast.error(`Não desanime! Você aprende com os erros. 💪`);
      }

      // Atualiza pontuação no modo desafio
      if (modoEstudo === 'desafio') {
        const pontuacaoTotal = pontuacaoBase + bonusSequencia + bonusDificuldade + bonusTempo;
        setPontuacao(prev => prev + pontuacaoTotal);
        
        if (acertou) {
          setSequenciaAcertos(prev => {
            const novaSequencia = prev + 1;
            if (novaSequencia > 0 && novaSequencia % 5 === 0) {
              toast.success(`Sequência incrível de ${novaSequencia} acertos! 🔥`);
            }
            return novaSequencia;
          });
        } else {
          setSequenciaAcertos(0);
        }
      }

      // Verifica se é o último card
      const proximoIndice = indiceAtual + 1;
      if (proximoIndice >= cardsEstudo.length) {
        finalizarEstudo();
        return;
      }

      // Passa para o próximo card com animação
      setIndiceAtual(proximoIndice);
      setCardAtual(cardsEstudo[proximoIndice]);
      setMostrarResposta(false);
      setTempoInicio(Date.now());

    } catch (error) {
      console.error('Erro ao responder flashcard:', error);
      toast.error('Erro ao processar resposta');
    }
  };

  // Função para finalizar estudo
  const finalizarEstudo = () => {
    const tempoTotal = (Date.now() - tempoInicio) / 1000;
    setEstatisticas(prev => ({
      ...prev,
      cardsRevisados: prev.cardsRevisados + cardsEstudo.length,
      tempoTotalEstudo: prev.tempoTotalEstudo + tempoTotal,
      pontuacaoTotal: prev.pontuacaoTotal + pontuacao
    }));

    if (modoEstudo === 'desafio') {
      if (pontuacao > 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      toast.success(`Desafio concluído! Pontuação: ${pontuacao} pontos`);
    } else {
      toast.success('Revisão concluída!');
    }

    setCardAtual(null);
    setCardsEstudo([]);
    setModoEstudo('revisao');
    setEstudoEmAndamento(false);
    setIndiceAtual(0);
  };

  // Estado para geração com IA
  const [textoParaGerar, setTextoParaGerar] = useState<string>('');
  const [arquivoParaGerar, setArquivoParaGerar] = useState<File | null>(null);
  const [cardsGerados, setCardsGerados] = useState<Omit<Flashcard, 'id' | 'ultimaRevisao' | 'proximaRevisao' | 'acertos' | 'erros' | 'intervaloDias' | 'tempoEstudo' | 'ultimaPontuacao'>[]>([]);

  // Função para gerar flashcards com IA
  const handleGerarFlashcardsComIA = async () => {
    if (!textoParaGerar.trim()) {
      toast.error('Por favor, insira um texto para gerar os flashcards');
      return;
    }

    try {
      // Simular chamada à API de IA
      const novosCards: Omit<Flashcard, 'id' | 'ultimaRevisao' | 'proximaRevisao' | 'acertos' | 'erros' | 'intervaloDias' | 'tempoEstudo' | 'ultimaPontuacao'>[] = [
        {
          pergunta: 'O que é o conceito principal do texto?',
          resposta: 'Resposta gerada pela IA baseada no texto fornecido',
          categoria: filtroCategoria !== 'todas' ? filtroCategoria : 'Geral',
          dificuldade: 'médio' as const,
          tags: [],
          favorito: false,
          notas: ''
        }
      ];

      setCardsGerados(novosCards);
      toast.success('Flashcards gerados com sucesso!');
      setShowModalGerarAI(false);

      // Adicionar os cards gerados à lista de flashcards
      const novosFlashcards = novosCards.map(card => ({
        ...card,
        id: uuidv4(),
        ultimaRevisao: new Date(),
        proximaRevisao: new Date(),
        acertos: 0,
        erros: 0,
        intervaloDias: 1,
        tempoEstudo: 0,
        ultimaPontuacao: 0
      }));

      setFlashcards(prev => [...prev, ...novosFlashcards]);
    } catch (error) {
      console.error('Erro ao gerar flashcards:', error);
      toast.error('Erro ao gerar flashcards com IA');
    }
  };

  // Função para gerenciar categorias
  const gerenciarCategoria = (acao: 'adicionar' | 'editar' | 'remover', categoria?: Categoria) => {
    try {
      if (acao === 'adicionar') {
        if (!novaCategoria.nome.trim()) {
          toast.error('Nome da categoria é obrigatório');
          return;
        }

        // Verifica se já existe uma categoria com o mesmo nome
        if (categorias.some(cat => cat.nome.toLowerCase() === novaCategoria.nome.toLowerCase())) {
          toast.error('Já existe uma categoria com este nome');
          return;
        }

        const novaId = uuidv4();
        const novaCor = novaCategoria.cor || '#' + Math.floor(Math.random()*16777215).toString(16);

        setCategorias(prev => [...prev, { ...novaCategoria, id: novaId, cor: novaCor }]);
        setNovaCategoria({ nome: '', cor: '#' + Math.floor(Math.random()*16777215).toString(16) });
        toast.success('Categoria adicionada com sucesso!');

        // Verifica conquistas relacionadas a categorias
        const totalCategorias = categorias.length + 1;
        const conquistasCategorias = conquistas.filter(c => 
          c.requisito.tipo === 'categorias' && !c.desbloqueada && c.requisito.valor <= totalCategorias
        );

        if (conquistasCategorias.length > 0) {
          conquistasCategorias.forEach(conquista => {
            setConquistas(prev => prev.map(c => 
              c.id === conquista.id ? { ...c, desbloqueada: true, dataDesbloqueio: new Date() } : c
            ));
            toast.success(`Conquista desbloqueada: ${conquista.nome}!`);
          });
        }
      } else if (acao === 'editar') {
        if (!categoria) return;

        // Verifica se o novo nome já existe em outra categoria
        if (categorias.some(cat => 
          cat.id !== categoria.id && 
          cat.nome.toLowerCase() === categoria.nome.toLowerCase()
        )) {
          toast.error('Já existe uma categoria com este nome');
          return;
        }

        setCategorias(prev => prev.map(cat =>
          cat.id === categoria.id ? categoria : cat
        ));
        toast.success('Categoria atualizada com sucesso!');
      } else if (acao === 'remover') {
        if (!categoria) return;

        // Impede a remoção da categoria 'Geral'
        if (categoria.nome === 'Geral') {
          toast.error('A categoria Geral não pode ser removida');
          return;
        }

        setCategorias(prev => prev.filter(cat => cat.id !== categoria.id));
        
        // Atualiza flashcards da categoria removida para categoria 'Geral'
        setFlashcards(prev => prev.map(card =>
          card.categoria === categoria.nome ? { ...card, categoria: 'Geral' } : card
        ));

        toast.success('Categoria removida com sucesso!');
      }

      setShowModalCategoria(false);
    } catch (error) {
      console.error('Erro ao gerenciar categoria:', error);
      toast.error('Erro ao gerenciar categoria');
    }
  };
  
  // Estados para funcionalidades avançadas
  const [modoOffline, setModoOffline] = useState<boolean>(false);
  const [reconhecimentoVozAtivo, setReconhecimentoVozAtivo] = useState<boolean>(false);
  const [escutandoResposta, setEscutandoResposta] = useState<boolean>(false);
  const [mostrarConquistas, setMostrarConquistas] = useState<boolean>(false);
  const [mostrarGraficos, setMostrarGraficos] = useState<boolean>(false);
  const [filtroTags, setFiltroTags] = useState<string[]>([]);
  const [mostrarFavoritos, setMostrarFavoritos] = useState<boolean>(false);
  const [showModalPersonalizacao, setShowModalPersonalizacao] = useState<boolean>(false);

  const [showModalConquistas, setShowModalConquistas] = useState<boolean>(false);
  const [showModalExportar, setShowModalExportar] = useState<boolean>(false);
  const [formatoExportacao, setFormatoExportacao] = useState<'json' | 'csv' | 'pdf'>('json');
  
  // Estados para efeitos visuais
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [showParticles, setShowParticles] = useState<boolean>(false);
  const [particleOrigin, setParticleOrigin] = useState<{x: number, y: number}>({x: 50, y: 50});
  const [particleColors, setParticleColors] = useState<string[]>(['#166bb3', '#4a6fa5', '#90cdf4']);
  
  // Estado para sincronização e modo offline
  const [sincronizando, setSincronizando] = useState<boolean>(false);
  const [ultimaSincronizacao, setUltimaSincronizacao] = useState<Date | null>(null);
  const [dadosOffline, setDadosOffline] = useState<{
    flashcards: Flashcard[];
    categorias: Categoria[];
    estatisticas: Estatisticas;
    ultimaSincronizacao: Date | null;
  } | null>(null);
  const [statusConexao, setStatusConexao] = useState<'online' | 'offline'>('online');

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('flashcards-data');
    if (dadosSalvos) {
      try {
        const dados = JSON.parse(dadosSalvos);
        
        // Converter strings de data para objetos Date
        const flashcardsConvertidos = dados.flashcards.map((card: any) => ({
          ...card,
          ultimaRevisao: new Date(card.ultimaRevisao),
          proximaRevisao: new Date(card.proximaRevisao),
          // Garantir que datas de desbloqueio de conquistas também sejam convertidas
          dataDesbloqueio: card.dataDesbloqueio ? new Date(card.dataDesbloqueio) : undefined
        }));
        
        setFlashcards(flashcardsConvertidos);
        setCategorias(dados.categorias || categorias);
        setEstatisticas(prev => ({
          ...prev,
          ...dados.estatisticas,
          // Garantir que a data do último dia de estudo seja um objeto Date
          ultimoDiaEstudo: dados.estatisticas?.ultimoDiaEstudo ? 
            new Date(dados.estatisticas.ultimoDiaEstudo) : prev.ultimoDiaEstudo
        }));
        
        // Carregar dados de sincronização
        if (dados.ultimaSincronizacao) {
          setUltimaSincronizacao(new Date(dados.ultimaSincronizacao));
        }
        
        // Verificar se há dados offline salvos
        const dadosOfflineSalvos = localStorage.getItem('flashcards-offline');
        if (dadosOfflineSalvos) {
          try {
            const dadosOffline = JSON.parse(dadosOfflineSalvos);
            setDadosOffline({
              ...dadosOffline,
              ultimaSincronizacao: dadosOffline.ultimaSincronizacao ? 
                new Date(dadosOffline.ultimaSincronizacao) : null
            });
          } catch (error) {
            console.error('Erro ao carregar dados offline:', error);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados salvos');
      }
    }
    
    // Verificar status de conexão inicial
    setStatusConexao(navigator.onLine ? 'online' : 'offline');
    
    // Adicionar event listeners para monitorar conexão
    const handleOnline = () => {
      setStatusConexao('online');
      toast.success('Conexão restabelecida! Seus dados serão sincronizados.');
      sincronizarDados();
    };
    
    const handleOffline = () => {
      setStatusConexao('offline');
      toast.warning('Você está offline. O modo de estudo offline foi ativado.');
      // Salvar dados atuais para uso offline
      salvarDadosOffline();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Função para salvar dados para uso offline
  const salvarDadosOffline = () => {
    const dadosParaSalvar = {
      flashcards,
      categorias,
      estatisticas,
      ultimaSincronizacao: new Date()
    };
    
    localStorage.setItem('flashcards-offline', JSON.stringify(dadosParaSalvar));
    setDadosOffline(dadosParaSalvar);
    setModoOffline(true);
  };
  
  // Função para sincronizar dados quando voltar a ficar online
  const sincronizarDados = () => {
    if (statusConexao === 'offline' || !dadosOffline) return;
    
    setSincronizando(true);
    
    // Simular processo de sincronização (em um app real, isso seria uma chamada de API)
    setTimeout(() => {
      // Aqui seria feita a lógica de mesclagem de dados offline com o servidor
      // Por simplicidade, apenas atualizamos o timestamp de sincronização
      const agora = new Date();
      setUltimaSincronizacao(agora);
      
      // Limpar dados offline após sincronização bem-sucedida
      localStorage.removeItem('flashcards-offline');
      setDadosOffline(null);
      setModoOffline(false);
      setSincronizando(false);
      
      toast.success('Dados sincronizados com sucesso!');
    }, 1500);
  };

  // Salvar dados no localStorage quando houver mudanças
  useEffect(() => {
    if (flashcards.length > 0 || categorias.length > 0) {
      const dados = {
        flashcards,
        categorias,
        estatisticas
      };
      localStorage.setItem('flashcards-data', JSON.stringify(dados));
    }
  }, [flashcards, categorias, estatisticas]);

  // Atualizar estatísticas totais
  useEffect(() => {
    setEstatisticas(prev => ({
      ...prev,
      totalCards: flashcards.length
    }));
  }, [flashcards]);

  // Filtrar flashcards para estudo
  const filtrarFlashcards = () => {
    let filtered = [...flashcards];
    
    // Filtrar por categoria
    if (filtroCategoria !== 'todas') {
      filtered = filtered.filter(card => card.categoria === filtroCategoria);
    }
    
    // Filtrar por dificuldade
    if (filtroDificuldade !== 'todas') {
      filtered = filtered.filter(card => card.dificuldade === filtroDificuldade);
    }
    
    // Filtrar por termo de busca
    if (termoBusca.trim() !== '') {
      const termo = termoBusca.toLowerCase();
      filtered = filtered.filter(
        card => card.pergunta.toLowerCase().includes(termo) || 
               card.resposta.toLowerCase().includes(termo)
      );
    }
    
    // Filtrar por favoritos
    if (mostrarFavoritos) {
      filtered = filtered.filter(card => card.favorito);
    }
    
    // Filtrar por tags
    if (filtroTags.length > 0) {
      filtered = filtered.filter(card => 
        filtroTags.some(tag => card.tags?.includes(tag))
      );
    }
    
    return filtered;
  };

  // Verificar conquistas desbloqueadas
  const verificarConquistas = () => {
    const conquistasAtualizadas = [...conquistas];
    let novasConquistas = false;
    
    // Verificar cada conquista não desbloqueada
    conquistasAtualizadas.forEach((conquista, index) => {
      if (conquista.desbloqueada) return;
      
      let requisitoCumprido = false;
      
      switch (conquista.requisito.tipo) {
        case 'acertos':
          requisitoCumprido = estatisticas.acertos >= conquista.requisito.valor;
          break;
        case 'sequencia':
          requisitoCumprido = estatisticas.sequenciaAtual >= conquista.requisito.valor || 
                             estatisticas.maiorSequencia >= conquista.requisito.valor;
          break;
        case 'cards_criados':
          requisitoCumprido = flashcards.length >= conquista.requisito.valor;
          break;
        case 'tempo_estudo':
          requisitoCumprido = estatisticas.tempoTotalEstudo >= conquista.requisito.valor;
          break;
        case 'dias_consecutivos':
          requisitoCumprido = estatisticas.diasConsecutivos >= conquista.requisito.valor;
          break;
        case 'categorias':
          // Verificar se o usuário tem cards em pelo menos X categorias diferentes
          const categoriasComCards = new Set(flashcards.map(card => card.categoria));
          requisitoCumprido = categoriasComCards.size >= conquista.requisito.valor;
          break;
        case 'dificuldade':
          // Verificar se o usuário acertou X cards de determinada dificuldade
          const cardsDificuldade = flashcards.filter(
            card => card.dificuldade === conquista.requisito.dificuldade && card.acertos > 0
          );
          requisitoCumprido = cardsDificuldade.length >= conquista.requisito.valor;
          break;
      }
      
      if (requisitoCumprido) {
        conquistasAtualizadas[index] = {
          ...conquista,
          desbloqueada: true,
          dataDesbloqueio: new Date()
        };
        
        // Adicionar pontos ao desbloquear conquista
        setEstatisticas(prev => ({
          ...prev,
          pontuacaoTotal: prev.pontuacaoTotal + conquista.pontos,
          nivelUsuario: Math.floor((prev.pontuacaoTotal + conquista.pontos) / 100) + 1,
          conquistasDesbloqueadas: [...prev.conquistasDesbloqueadas, conquista.id]
        }));
        
        novasConquistas = true;
      }
    });
    
    if (novasConquistas) {
      setConquistas(conquistasAtualizadas);
      // Ativar efeito de confete
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      
      toast.success('🏆 Nova conquista desbloqueada!', {
        duration: 5000,
        action: {
          label: 'Ver',
          onClick: () => setShowModalConquistas(true)
        }
      });
    }
  };

  // Iniciar sessão de estudo
  const iniciarEstudo = () => {
    const cardsParaEstudar = filtrarFlashcards();
    
    if (cardsParaEstudar.length === 0) {
      toast.error('Nenhum flashcard disponível com os filtros atuais');
      return;
    }
    
    // Para modo revisão, priorizar cards que precisam de revisão hoje
    if (modoEstudo === 'revisao') {
      const hoje = new Date();
      const cardsParaRevisar = cardsParaEstudar
        .filter(card => card.proximaRevisao <= hoje)
        .sort((a, b) => a.proximaRevisao.getTime() - b.proximaRevisao.getTime());
      
      const outrosCards = cardsParaEstudar
        .filter(card => card.proximaRevisao > hoje)
        .sort((a, b) => a.proximaRevisao.getTime() - b.proximaRevisao.getTime());
      
      setCardsEstudo([...cardsParaRevisar, ...outrosCards]);
      toast.success('Modo Revisão iniciado! Prioridade para cards que precisam de revisão hoje.');
    } 
    // Para modo desafio, embaralhar os cards
    else {
      setCardsEstudo(cardsParaEstudar.sort(() => Math.random() - 0.5));
      setPontuacao(0);
      toast.success('Modo Desafio iniciado! Ganhe pontos respondendo corretamente.');
    }
    
    setCardAtual(cardsParaEstudar[0]);
    setMostrarResposta(false);
    setTempoInicio(Date.now());
    
    // Atualizar estatísticas de estudo
    const hoje = new Date();
    const dataHoje = hoje.toISOString().split('T')[0];
    
    setEstatisticas(prev => {
      // Verificar se é um novo dia de estudo
      const ultimoDia = new Date(prev.ultimoDiaEstudo);
      const ehNovoDia = hoje.toDateString() !== ultimoDia.toDateString();
      
      // Atualizar dias consecutivos
      let novosDiasConsecutivos = prev.diasConsecutivos;
      if (ehNovoDia) {
        novosDiasConsecutivos = ultimoDia.getTime() > 0 && 
          (hoje.getTime() - ultimoDia.getTime()) <= (24 * 60 * 60 * 1000) ? 
          prev.diasConsecutivos + 1 : 1;
      }
      
      // Atualizar distribuição de estudo por dia
      const novaDistribuicao = { ...prev.distribuicaoEstudoPorDia };
      novaDistribuicao[dataHoje] = (novaDistribuicao[dataHoje] || 0) + 1;
      
      return {
        ...prev,
        diasConsecutivos: novosDiasConsecutivos,
        ultimoDiaEstudo: hoje,
        distribuicaoEstudoPorDia: novaDistribuicao
      };
    });
    
    // Verificar conquistas após iniciar estudo
    verificarConquistas();
  };

  // Próximo card na sessão de estudo
  const proximoCard = () => {
    if (cardsEstudo.length <= 1) {
      toast.success('Você completou todos os flashcards!');
      setCardAtual(null);
      return;
    }
    
    const novosCards = cardsEstudo.slice(1);
    setCardsEstudo(novosCards);
    setCardAtual(novosCards[0]);
    setMostrarResposta(false);
    setTempoInicio(Date.now());
  };

  // Registrar resultado do estudo usando algoritmo SuperMemo SM-2 aprimorado
  const registrarResultado = (acertou: boolean) => {
    if (!cardAtual) return;
    
    const tempoResposta = (Date.now() - tempoInicio) / 1000; // em segundos
    
    // Ativar efeito de partículas se acertou
    if (acertou) {
      // Definir cores baseadas na dificuldade do card
      let cores = ['#166bb3', '#4a6fa5', '#90cdf4'];
      if (cardAtual.dificuldade === 'fácil') {
        cores = ['#28a745', '#20883a', '#90ee90'];
      } else if (cardAtual.dificuldade === 'difícil') {
        cores = ['#dc3545', '#c82333', '#ffb3ba'];
      }
      
      setParticleColors(cores);
      setParticleOrigin({x: 50, y: 50}); // Centro da tela
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1000);
    }
    
    // Atualizar estatísticas
    setEstatisticas(prev => {
      const novaSequencia = acertou ? prev.sequenciaAtual + 1 : 0;
      const novaMaiorSequencia = Math.max(prev.maiorSequencia, novaSequencia);
      
      // Verificar se é um novo dia de estudo
      const hoje = new Date();
      const ultimoDia = new Date(prev.ultimoDiaEstudo);
      const ehNovoDia = hoje.toDateString() !== ultimoDia.toDateString();
      
      // Atualizar dias consecutivos
      let novosDiasConsecutivos = prev.diasConsecutivos;
      if (ehNovoDia) {
        novosDiasConsecutivos = ultimoDia.getTime() > 0 && 
          (hoje.getTime() - ultimoDia.getTime()) <= (24 * 60 * 60 * 1000) ? 
          prev.diasConsecutivos + 1 : 1;
      }
      
      // Atualizar distribuição de estudo por dia
      const dataHoje = hoje.toISOString().split('T')[0];
      const novaDistribuicao = { ...prev.distribuicaoEstudoPorDia };
      novaDistribuicao[dataHoje] = (novaDistribuicao[dataHoje] || 0) + 1;
      
      return {
        ...prev,
        cardsRevisados: prev.cardsRevisados + 1,
        acertos: acertou ? prev.acertos + 1 : prev.acertos,
        erros: !acertou ? prev.erros + 1 : prev.erros,
        tempoMedioResposta: (prev.tempoMedioResposta * prev.cardsRevisados + tempoResposta) / (prev.cardsRevisados + 1),
        sequenciaAtual: novaSequencia,
        maiorSequencia: novaMaiorSequencia,
        diasConsecutivos: novosDiasConsecutivos,
        ultimoDiaEstudo: hoje,
        tempoTotalEstudo: prev.tempoTotalEstudo + tempoResposta,
        distribuicaoEstudoPorDia: novaDistribuicao
      };
    });
    
    // Atualizar o flashcard com o novo intervalo de repetição espaçada (algoritmo SM-2)
    const cardAtualizado = { ...cardAtual };
    
    // Implementação do algoritmo SuperMemo SM-2
    if (acertou) {
      cardAtualizado.acertos += 1;
      
      // Calcular fator de facilidade (EF - Ease Factor)
      let fatorFacilidade = cardAtualizado.fatorFacilidade || 2.5;
      
      // Qualidade da resposta (q) baseada no tempo de resposta e dificuldade do card
      let qualidade = 5; // Padrão: resposta perfeita
      
      if (tempoResposta > 15) {
        qualidade = 3; // Resposta correta, mas demorada
      } else if (tempoResposta > 8) {
        qualidade = 4; // Resposta correta com alguma hesitação
      }
      
      // Ajustar fator de facilidade baseado na qualidade da resposta
      fatorFacilidade = Math.max(1.3, fatorFacilidade + (0.1 - (5 - qualidade) * (0.08 + (5 - qualidade) * 0.02)));
      
      // Calcular novo intervalo
      if (cardAtualizado.intervaloDias === 1) {
        cardAtualizado.intervaloDias = 6; // Primeiro intervalo após acerto
      } else if (cardAtualizado.intervaloDias === 6) {
        cardAtualizado.intervaloDias = Math.round(6 * fatorFacilidade); // Segundo intervalo
      } else {
        cardAtualizado.intervaloDias = Math.round(cardAtualizado.intervaloDias * fatorFacilidade); // Intervalos subsequentes
      }
      
      // Limitar o intervalo máximo a 365 dias
      cardAtualizado.intervaloDias = Math.min(cardAtualizado.intervaloDias, 365);
      
      // Armazenar o fator de facilidade para uso futuro
      cardAtualizado.fatorFacilidade = fatorFacilidade;
      
      // Modo desafio: adicionar pontos
      if (modoEstudo === 'desafio') {
        // Mais pontos para respostas rápidas e cards difíceis
        const pontosDificuldade = cardAtualizado.dificuldade === 'difícil' ? 3 : 
                                 cardAtualizado.dificuldade === 'médio' ? 2 : 1;
        const pontosVelocidade = tempoResposta < 5 ? 3 : tempoResposta < 10 ? 2 : 1;
        const pontosSequencia = Math.min(Math.floor(estatisticas.sequenciaAtual / 5), 3); // Bônus por sequência
        const pontosTotal = pontosDificuldade * pontosVelocidade + pontosSequencia;
        
        setPontuacao(prev => prev + pontosTotal);
        setEstatisticas(prev => ({
          ...prev,
          pontuacaoTotal: prev.pontuacaoTotal + pontosTotal,
          nivelUsuario: Math.floor(prev.pontuacaoTotal / 100) + 1
        }));
      }
    } else {
      cardAtualizado.erros += 1;
      
      // Reduzir o fator de facilidade quando erra
      let fatorFacilidade = cardAtualizado.fatorFacilidade || 2.5;
      fatorFacilidade = Math.max(1.3, fatorFacilidade - 0.2);
      cardAtualizado.fatorFacilidade = fatorFacilidade;
      
      // Reduzir o intervalo para revisão mais frequente
      cardAtualizado.intervaloDias = 1;
      
      // Resetar a sequência de acertos
      setEstatisticas(prev => ({
        ...prev,
        sequenciaAtual: 0
      }));
    }
    
    cardAtualizado.ultimaRevisao = new Date();
    const proximaData = new Date();
    proximaData.setDate(proximaData.getDate() + cardAtualizado.intervaloDias);
    cardAtualizado.proximaRevisao = proximaData;
    cardAtualizado.tempoEstudo = (cardAtualizado.tempoEstudo || 0) + tempoResposta;
    cardAtualizado.ultimaPontuacao = acertou ? 1 : 0;
    
    // Atualizar o flashcard na lista
    setFlashcards(prev => 
      prev.map(card => card.id === cardAtualizado.id ? cardAtualizado : card)
    );
    
    // Verificar conquistas desbloqueadas
    verificarConquistas();
    
    // Ir para o próximo card
    proximoCard();
  };

  // Adicionar novo flashcard
  const adicionarFlashcard = () => {
    if (!novoFlashcard.pergunta || !novoFlashcard.resposta) {
      toast.error('Preencha a pergunta e a resposta');
      return;
    }
    
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);
    
    const novoCard: Flashcard = {
      id: uuidv4(),
      ...novoFlashcard,
      ultimaRevisao: hoje,
      proximaRevisao: amanha,
      acertos: 0,
      erros: 0,
      intervaloDias: 1,
      tempoEstudo: 0,
      ultimaPontuacao: 0
    };
    
    setFlashcards(prev => [...prev, novoCard]);
    setNovoFlashcard({ 
      pergunta: '',
      resposta: '',
      categoria: novoFlashcard.categoria,
      dificuldade: 'médio',
      tags: [],
      favorito: false,
      notas: '',
      imagem: '',
      audio: '',
      // Removido estilo para simplificar a estrutura
    });
    
    setShowModalNovoCard(false);
    toast.success('Flashcard adicionado com sucesso!');
  };

  // Adicionar nova categoria
  const adicionarCategoria = () => {
    if (!novaCategoria.nome) {
      toast.error('Digite um nome para a categoria');
      return;
    }
    
    if (categorias.some(cat => cat.nome.toLowerCase() === novaCategoria.nome.toLowerCase())) {
      toast.error('Já existe uma categoria com este nome');
      return;
    }
    
    const categoria: Categoria = {
      id: uuidv4(),
      ...novaCategoria
    };
    
    setCategorias(prev => [...prev, categoria]);
    setNovaCategoria({ 
      nome: '',
      cor: '#' + Math.floor(Math.random()*16777215).toString(16),
    });
    
    setShowModalCategoria(false);
    toast.success('Categoria adicionada com sucesso!');
  };

  // Excluir flashcard
  const excluirFlashcard = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este flashcard?')) {
      const cardToDelete = flashcards.find(card => card.id === id);
      
      // Remove o card da lista principal
      setFlashcards(prev => prev.filter(card => card.id !== id));
      
      // Se o card estava nos favoritos, remove também
      if (cardToDelete?.favorito) {
        setCardsFavoritos(prev => prev.filter(card => card.id !== id));
        localStorage.setItem('flashcardsFavoritos', JSON.stringify(cardsFavoritos.filter(card => card.id !== id)));
        
        // Atualiza as estatísticas
        setEstatisticas(prev => ({
          ...prev,
          cardsFavoritos: prev.cardsFavoritos - 1
        }));
      }
      
      toast.success('Flashcard excluído com sucesso!');
    }
  };
  
  // Marcar flashcard como favorito
  const marcarComoFavorito = (id: string) => {
    setFlashcards(prev => prev.map(card => {
      if (card.id === id) {
        return { ...card, favorito: !card.favorito };
      }
      return card;
    }));
    
    // Atualizar estatísticas de favoritos
    setEstatisticas(prev => ({
      ...prev,
      cardsFavoritos: prev.cardsFavoritos + (flashcards.find(card => card.id === id)?.favorito ? -1 : 1)
    }));
    
    toast.success('Status de favorito atualizado!');
  };

  // Exportar flashcards
  const exportarFlashcards = () => {
    const dados = {
      flashcards,
      categorias,
      dataExportacao: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Flashcards exportados com sucesso!');
  };

  // Importar flashcards
  const importarFlashcards = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    
    const leitor = new FileReader();
    leitor.onload = (evento) => {
      try {
        const conteudo = evento.target?.result as string;
        const dados = JSON.parse(conteudo);
        
        // Validar estrutura básica
        if (!dados.flashcards || !Array.isArray(dados.flashcards)) {
          throw new Error('Formato de arquivo inválido');
        }
        
        // Converter strings de data para objetos Date
        const flashcardsConvertidos = dados.flashcards.map((card: any) => ({
          ...card,
          ultimaRevisao: new Date(card.ultimaRevisao),
          proximaRevisao: new Date(card.proximaRevisao),
          // Garantir que tenha um ID
          id: card.id || uuidv4()
        }));
        
        // Perguntar se deseja substituir ou adicionar
        if (window.confirm('Deseja substituir os flashcards existentes ou adicionar os novos?\n\nOK = Substituir\nCancelar = Adicionar')) {
          setFlashcards(flashcardsConvertidos);
        } else {
          setFlashcards(prev => [...prev, ...flashcardsConvertidos]);
        }
        
        // Importar categorias se existirem
        if (dados.categorias && Array.isArray(dados.categorias)) {
          if (window.confirm('Deseja importar também as categorias?')) {
            setCategorias(dados.categorias);
          }
        }
        
        setShowModalImportar(false);
        toast.success('Flashcards importados com sucesso!');
      } catch (error) {
        console.error('Erro ao importar:', error);
        toast.error('Erro ao importar o arquivo. Verifique o formato.');
      }
    };
    
    leitor.readAsText(arquivo);
  };

  // Extrair texto de PDF usando biblioteca pdfjs
  const extrairTextoDePDF = async (arquivo: File): Promise<string> => {
    try {
      // Carregar a biblioteca pdfjs dinamicamente
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      // Ler o arquivo como ArrayBuffer
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(arquivo);
      });
      
      // Carregar o documento PDF
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let textoCompleto = '';
      
      // Extrair texto de cada página
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map((item: any) => item.str);
        textoCompleto += textItems.join(' ') + '\n';
        
        // Atualizar progresso
        toast.info(`Processando página ${i} de ${pdf.numPages}...`, { id: 'pdf-progress' });
      }
      
      return textoCompleto;
    } catch (error) {
      console.error('Erro ao extrair texto do PDF:', error);
      throw new Error('Não foi possível extrair o texto do PDF. Verifique se o arquivo é válido.');
    }
  };

  // Gerar flashcards com IA
  const gerarFlashcardsComIA = async () => {
    if (!textoParaGerar && !arquivoParaGerar) {
      toast.error('Forneça um texto ou arquivo para gerar flashcards');
      return;
    }
    
    try {
      toast.info('Processando conteúdo...', { id: 'processing' });
      let conteudo = textoParaGerar;
      
      // Se tiver arquivo, processar de acordo com o tipo
      if (arquivoParaGerar) {
        const tipoArquivo = arquivoParaGerar.type;
        
        if (tipoArquivo === 'application/pdf') {
          // Extrair texto de PDF
          toast.info('Extraindo texto do PDF...', { id: 'pdf-extract' });
          try {
            conteudo = await extrairTextoDePDF(arquivoParaGerar);
            toast.success('Texto extraído com sucesso!', { id: 'pdf-extract' });
          } catch (error) {
            toast.error('Erro ao extrair texto do PDF. Tente outro arquivo.', { id: 'pdf-extract' });
            return;
          }
        } else if (tipoArquivo === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // Para arquivos DOCX, usar uma abordagem simplificada
          toast.info('Lendo arquivo DOCX...', { id: 'docx-extract' });
          try {
            const texto = await arquivoParaGerar.text();
            // Extrair texto do DOCX (simplificado)
            conteudo = texto.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');
            toast.success('Texto extraído com sucesso!', { id: 'docx-extract' });
          } catch (error) {
            toast.error('Erro ao ler arquivo DOCX. Tente outro formato.', { id: 'docx-extract' });
            return;
          }
        } else {
          // Para outros tipos de arquivo (TXT, etc)
          const texto = await arquivoParaGerar.text();
          conteudo = texto;
        }
      }
      
      // Verificar se há conteúdo suficiente
      if (conteudo.trim().length < 50) {
        toast.error('O conteúdo é muito curto para gerar flashcards de qualidade');
        return;
      }
      
      toast.info('Analisando conteúdo e gerando flashcards...', { id: 'processing' });
      
      // Implementação melhorada de geração de flashcards
      // Em um app real, isso seria uma chamada a uma API de IA
      setTimeout(() => {
        // Dividir o texto em parágrafos
        const paragrafos = conteudo.split(/\n+/).filter(p => p.trim().length > 30);
        
        // Extrair frases significativas
        const frases = [];
        for (const paragrafo of paragrafos) {
          const frasesParag = paragrafo.split(/[.!?]\s+/).filter(f => f.trim().length > 20);
          frases.push(...frasesParag);
        }
        
        // Limitar a 20 frases para não sobrecarregar
        const frasesLimitadas = frases.slice(0, 20);
        
        // Gerar flashcards mais inteligentes
        const cardsGerados = frasesLimitadas.map(frase => {
          // Detectar se a frase parece uma definição
          const ehDefinicao = /é\s(um|uma|o|a)\s|significa|refere-se|consiste|define-se/.test(frase.toLowerCase());
          
          // Detectar se a frase contém uma enumeração
          const contemEnumeracao = /:\s|são\s|incluem/.test(frase);
          
          // Detectar se a frase contém uma comparação
          const contemComparacao = /diferente|semelhante|comparado|versus|enquanto|ao contrário/.test(frase.toLowerCase());
          
          let pergunta, resposta;
          
          if (ehDefinicao) {
            // Extrair o termo sendo definido (simplificado)
            const termo = frase.split(/é\s(um|uma|o|a)\s|significa|refere-se|consiste|define-se/)[0].trim();
            pergunta = `O que é ${termo}?`;
            resposta = frase.trim();
          } else if (contemEnumeracao) {
            // Extrair o tópico da enumeração
            const partes = frase.split(/:\s|são\s|incluem/);
            pergunta = `Quais são os elementos relacionados a ${partes[0].trim()}?`;
            resposta = frase.trim();
          } else if (contemComparacao) {
            pergunta = `Explique a comparação mencionada na seguinte afirmação: "${frase.substring(0, 50)}..."?`;
            resposta = frase.trim();
          } else {
            // Caso padrão: transformar em pergunta de compreensão
            pergunta = `Explique o significado de: "${frase.substring(0, 50)}..."?`;
            resposta = frase.trim();
          }
          
          // Determinar dificuldade com base na complexidade da frase
          let dificuldade: 'fácil' | 'médio' | 'difícil' = 'médio';
          if (frase.length > 200 || frase.split(' ').length > 30) {
            dificuldade = 'difícil';
          } else if (frase.length < 100 && frase.split(' ').length < 15) {
            dificuldade = 'fácil';
          }
          
          // Extrair possíveis tags (palavras-chave)
          const palavrasChave = frase.toLowerCase()
            .replace(/[.,;:!?()\[\]{}'"-]/g, '')
            .split(' ')
            .filter(palavra => palavra.length > 5 && !/^(sobre|como|quando|onde|porque|quem|qual|quais|isso|este|esta|estes|estas|aquele|aquela|aqueles|aquelas)$/i.test(palavra))
            .slice(0, 3);
          
          return {
            pergunta,
            resposta,
            categoria: filtroCategoria !== 'todas' ? filtroCategoria : 'Geral',
            dificuldade,
            tags: palavrasChave,
            favorito: false,
            notas: '',
            // Removido estilo para simplificar a estrutura
          };
        });
        
        setCardsGerados(cardsGerados);
        toast.success(`${cardsGerados.length} flashcards gerados com sucesso!`, { id: 'processing' });
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao gerar flashcards:', error);
      toast.error('Erro ao gerar flashcards com IA');
    }
  };

  // Adicionar flashcards gerados pela IA
  const adicionarFlashcardsGerados = () => {
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);
    
    const novosCards = cardsGerados.map(card => ({
      id: uuidv4(),
      ...card,
      ultimaRevisao: hoje,
      proximaRevisao: amanha,
      acertos: 0,
      erros: 0,
      intervaloDias: 1,
      tempoEstudo: 0,
      ultimaPontuacao: 0
    }));
    
    setFlashcards(prev => [...prev, ...novosCards]);
    setCardsGerados([]);
    setTextoParaGerar('');
    setArquivoParaGerar(null);
    setShowModalGerarAI(false);
    toast.success(`${novosCards.length} flashcards adicionados com sucesso!`);
  };

  // Função para síntese de voz
  const falarTexto = (texto: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Seu navegador não suporta síntese de voz');
    }
  };
  
  // Referência para o reconhecimento de voz
  const reconhecimentoVozRef = useRef<SpeechRecognition | null>(null);
  
  // Iniciar escuta de resposta por voz com análise semântica aprimorada
  const iniciarEscutaResposta = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Seu navegador não suporta reconhecimento de voz');
      return;
    }
    
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = true; // Permitir resultados intermediários para feedback em tempo real
      recognition.maxAlternatives = 3; // Obter alternativas para melhorar a precisão
      
      // Feedback visual de que está escutando
      setEscutandoResposta(true);
      toast.info('Escutando sua resposta...', { duration: 10000 });
      
      // Armazenar resultados parciais para análise
      let resultadosParciais: string[] = [];
      
      recognition.onstart = () => {
        // Tocar um som sutil para indicar que começou a escutar
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.type = 'sine';
          oscillator.frequency.value = 880;
          gainNode.gain.value = 0.1;
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.start();
          setTimeout(() => oscillator.stop(), 200);
        } catch (error) {
          console.error('Erro ao reproduzir som de início:', error);
          // Continuar mesmo se o som falhar
        }
      };
      
      recognition.onresult = (event) => {
        // Capturar resultados parciais para feedback em tempo real
        const resultado = event.results[0];
        const transcricao = resultado[0].transcript.toLowerCase();
        
        // Armazenar resultados parciais
        if (!resultado.isFinal) {
          resultadosParciais.push(transcricao);
          return;
        }
        
        // Processar resultado final
        const respostaFalada = transcricao;
        const respostaCorreta = cardAtual?.resposta.toLowerCase() || '';
        
        // Análise semântica aprimorada
        // 1. Remover palavras comuns (stopwords) e pontuação
        const stopwords = ['a', 'o', 'e', 'é', 'de', 'da', 'do', 'em', 'para', 'com', 'um', 'uma', 'que', 'se', 'na', 'no', 'os', 'as'];
        
        const limparTexto = (texto: string) => {
          let limpo = texto.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
          const palavras = limpo.split(' ').filter(palavra => 
            palavra.length > 2 && !stopwords.includes(palavra)
          );
          return palavras;
        };
        
        const palavrasRespostaCorreta = limparTexto(respostaCorreta);
        const palavrasRespostaFalada = limparTexto(respostaFalada);
        
        // 2. Verificar correspondência de palavras-chave
        const acertos = palavrasRespostaCorreta.filter(palavra => 
          palavrasRespostaFalada.some(p => p.includes(palavra) || palavra.includes(p))
        );
        
        // 3. Calcular similaridade semântica
        const percentualAcerto = palavrasRespostaCorreta.length > 0 ? 
          (acertos.length / palavrasRespostaCorreta.length) : 0;
        
        // 4. Verificar se há palavras-chave críticas que devem estar presentes
        const palavrasChaveCriticas = palavrasRespostaCorreta
          .filter(palavra => palavra.length > 5) // Palavras mais longas tendem a ser mais importantes
          .slice(0, 3); // Considerar até 3 palavras críticas
        
        const acertosCriticos = palavrasChaveCriticas.filter(palavra => 
          palavrasRespostaFalada.some(p => p.includes(palavra) || palavra.includes(p))
        );
        
        const percentualAcertoCritico = palavrasChaveCriticas.length > 0 ? 
          (acertosCriticos.length / palavrasChaveCriticas.length) : 1;
        
        // 5. Tomar decisão com base nos múltiplos fatores
        const acertou = percentualAcerto >= 0.4 || percentualAcertoCritico >= 0.7;
        
        if (acertou) {
          toast.success(
            `Resposta correta! Percentual de acerto: ${Math.round(percentualAcerto * 100)}%`,
            { duration: 3000 }
          );
          registrarResultado(true);
        } else {
          toast.error(
            `Resposta incorreta. Tente novamente. Você acertou ${Math.round(percentualAcerto * 100)}% das palavras-chave.`,
            { duration: 3000 }
          );
        }
        
        setEscutandoResposta(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Erro no reconhecimento de voz:', event.error);
        toast.error('Erro ao reconhecer voz: ' + event.error);
        setEscutandoResposta(false);
      };
      
      recognition.onend = () => {
        setEscutandoResposta(false);
      };
      
      reconhecimentoVozRef.current = recognition;
      recognition.start();
      
      // Definir um timeout para parar de escutar após 15 segundos
      setTimeout(() => {
        if (reconhecimentoVozRef.current && escutandoResposta) {
          reconhecimentoVozRef.current.stop();
          toast.info('Tempo de escuta encerrado');
        }
      }, 15000);
    } catch (error) {
      console.error('Erro ao inicializar reconhecimento de voz:', error);
      toast.error('Não foi possível iniciar o reconhecimento de voz. Verifique se seu navegador tem permissão para acessar o microfone.');
      setEscutandoResposta(false);
    }
  };
  
  // Parar reconhecimento de voz quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (reconhecimentoVozRef.current) {
        reconhecimentoVozRef.current.abort();
      }
    };
  }, []);

  // Renderizar cor da categoria
  const getCorCategoria = (nomeCategoria: string) => {
    const categoria = categorias.find(cat => cat.nome === nomeCategoria);
    return categoria?.cor || '#6c757d';
  };

  // Funções de manipulação dos modos
  const handleModoChange = (modo: 'desafio' | 'revisao' | 'favoritos') => {
    setModoAtual(modo);
    if (modo === 'desafio') {
      setPontuacaoDesafio(0);
      setSequenciaAcertos(0);
    }
  };

  const handleFavoritoToggle = (card: Flashcard) => {
    const updatedCard = { ...card, favorito: !card.favorito };
    setFlashcards(cards => cards.map(c => c.id === card.id ? updatedCard : c));
    
    // Atualiza a lista de favoritos
    if (updatedCard.favorito) {
      setCardsFavoritos(prev => [...prev, updatedCard]);
      localStorage.setItem('flashcardsFavoritos', JSON.stringify([...cardsFavoritos, updatedCard]));
    } else {
      setCardsFavoritos(prev => prev.filter(f => f.id !== card.id));
      localStorage.setItem('flashcardsFavoritos', JSON.stringify(cardsFavoritos.filter(f => f.id !== card.id)));
    }

    // Atualiza as estatísticas
    setEstatisticas(prev => ({
      ...prev,
      cardsFavoritos: updatedCard.favorito ? prev.cardsFavoritos + 1 : prev.cardsFavoritos - 1
    }));

    toast.success(
      updatedCard.favorito ? 'Card adicionado aos favoritos!' : 'Card removido dos favoritos!',
      {
        icon: <Star className={updatedCard.favorito ? "text-yellow-500" : "text-gray-500"} />,
        position: 'bottom-right',
      }
    );
  };

  const handleDesafioResposta = (correta: boolean) => {
    const pontos = correta ? 10 : -5;
    setPontuacaoDesafio(prev => prev + pontos);
    setSequenciaAcertos(prev => correta ? prev + 1 : 0);
    setEstatisticas(prev => ({
      ...prev,
      acertos: correta ? prev.acertos + 1 : prev.acertos,
      erros: correta ? prev.erros : prev.erros + 1,
      sequenciaAtual: correta ? prev.sequenciaAtual + 1 : 0,
      maiorSequencia: correta ? Math.max(prev.maiorSequencia, prev.sequenciaAtual + 1) : prev.maiorSequencia
    }));
    playSound(correta ? successSound : errorSound);
    if (correta) {
      <ConfettiEffect active={true} duration={3000} particleCount={100} />
    }
  };

  // Editar flashcard existente
  const editarFlashcard = (id: string) => {
    const card = flashcards.find(c => c.id === id);
    if (card) {
      setFlashcardEmEdicao({
        ...card,
        pergunta: card.pergunta,
        resposta: card.resposta,
        categoria: card.categoria,
        dificuldade: card.dificuldade,
        tags: [...card.tags],
        notas: card.notas,
        favorito: card.favorito,
        imagem: card.imagem,
        audio: card.audio,
        estilo: {
          corFundo: card.estilo?.corFundo || '#ffffff',
          corTexto: card.estilo?.corTexto || '#000000',
          fonte: card.estilo?.fonte || 'Inter',
          tamanhoFonte: card.estilo?.tamanhoFonte || 16
        }
      });
      setShowModalEditarCard(true);
    }
  };
  
  // Salvar edição de flashcard
  const salvarEdicaoFlashcard = () => {
    if (!flashcardEmEdicao) return;
    
    try {
      const flashcardAtualizado = {
        ...flashcardEmEdicao,
        pergunta: flashcardEmEdicao.pergunta,
        resposta: flashcardEmEdicao.resposta,
        categoria: flashcardEmEdicao.categoria,
        dificuldade: flashcardEmEdicao.dificuldade,
        tags: [...flashcardEmEdicao.tags],
        notas: flashcardEmEdicao.notas,
        favorito: flashcardEmEdicao.favorito,
        imagem: flashcardEmEdicao.imagem,
        audio: flashcardEmEdicao.audio,
        estilo: flashcardEmEdicao.estilo
      };

      setFlashcards(prev => prev.map(card => 
        card.id === flashcardAtualizado.id ? flashcardAtualizado : card
      ));

      // Atualiza o localStorage
      const dadosSalvos = localStorage.getItem('flashcards-data');
      if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);
        dados.flashcards = dados.flashcards.map((card: Flashcard) =>
          card.id === flashcardAtualizado.id ? flashcardAtualizado : card
        );
        localStorage.setItem('flashcards-data', JSON.stringify(dados));
      }
      
      setShowModalEditarCard(false);
      setFlashcardEmEdicao(null);
      toast.success('Flashcard atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar edição do flashcard:', error);
      toast.error('Erro ao salvar edição do flashcard');
    }
  };

  // Aplicar personalização ao flashcard
  

  return (
    <motion.div 
      className="flashcards-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      
      <Header />
      
      <Container className="py-4">
        <h1 className="mb-4 d-flex align-items-center">
          <span className="me-2">Flashcards Inteligentes</span>
          {modoEstudo === 'desafio' && cardAtual && (
            <Badge bg="warning" className="ms-2">
              Pontuação: {pontuacao}
            </Badge>
          )}
        </h1>
        
        <Tabs defaultActiveKey="biblioteca" className="mb-4">
          <Tab eventKey="biblioteca" title="Biblioteca de Flashcards">
            {/* Filtros e controles */}
            <Row className="mb-4 align-items-center">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Categoria</Form.Label>
                  <Form.Select 
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                  >
                    <option value="todas">Todas as categorias</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Dificuldade</Form.Label>
                  <Form.Select
                    value={filtroDificuldade}
                    onChange={(e) => setFiltroDificuldade(e.target.value)}
                  >
                    <option value="todas">Todas</option>
                    <option value="fácil">Fácil</option>
                    <option value="médio">Médio</option>
                    <option value="difícil">Difícil</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Buscar</Form.Label>
                  <div className="d-flex">
                    <Form.Control
                      type="text"
                      placeholder="Buscar nos flashcards..."
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                    />
                    <Button variant="outline-secondary" className="ms-2">
                      <Search size={18} />
                    </Button>
                  </div>
                </Form.Group>
              </Col>
              
              <Col md={2} className="d-flex justify-content-end align-items-end">
                <Button 
                  variant="primary" 
                  onClick={() => setShowModalNovoCard(true)}
                  className="w-100"
                >
                  <Plus size={18} className="me-1" /> Novo
                </Button>
              </Col>
            </Row>
            
            {/* Opções avançadas */}
            <Row className="mb-3">
              <Col className="d-flex gap-2 align-items-center">
                <Form.Check 
                  type="switch"
                  id="switch-voz"
                  label="Reconhecimento de voz"
                  checked={reconhecimentoVozAtivo}
                  onChange={(e) => setReconhecimentoVozAtivo(e.target.checked)}
                />
                <Form.Check 
                  type="switch"
                  id="switch-favoritos"
                  label="Mostrar apenas favoritos"
                  checked={mostrarFavoritos}
                  onChange={(e) => setMostrarFavoritos(e.target.checked)}
                />
                <Button 
                  variant="outline-info" 
                  size="sm"
                  onClick={() => setShowModalConquistas(true)}
                >
                  <Award size={16} className="me-1" /> Conquistas
                </Button>
              </Col>
            </Row>
            
            {/* Estatísticas */}
            <Row className="mb-4">
              <Col>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="estatisticas-card shadow-sm">
                    <Card.Body>
                      <Row>
                        <Col md={3} className="text-center">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                          >
                            <h5 className="text-primary fw-bold">Total de Cards</h5>
                            <motion.h3 
                              className="display-5 fw-bold"
                              initial={{ y: 10 }}
                              animate={{ y: 0 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              {estatisticas.totalCards}
                            </motion.h3>
                          </motion.div>
                        </Col>
                        <Col md={3} className="text-center">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                          >
                            <h5 className="text-success fw-bold">Revisados</h5>
                            <motion.h3 
                              className="display-5 fw-bold"
                              initial={{ y: 10 }}
                              animate={{ y: 0 }}
                              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                            >
                              {estatisticas.cardsRevisados}
                            </motion.h3>
                          </motion.div>
                        </Col>
                        <Col md={3} className="text-center">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                          >
                            <h5 className="text-warning fw-bold">Taxa de Acerto</h5>
                            <motion.h3 
                              className="display-5 fw-bold"
                              initial={{ y: 10 }}
                              animate={{ y: 0 }}
                              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            >
                              {estatisticas.cardsRevisados > 0 
                                ? Math.round((estatisticas.acertos / estatisticas.cardsRevisados) * 100) 
                                : 0}%
                            </motion.h3>
                          </motion.div>
                        </Col>
                        <Col md={3} className="text-center">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.4 }}
                          >
                            <h5 className="text-info fw-bold">Tempo Médio</h5>
                            <motion.h3 
                              className="display-5 fw-bold"
                              initial={{ y: 10 }}
                              animate={{ y: 0 }}
                              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                            >
                              {estatisticas.tempoMedioResposta.toFixed(1)}s
                            </motion.h3>
                          </motion.div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            </Row>
            
            {/* Lista de Flashcards */}
            <Row>
              {filtrarFlashcards().length > 0 ? (
                <AnimatePresence>
                  {filtrarFlashcards().map((card, index) => (
                    <motion.div 
                      key={card.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="col-md-4 mb-3"
                    >
                      <Card className="h-100">
                        <Card.Header 
                          style={{ 
                            background: `linear-gradient(135deg, ${getCorCategoria(card.categoria)} 0%, ${getCorCategoria(card.categoria)}dd 100%)`,
                            borderBottom: 'none'
                          }}
                          className="text-white d-flex justify-content-between align-items-center"
                        >
                          <span>{card.categoria}</span>
                          <Badge 
                            bg={card.dificuldade === 'fácil' ? 'success' : 
                               card.dificuldade === 'médio' ? 'warning' : 'danger'}
                            className="shadow-sm"
                          >
                            {card.dificuldade}
                          </Badge>
                        </Card.Header>
                        <Card.Body>
                          <Card.Title>{card.pergunta}</Card.Title>
                          <Card.Text className="text-muted">
                            Próxima revisão: {card.proximaRevisao.toLocaleDateString()}
                          </Card.Text>
                          <div className="d-flex justify-content-between mt-auto">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              className="rounded-circle p-2"
                              onClick={() => {
                                falarTexto(card.pergunta);
                                toast.info('Reproduzindo áudio...');
                              }}
                            >
                              <Volume size={16} />
                            </Button>
                            <div>
                              <Button 
                                variant="outline-warning" 
                                size="sm"
                                className="me-2 rounded-circle p-2"
                                onClick={() => marcarComoFavorito(card.id)}
                              >
                                <Star size={16} fill={card.favorito ? "currentColor" : "none"} />
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                className="me-2 rounded-circle p-2"
                                onClick={() => excluirFlashcard(card.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                className="rounded-circle p-2"
                                onClick={() => {
                                  // Aqui iria a lógica para editar o flashcard
                                  editarFlashcard(card.id);
                                }}
                              >
                                <Pencil size={16} />
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                        <Card.Footer className="text-muted d-flex justify-content-between align-items-center">
                          <small>Acertos: {card.acertos} | Erros: {card.erros}</small>
                          {card.tags && card.tags.length > 0 && (
                            <small className="text-end">
                              {card.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} bg="light" text="dark" className="me-1">{tag}</Badge>
                              ))}
                            </small>
                          )}
                        </Card.Footer>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <Col className="text-center py-5">
                  <p className="text-muted">Nenhum flashcard encontrado com os filtros atuais.</p>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowModalNovoCard(true)}
                  >
                    Criar seu primeiro flashcard
                  </Button>
                </Col>
              )}
            </Row>
            
            {/* Botões de ação */}
            <Row className="mt-4">
              <Col className="d-flex justify-content-between">
                <div>
                  <Button 
                    variant="success" 
                    className="me-2"
                    onClick={() => {
                      setModoEstudo('revisao');
                      iniciarEstudo();
                    }}
                    disabled={filtrarFlashcards().length === 0}
                  >
                    Iniciar Revisão
                  </Button>
                  <Button 
                    variant="warning"
                    onClick={() => {
                      setModoEstudo('desafio');
                      iniciarEstudo();
                    }}
                    disabled={filtrarFlashcards().length === 0}
                  >
                    Iniciar Desafio
                  </Button>
                </div>
                
                <div>
                  <Button 
                    variant="outline-primary" 
                    className="me-2"
                    onClick={() => setShowModalCategoria(true)}
                  >
                    Gerenciar Categorias
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    className="me-2"
                    onClick={() => setShowModalGerarAI(true)}
                  >
                    Gerar com IA
                  </Button>
                  <div className="btn-group">
                    <Button 
                      variant="outline-success" 
                      onClick={exportarFlashcards}
                    >
                      <Download size={16} className="me-1" /> Exportar
                    </Button>
                    <Button 
                      variant="outline-info" 
                      onClick={() => setShowModalImportar(true)}
                    >
                      <Upload size={16} className="me-1" /> Importar
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Tab>
          
          <Tab eventKey="estudo" title="Modo Estudo">
  {!cardAtual && (
    <Row className="justify-content-center mb-4">
      <Col md={6} lg={5} className="mb-4">
        <Card className="h-100 shadow-sm hover-card">
          <Card.Body className="d-flex flex-column">
            <div className="text-center mb-3">
              <div className="feature-icon bg-primary bg-gradient text-white rounded-circle p-3 mb-3">
                <Book size={24} />
              </div>
              <h5 className="card-title">Modo Revisão</h5>
            </div>
            <p className="text-muted text-center flex-grow-1">
              Revise seus flashcards no seu próprio ritmo. Ideal para uma primeira passagem pelo conteúdo ou para reforçar o aprendizado.
            </p>
            <Button 
              variant="success" 
              className="w-100 mt-3 rounded-pill"
              onClick={() => {
                setModoEstudo('revisao');
                iniciarEstudo();
              }}
              disabled={filtrarFlashcards().length === 0}
            >
              <Play size={16} className="me-2" />
              Iniciar Revisão
            </Button>
          </Card.Body>
        </Card>
      </Col>
      
      <Col md={6} lg={5} className="mb-4">
        <Card className="h-100 shadow-sm hover-card">
          <Card.Body className="d-flex flex-column">
            <div className="text-center mb-3">
              <div className="feature-icon bg-warning bg-gradient text-white rounded-circle p-3 mb-3">
                <Trophy size={24} />
              </div>
              <h5 className="card-title">Modo Desafio</h5>
            </div>
            <p className="text-muted text-center flex-grow-1">
              Teste seu conhecimento e ganhe pontos! Responda corretamente para aumentar sua pontuação e acompanhe seu progresso.
            </p>
            <Button 
              variant="warning" 
              className="w-100 mt-3 rounded-pill"
              onClick={() => {
                setModoEstudo('desafio');
                iniciarEstudo();
              }}
              disabled={filtrarFlashcards().length === 0}
            >
              <Zap size={16} className="me-2" />
              Iniciar Desafio
            </Button>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )}
  {cardAtual ? (
    <div className="estudo-container">
                <Row className="mb-4">
                  <Col>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4>
                        {modoEstudo === 'revisao' ? 'Modo Revisão' : 'Modo Desafio'}
                        {modoEstudo === 'desafio' && (
                          <Badge bg="warning" className="ms-2">
                            Pontuação: {pontuacao}
                          </Badge>
                        )}
                      </h4>
                      <div>
                        <Badge 
                          bg={cardAtual.dificuldade === 'fácil' ? 'success' : 
                             cardAtual.dificuldade === 'médio' ? 'warning' : 'danger'}
                          className="me-2"
                        >
                          {cardAtual.dificuldade}
                        </Badge>
                        <Badge 
                          style={{ backgroundColor: getCorCategoria(cardAtual.categoria) }}
                        >
                          {cardAtual.categoria}
                        </Badge>
                      </div>
                    </div>
                    
                    <ProgressBar 
                      now={(1 - cardsEstudo.length / filtrarFlashcards().length) * 100} 
                      className="mb-3"
                    />
                    
                    <motion.div 
                      className="flip-container mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className={`flipper ${mostrarResposta ? 'flipped' : ''}`}>
                        <div className="front">
                          <Card className="flashcard-estudo h-100 border-0">
                            <Card.Body>
                              <div className="d-flex justify-content-between mb-3">
                                <div>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    className="me-2 rounded-pill"
                                    onClick={() => falarTexto(cardAtual.pergunta)}
                                  >
                                    <Volume size={16} className="me-1" /> Ouvir
                                  </Button>
                                  <Button 
                                    variant="outline-warning" 
                                    size="sm"
                                    className="rounded-pill"
                                    onClick={() => marcarComoFavorito(cardAtual.id)}
                                  >
                                    <Star size={16} className="me-1" fill={cardAtual.favorito ? "currentColor" : "none"} /> 
                                    {cardAtual.favorito ? 'Favorito' : 'Favoritar'}
                                  </Button>
                                </div>
                                <motion.span 
                                  className="badge bg-info text-white"
                                  initial={{ scale: 0.8 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  Card {filtrarFlashcards().length - cardsEstudo.length + 1} de {filtrarFlashcards().length}
                                </motion.span>
                              </div>
                              
                              <motion.h3 
                                className="text-center my-5"
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                                style={{}}
                              >
                                {cardAtual.pergunta}
                              </motion.h3>
                              
                              <div className="text-center mt-auto">
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button 
                                    variant="primary" 
                                    size="lg"
                                    className="rounded-pill px-4 py-2 shadow"
                                    onClick={() => {
                                      setMostrarResposta(true);
                                      playSound(flipSound);
                                      // Atualiza o estado para mostrar a resposta com animação
                                      setTimeout(() => {
                                        const flipper = document.querySelector('.flipper');
                                        if (flipper) {
                                          flipper.classList.add('flipped');
                                        }
                                      }, 100);
                                    }}
                                  >
                                    <Sparkles size={18} className="me-2" /> Mostrar Resposta
                                  </Button>
                                </motion.div>
                              </div>
                            </Card.Body>
                          </Card>
                        </div>
                        
                        <div className="back">
                          <Card className="flashcard-estudo h-100 border-0">
                            <Card.Body>
                              <div className="resposta-container p-4 border rounded mb-4">
                                <motion.h4 
                                  className="text-center mb-3"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  Resposta:
                                </motion.h4>
                                <motion.p 
                                  className="text-center"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.5 }}
                                  style={{}}
                                >
                                  {cardAtual.resposta}
                                </motion.p>
                                <div className="d-flex justify-content-between mt-4">
                                  <Button 
                                    variant="outline-success" 
                                    size="sm"
                                    className="rounded-pill"
                                    onClick={iniciarEscutaResposta}
                                    disabled={escutandoResposta || !reconhecimentoVozAtivo}
                                  >
                                    <Mic size={16} className="me-1" /> 
                                    {escutandoResposta ? 'Escutando...' : 'Responder por voz'}
                                  </Button>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    className="rounded-pill"
                                    onClick={() => falarTexto(cardAtual.resposta)}
                                  >
                                    <Volume size={16} className="me-1" /> Ouvir
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="d-flex justify-content-center gap-3">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button 
                                    variant="danger" 
                                    className="px-4 py-2 rounded-pill shadow"
                                    onClick={() => {
                                      playSound(errorSound);
                                      registrarResultado(false);
                                    }}
                                  >
                                    <X size={18} className="me-2" /> Não Sabia
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button 
                                    variant="success"
                                    className="px-4 py-2 rounded-pill shadow"
                                    onClick={() => {
                                      playSound(successSound);
                                      registrarResultado(true);
                                    }}
                                  >
                                    <Check size={18} className="me-2" /> Sabia
                                  </Button>
                                </motion.div>
                              </div>
                            </Card.Body>
                          </Card>
                        </div>
                      </div>
                    </motion.div>
                  </Col>
                </Row>
              </div>
            ) : (
              <div className="text-center py-5">
                <h4 className="mb-3">Nenhum estudo em andamento</h4>
                <p className="text-muted mb-4">Selecione um modo de estudo para começar</p>
                <div>
                  <Button 
                    variant="success" 
                    className="me-3"
                    onClick={() => {
                      setModoEstudo('revisao');
                      iniciarEstudo();
                    }}
                    disabled={filtrarFlashcards().length === 0}
                  >
                    Iniciar Revisão
                  </Button>
                  <Button 
                    variant="warning"
                    onClick={() => {
                      setModoEstudo('desafio');
                      iniciarEstudo();
                    }}
                    disabled={filtrarFlashcards().length === 0}
                  >
                    Iniciar Desafio
                  </Button>
                </div>
              </div>
            )}
          </Tab>
          
          <Tab eventKey="estatisticas" title="Estatísticas">
            <Row className="mb-4">
              <Col>
                <Card>
                  <Card.Body>
                    <h4 className="mb-4">Estatísticas de Aprendizado</h4>
                    
                    <Row>
                      <Col md={6}>
                        <h5>Desempenho Geral</h5>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Taxa de Acerto</span>
                            <span>
                              {estatisticas.cardsRevisados > 0 
                                ? Math.round((estatisticas.acertos / estatisticas.cardsRevisados) * 100) 
                                : 0}%
                            </span>
                          </div>
                          <ProgressBar 
                            now={estatisticas.cardsRevisados > 0 
                              ? (estatisticas.acertos / estatisticas.cardsRevisados) * 100 
                              : 0} 
                            variant="success"
                          />
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Cards Revisados</span>
                            <span>{estatisticas.cardsRevisados} de {estatisticas.totalCards}</span>
                          </div>
                          <ProgressBar 
                            now={estatisticas.totalCards > 0 
                              ? (estatisticas.cardsRevisados / estatisticas.totalCards) * 100 
                              : 0}
                          />
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Tempo Médio de Resposta</span>
                            <span>{estatisticas.tempoMedioResposta.toFixed(1)}s</span>
                          </div>
                        </div>
                      </Col>
                      
                      <Col md={6}>
                        <h5>Distribuição por Dificuldade</h5>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Fácil</span>
                            <span>
                              {flashcards.filter(card => card.dificuldade === 'fácil').length} cards
                            </span>
                          </div>
                          <ProgressBar 
                            now={flashcards.length > 0 
                              ? (flashcards.filter(card => card.dificuldade === 'fácil').length / flashcards.length) * 100 
                              : 0} 
                            variant="success"
                          />
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Médio</span>
                            <span>
                              {flashcards.filter(card => card.dificuldade === 'médio').length} cards
                            </span>
                          </div>
                          <ProgressBar 
                            now={flashcards.length > 0 
                              ? (flashcards.filter(card => card.dificuldade === 'médio').length / flashcards.length) * 100 
                              : 0} 
                            variant="warning"
                          />
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Difícil</span>
                            <span>
                              {flashcards.filter(card => card.dificuldade === 'difícil').length} cards
                            </span>
                          </div>
                          <ProgressBar 
                            now={flashcards.length > 0 
                              ? (flashcards.filter(card => card.dificuldade === 'difícil').length / flashcards.length) * 100 
                              : 0} 
                            variant="danger"
                          />
                        </div>
                      </Col>
                    </Row>
                    
                    <h5 className="mt-4">Próximas Revisões</h5>
                    <div>
                      {flashcards.length > 0 ? (
                        <div>
                          <div className="d-flex justify-content-between mb-1">
                            <span>Hoje</span>
                            <span>
                              {flashcards.filter(card => card.proximaRevisao <= new Date()).length} cards
                            </span>
                          </div>
                          <ProgressBar 
                            now={flashcards.length > 0 
                              ? (flashcards.filter(card => card.proximaRevisao <= new Date()).length / flashcards.length) * 100 
                              : 0} 
                            variant="info"
                            className="mb-3"
                          />
                        </div>
                      ) : (
                        <p className="text-muted">Nenhum flashcard disponível para análise.</p>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>
        
        {/* Modal para adicionar novo flashcard */}
        <Modal show={showModalNovoCard} onHide={() => setShowModalNovoCard(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Novo Flashcard</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Pergunta</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3}
                  value={novoFlashcard.pergunta}
                  onChange={(e) => setNovoFlashcard(prev => ({ ...prev, pergunta: e.target.value }))}
                  placeholder="Digite a pergunta..."
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Resposta</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3}
                  value={novoFlashcard.resposta}
                  onChange={(e) => setNovoFlashcard(prev => ({ ...prev, resposta: e.target.value }))}
                  placeholder="Digite a resposta..."
                />
              </Form.Group>
              
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Categoria</Form.Label>
                    <Form.Select
                      value={novoFlashcard.categoria}
                      onChange={(e) => setNovoFlashcard(prev => ({ ...prev, categoria: e.target.value }))}
                    >
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Dificuldade</Form.Label>
                    <Form.Select
                      value={novoFlashcard.dificuldade}
                      onChange={(e) => setNovoFlashcard(prev => ({ ...prev, dificuldade: e.target.value as 'fácil' | 'médio' | 'difícil' }))}
                    >
                      <option value="fácil">Fácil</option>
                      <option value="médio">Médio</option>
                      <option value="difícil">Difícil</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalNovoCard(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={adicionarFlashcard}>
              Adicionar
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Modal para adicionar nova categoria */}
        <Modal show={showModalCategoria} onHide={() => setShowModalCategoria(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Gerenciar Categorias</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5>Categorias Existentes</h5>
            <div className="mb-4">
              {categorias.map(cat => (
                <Badge 
                  key={cat.id} 
                  style={{ backgroundColor: cat.cor }}
                  className="me-2 mb-2 p-2"
                >
                  {cat.nome}
                </Badge>
              ))}
            </div>
            
            <h5>Adicionar Nova Categoria</h5>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control 
                  type="text" 
                  value={novaCategoria.nome}
                  onChange={(e) => setNovaCategoria(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Digite o nome da categoria..."
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Cor</Form.Label>
                <Form.Control 
                  type="color" 
                  value={novaCategoria.cor}
                  onChange={(e) => setNovaCategoria(prev => ({ ...prev, cor: e.target.value }))}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalCategoria(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={adicionarCategoria}>
              Adicionar
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Modal para importar flashcards */}
        <Modal show={showModalImportar} onHide={() => setShowModalImportar(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Importar Flashcards</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Selecione um arquivo JSON exportado anteriormente:</p>
            <Form.Control 
              type="file" 
              accept=".json"
              onChange={importarFlashcards}
            />
            <small className="text-muted d-block mt-2">
              Nota: O arquivo deve estar no formato correto de exportação de flashcards.
            </small>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalImportar(false)}>
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Modal de personalização */}
        <Modal show={showModalPersonalizacao} onHide={() => setShowModalPersonalizacao(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Personalização de Flashcards</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Cor de fundo</Form.Label>
                <Form.Select
                  value={novoFlashcard.estilo?.fonte || 'Arial'}
                  onChange={(e) => setNovoFlashcard(prev => ({
                    ...prev,
                    estilo: { ...prev.estilo, fonte: e.target.value }
                  }))}
                >
                  <option value="Arial">Arial</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Tamanho da fonte</Form.Label>
                <Form.Range 
                  min={12} 
                  max={24} 
                  step={1}
                  value={novoFlashcard.estilo?.tamanhoFonte || 16}
                  onChange={(e) => setNovoFlashcard(prev => ({
                    ...prev,
                    estilo: { ...prev.estilo, tamanhoFonte: parseInt(e.target.value) }
                  }))}
                />
                <div className="d-flex justify-content-between">
                  <small>12px</small>
                  <small>{novoFlashcard.estilo?.tamanhoFonte || 16}px</small>
                  <small>24px</small>
                </div>
              </Form.Group>
              
              <div className="preview-card p-3 mb-3 rounded" style={{
                backgroundColor: novoFlashcard.estilo?.corFundo || '#ffffff',
                color: novoFlashcard.estilo?.corTexto || '#000000',
                fontFamily: novoFlashcard.estilo?.fonte || 'Arial',
                fontSize: `${novoFlashcard.estilo?.tamanhoFonte || 16}px`,
                border: '1px solid #dee2e6'
              }}>
                <h5 className="text-center">Prévia do Flashcard</h5>
                <p className="text-center">Este é um exemplo de como seus flashcards ficarão com esta personalização.</p>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalPersonalizacao(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                setPersonalizacaoAtiva(true);
                setShowModalPersonalizacao(false);
                toast.success('Personalização aplicada com sucesso!');
              }}
            >
              Aplicar
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Modal de conquistas */}
        <Modal show={showModalConquistas} onHide={() => setShowModalConquistas(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Suas Conquistas</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              {conquistas.map(conquista => (
                <Col md={4} key={conquista.id} className="mb-3">
                  <Card className={conquista.desbloqueada ? 'border-success' : 'border-secondary'}>
                    <Card.Body className="text-center">
                      <div className="mb-3">
                        {conquista.desbloqueada ? (
                          <Award size={48} className="text-success" />
                        ) : (
                          <Award size={48} className="text-secondary opacity-50" />
                        )}
                      </div>
                      <Card.Title>{conquista.nome}</Card.Title>
                      <Card.Text>{conquista.descricao}</Card.Text>
                      <Badge bg={conquista.desbloqueada ? 'success' : 'secondary'}>
                        {conquista.desbloqueada ? 'Desbloqueada' : 'Bloqueada'} • {conquista.pontos} pontos
                      </Badge>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            
            <div className="mt-3 text-center">
              <h5>Pontuação Total: {estatisticas.pontuacaoTotal} pontos</h5>
              <p>Nível {estatisticas.nivelUsuario}</p>
              <ProgressBar 
                now={(estatisticas.pontuacaoTotal % 100)} 
                label={`Nível ${estatisticas.nivelUsuario}`}
                variant="success"
              />
              <small className="text-muted">Próximo nível em {100 - (estatisticas.pontuacaoTotal % 100)} pontos</small>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalConquistas(false)}>
              Fechar
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Modal para gerar flashcards com IA */}
        <Modal show={showModalGerarAI} onHide={() => setShowModalGerarAI(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Gerar Flashcards com IA</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Tabs defaultActiveKey="texto" className="mb-3">
              <Tab eventKey="texto" title="A partir de Texto">
                <Form.Group className="mb-3">
                  <Form.Label>Cole seu texto aqui</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={6}
                    value={textoParaGerar}
                    onChange={(e) => setTextoParaGerar(e.target.value)}
                    placeholder="Cole aqui o texto para gerar flashcards..."
                  />
                </Form.Group>
              </Tab>
              
              <Tab eventKey="arquivo" title="A partir de Arquivo">
                <Form.Group className="mb-3">
                  <Form.Label>Selecione um arquivo</Form.Label>
                  <Form.Control 
                    type="file" 
                    accept=".txt,.pdf,.docx"
                    onChange={(e) => setArquivoParaGerar((e.target as HTMLInputElement).files?.[0] || null)}
                  />
                  <Form.Text className="text-muted">
                    Formatos suportados: TXT, PDF, DOCX
                  </Form.Text>
                </Form.Group>
              </Tab>
            </Tabs>
            
            <Button 
              variant="primary" 
              className="mt-3"
              onClick={gerarFlashcardsComIA}
            >
              Gerar Flashcards
            </Button>
            
            {cardsGerados.length > 0 && (
              <div className="mt-4">
                <h5>Flashcards Gerados ({cardsGerados.length})</h5>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {cardsGerados.map((card, index) => (
                    <Card key={index} className="mb-2">
                      <Card.Body>
                        <Card.Title>{card.pergunta}</Card.Title>
                        <Card.Text>{card.resposta}</Card.Text>
                        <div className="d-flex justify-content-between">
                          <Badge 
                            bg={card.dificuldade === 'fácil' ? 'success' : 
                               card.dificuldade === 'médio' ? 'warning' : 'danger'}
                          >
                            {card.dificuldade}
                          </Badge>
                          <Badge 
                            style={{ backgroundColor: getCorCategoria(card.categoria) }}
                          >
                            {card.categoria}
                          </Badge>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
                
                <div className="d-flex justify-content-end mt-3">
                  <Button 
                    variant="success"
                    onClick={adicionarFlashcardsGerados}
                  >
                    Adicionar Todos
                  </Button>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalGerarAI(false)}>
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Modal para editar flashcard */}
        <Modal 
          show={showModalEditarCard} 
          onHide={() => setShowModalEditarCard(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Editar Flashcard</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {flashcardEmEdicao && (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Pergunta</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={2}
                    value={flashcardEmEdicao.pergunta}
                    onChange={(e) => setFlashcardEmEdicao({
                      ...flashcardEmEdicao,
                      pergunta: e.target.value
                    })}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Resposta</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3}
                    value={flashcardEmEdicao.resposta}
                    onChange={(e) => setFlashcardEmEdicao({
                      ...flashcardEmEdicao,
                      resposta: e.target.value
                    })}
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Categoria</Form.Label>
                      <Form.Select
                        value={flashcardEmEdicao.categoria}
                        onChange={(e) => setFlashcardEmEdicao({
                          ...flashcardEmEdicao,
                          categoria: e.target.value
                        })}
                      >
                        {categorias.map((cat) => (
                          <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Dificuldade</Form.Label>
                      <Form.Select
                        value={flashcardEmEdicao.dificuldade}
                        onChange={(e) => setFlashcardEmEdicao({
                          ...flashcardEmEdicao,
                          dificuldade: e.target.value as 'fácil' | 'médio' | 'difícil'
                        })}
                      >
                        <option value="fácil">Fácil</option>
                        <option value="médio">Médio</option>
                        <option value="difícil">Difícil</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Tags (separadas por vírgula)</Form.Label>
                  <Form.Control 
                    type="text"
                    value={flashcardEmEdicao.tags.join(', ')}
                    onChange={(e) => setFlashcardEmEdicao({
                      ...flashcardEmEdicao,
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    })}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Notas adicionais</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={2}
                    value={flashcardEmEdicao.notas}
                    onChange={(e) => setFlashcardEmEdicao({
                      ...flashcardEmEdicao,
                      notas: e.target.value
                    })}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    label="Marcar como favorito"
                    checked={flashcardEmEdicao.favorito}
                    onChange={(e) => setFlashcardEmEdicao({
                      ...flashcardEmEdicao,
                      favorito: e.target.checked
                    })}
                  />
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  onClick={() => setShowModalPersonalizacao(true)}
                  className="mb-3"
                >
                  <Settings size={16} className="me-1" /> Personalizar Aparência
                </Button>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalEditarCard(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={salvarEdicaoFlashcard}>
              Salvar Alterações
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Modal de personalização */}
        <Modal show={showModalPersonalizacao} onHide={() => setShowModalPersonalizacao(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Personalizar Aparência</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {flashcardEmEdicao && (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Cor de fundo</Form.Label>
                  <Form.Control 
                    type="color"
                    value={flashcardEmEdicao.estilo?.corFundo || '#ffffff'}
                    onChange={(e) => setFlashcardEmEdicao({
                      ...flashcardEmEdicao,
                      estilo: {
                        ...flashcardEmEdicao.estilo,
                        corFundo: e.target.value
                      }
                    })}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Cor do texto</Form.Label>
                  <Form.Control 
                    type="color"
                    value={flashcardEmEdicao.estilo?.corTexto || '#000000'}
                    onChange={(e) => setFlashcardEmEdicao({
                      ...flashcardEmEdicao,
                      estilo: {
                        ...flashcardEmEdicao.estilo,
                        corTexto: e.target.value
                      }
                    })}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Fonte</Form.Label>
                  <Form.Select
                    value={flashcardEmEdicao.estilo?.fonte || 'inherit'}
                    onChange={(e) => setFlashcardEmEdicao({
                      ...flashcardEmEdicao,
                      estilo: {
                        ...flashcardEmEdicao.estilo,
                        fonte: e.target.value
                      }
                    })}
                  >
                    <option value="inherit">Padrão</option>
                    <option value="'Arial', sans-serif">Arial</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="'Courier New', monospace">Courier New</option>
                    <option value="'Georgia', serif">Georgia</option>
                    <option value="'Verdana', sans-serif">Verdana</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Tamanho da fonte</Form.Label>
                  <Form.Range
                    min={12}
                    max={28}
                    step={1}
                    value={flashcardEmEdicao.estilo?.tamanhoFonte || 16}
                    onChange={(e) => setFlashcardEmEdicao({
                      ...flashcardEmEdicao,
                      estilo: {
                        ...flashcardEmEdicao.estilo,
                        tamanhoFonte: parseInt(e.target.value)
                      }
                    })}
                  />
                  <div className="text-center">
                    {flashcardEmEdicao.estilo?.tamanhoFonte || 16}px
                  </div>
                </Form.Group>
                
                <div className="preview-container p-3 mb-3 border rounded">
                  <h5>Prévia</h5>
                  <div 
                    className="p-3 rounded"
                    style={{
                      backgroundColor: flashcardEmEdicao.estilo?.corFundo || '#ffffff',
                      color: flashcardEmEdicao.estilo?.corTexto || '#000000',
                      fontFamily: flashcardEmEdicao.estilo?.fonte || 'inherit',
                      fontSize: flashcardEmEdicao.estilo?.tamanhoFonte ? `${flashcardEmEdicao.estilo.tamanhoFonte}px` : 'inherit'
                    }}
                  >
                    <h4>{flashcardEmEdicao.pergunta}</h4>
                    <p>{flashcardEmEdicao.resposta}</p>
                  </div>
                </div>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalPersonalizacao(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                if (flashcardEmEdicao) {
                  setFlashcards(prev => prev.map(card => {
                    if (card.id === flashcardEmEdicao.id) {
                      return { ...card, estilo: flashcardEmEdicao.estilo };
                    }
                    return card;
                  }));
                  toast.success('Personalização aplicada com sucesso!');
                  setShowModalPersonalizacao(false);
                }
              }}
            >
              Aplicar
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </motion.div>   
  );
};

export default Flashcards;