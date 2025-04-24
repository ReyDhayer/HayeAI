import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PainelControle from './pages/PainelControle';
import { useMaintenanceContext } from './lib/context/MaintenanceContext';
import Login from './pages/Login';
import Index from './pages/Index';
import SingleFilePage from './pages/inicio';
import NotFound from './pages/NotFound';
import Flashcards from './pages/Flashcards';
import GestaoFinanceira from './pages/GestaoFinanceira';
import MonitorPrazos from './pages/MonitorPrazos';
import MindMap from './pages/MindMap';
import GeradorImagem from './pages/GeradorImagem';
import GeradorVideo from './pages/GeradorVideo';
import Jogos from './pages/Jogos';
import ConhecimentosGerais from './pages/ConhecimentosGerais';
import ConhecimentosGeraisPartida from './pages/ConhecimentosGeraisPartida';
import ConhecimentosGeraisRanking from './pages/ConhecimentosGeraisRanking';
import ConhecimentosGeraisParaEstudar from './pages/ConhecimentosGeraisParaEstudar';
import Enem from './pages/Enem';
import NarradorTextos from './pages/NarradorTextos';
import AnalisePlagio from './pages/AnalisePlagio';
import BibliotecaConteudo from './pages/BibliotecaConteudo';
import Idiomas from './pages/Idiomas';
import AprimoradorCodigo from './pages/AprimoradorCodigo';
import AssistentePesquisa from './pages/AssistentePesquisa';
import SimuladorDefesa from './pages/SimuladorDefesa';
import SimuladorRevisaoPares from './pages/SimuladorRevisaoPares';
import SimuladorDebate from './pages/SimuladorDebate';
import ResumoYoutube from './pages/ResumoYoutube';
import AssistenteEscrita from './pages/AssistenteEscrita';
import AnaliseArtigos from './pages/AnaliseArtigos';
import GeradorRedacoes from './pages/GeradorRedacoes';
import AnalisadorBibliografia from './pages/AnalisadorBibliografia';
import AssistenteMetodologia from './pages/AssistenteMetodologia';
import ExplicadorExercicios from './pages/ExplicadorExercicios';
import CorretorRedacoes from './pages/CorretorRedacoes';
import CorretorAvancado from './pages/CorretorAvancado';

import GlobalSettingsEffect from './components/GlobalSettingsEffect';


function App() {
  const { isAuthenticated, userRole } = useMaintenanceContext();

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };

  return (
    <>
      <GlobalSettingsEffect />
      <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/inicio" element={<SingleFilePage />} />
     
      <Route path="/monitor-prazos" element={<MonitorPrazos />} />
      <Route path="/mind-map" element={<MindMap />} />
      <Route path="/gerador-imagem" element={<GeradorImagem />} />
      <Route path="/gerador-video" element={<GeradorVideo />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/gestao-financeira" element={<GestaoFinanceira />} />
      <Route path="/flashcards" element={<Flashcards />} />
      <Route path="/jogos" element={<Jogos />} />
      <Route path="/jogos/conhecimentos-gerais" element={<ConhecimentosGerais />} />
      <Route path="/jogos/conhecimentos-gerais/partida" element={<ConhecimentosGeraisPartida />} />
      <Route path="/jogos/conhecimentos-gerais/ranking" element={<ConhecimentosGeraisRanking />} />
      <Route path="/jogos/conhecimentos-gerais/para-estudar" element={<ConhecimentosGeraisParaEstudar />} />
      <Route path="/narrador-textos" element={<NarradorTextos />} />
      <Route path="/enem" element={<Enem />} />
      <Route path="/analise-plagio" element={<AnalisePlagio />} />
      <Route path="/biblioteca-conteudo" element={<BibliotecaConteudo />} />
      <Route path="/idiomas" element={<Idiomas />} />
      <Route path="/aprimorador-codigo" element={<AprimoradorCodigo />} />
      <Route path="/assistente-pesquisa" element={<AssistentePesquisa />} />
      <Route path="/simulador-defesa" element={<SimuladorDefesa />} />
      <Route path="/simulador-revisao-pares" element={<SimuladorRevisaoPares />} />
      <Route path="/simulador-debate" element={<SimuladorDebate />} />
      <Route path="/resumo-youtube" element={<ResumoYoutube />} />
      <Route path="/assistente-escrita" element={<AssistenteEscrita />} />
      <Route path="/analise-artigos" element={<AnaliseArtigos />} />
      <Route path="/gerador-redacoes" element={<GeradorRedacoes />} />
      <Route path="/analisador-bibliografia" element={<AnalisadorBibliografia />} />
      <Route path="/assistente-metodologia" element={<AssistenteMetodologia />} />
      <Route path="/explicador-exercicios" element={<ExplicadorExercicios />} />
      <Route path="/corretor-redacoes" element={<CorretorRedacoes />} />
      <Route path="/corretor-avancado" element={<CorretorAvancado />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/painel-controle"
        element={
          <ProtectedRoute>
            <PainelControle />
          </ProtectedRoute>
        }
      />
    </Routes>
    </>
  );
}

export default App;
