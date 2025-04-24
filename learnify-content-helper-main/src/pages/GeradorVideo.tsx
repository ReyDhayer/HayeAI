import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Video, Sparkles, Loader2, Download, Camera, PlusCircle, Trash2, Heart, Share2, RefreshCw, Film, Menu, X, Settings, Clock, Maximize, Play, Pause, Volume2, VolumeX, MessageSquare, History, Zap } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';

const AIVideoGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState('cinemático');
  const [selectedDuration, setSelectedDuration] = useState('15');
  const [isHovered, setIsHovered] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [videoResolution, setVideoResolution] = useState('720p');
  const [promptHistory, setPromptHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [muted, setMuted] = useState(false);
  const fadeIn = useFadeIn(100);
  
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 200], [1, 0.2]);
  const heroScale = useTransform(scrollY, [0, 200], [1, 0.95]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteVideos');
    const savedHistory = localStorage.getItem('videoPromptHistory');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    if (savedHistory) {
      setPromptHistory(JSON.parse(savedHistory));
    }
    
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
    
    // Adicionar efeito de partículas
    initParticles();
  }, []);
  
  // Quando um vídeo termina de ser reproduzido
  const handleVideoEnded = (id) => {
    if (playingVideo === id) {
      setPlayingVideo(null);
    }
  };
  
  const initParticles = () => {
    // Código para inicializar partículas (seria implementado com uma biblioteca como particles.js)
    console.log("Partículas iniciadas");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const fadeInUp = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };
  
  const togglePlayVideo = (id) => {
    const videoElement = videoRefs.current[id];
    
    if (!videoElement) return;
    
    if (playingVideo === id) {
      videoElement.pause();
      setPlayingVideo(null);
    } else {
      // Pause any currently playing video
      if (playingVideo && videoRefs.current[playingVideo]) {
        videoRefs.current[playingVideo].pause();
      }
      
      videoElement.play();
      setPlayingVideo(id);
    }
  };
  
  const toggleMute = () => {
    setMuted(!muted);
    
    // Apply to all video refs
    Object.values(videoRefs.current).forEach(videoElement => {
      if (videoElement) {
        videoElement.muted = !muted;
      }
    });
  };
  
  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    
    // Adicionar ao histórico
    const newHistory = [prompt, ...promptHistory.slice(0, 9)];
    setPromptHistory(newHistory);
    localStorage.setItem('videoPromptHistory', JSON.stringify(newHistory));
    
    // Simulação de geração de vídeo (em produção, seria uma chamada de API)
    setTimeout(() => {
      // Mock de vídeos para demonstração - em produção, estes seriam gerados por uma API
      const mockVideos = [
        'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
        'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
        'https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4',
        'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
        'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
        'https://assets.mixkit.co/videos/preview/mixkit-woman-running-along-a-beach-at-sunset-1259-large.mp4',
        'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-water-of-a-lake-4196-large.mp4'
      ];
      
      // Escolha aleatória de um vídeo mock
      const randomVideoUrl = mockVideos[Math.floor(Math.random() * mockVideos.length)];
      
      const newVideo = {
        id: Date.now(),
        url: randomVideoUrl,
        prompt: prompt,
        style: selectedStyle,
        duration: selectedDuration,
        resolution: videoResolution,
        created: new Date().toISOString(),
        thumbnail: `https://picsum.photos/seed/${Date.now()}/640/360`
      };
      
      setGeneratedVideos([newVideo, ...generatedVideos]);
      setLoading(false);
      toast.success('Vídeo gerado com sucesso!', {
        icon: <Film className="text-purple-500" />,
        position: 'bottom-right',
      });
    }, 3000); // Um pouco mais de tempo para simular a geração de vídeo
  };
  
  const handleDeleteVideo = (id) => {
    setGeneratedVideos(generatedVideos.filter(video => video.id !== id));
    setFavorites(favorites.filter(favId => favId !== id));
    localStorage.setItem('favoriteVideos', JSON.stringify(favorites.filter(favId => favId !== id)));
    
    // Se o vídeo que está sendo excluído é o que está sendo reproduzido
    if (playingVideo === id) {
      setPlayingVideo(null);
    }
    
    toast.success('Vídeo removido com sucesso', {
      icon: <Trash2 className="text-red-500" />,
      position: 'bottom-right',
    });
  };

  const handleToggleFavorite = (id) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    
    setFavorites(newFavorites);
    localStorage.setItem('favoriteVideos', JSON.stringify(newFavorites));
    toast.success(
      favorites.includes(id) ? 'Removido dos favoritos' : 'Adicionado aos favoritos',
      {
        icon: <Heart className={favorites.includes(id) ? "text-gray-500" : "text-pink-500"} />,
        position: 'bottom-right',
      }
    );
  };

  const handleShare = async (video) => {
    try {
      await navigator.share({
        title: 'Vídeo Gerado por IA - HayeAI',
        text: `Vídeo criado com HayeAI: ${video.prompt}`,
        url: video.url
      });
      toast.success('Vídeo compartilhado com sucesso', {
        icon: <Share2 className="text-blue-500" />,
        position: 'bottom-right',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      // Fallback para copiar para a área de transferência
      navigator.clipboard.writeText(video.url);
      toast.success('Link copiado para a área de transferência', {
        position: 'bottom-right',
      });
    }
  };
  
  const usePromptFromHistory = (historyPrompt) => {
    setPrompt(historyPrompt);
    setShowSidebar(false);
    document.getElementById('prompt-input').focus();
  };
  
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };
  
  const videoStyles = [
    { id: 'cinemático', name: 'Cinemático', icon: <Film className="mr-2" /> },
    { id: 'animado', name: 'Animado', icon: <Zap className="mr-2" /> },
    { id: 'realista', name: 'Realista', icon: <Camera className="mr-2" /> },
    { id: 'retro', name: 'Retrô', icon: <Video className="mr-2" /> }
  ];
  
  const videoDurations = [
    { value: '5', label: '5 seg' },
    { value: '15', label: '15 seg' },
    { value: '30', label: '30 seg' },
    { value: '60', label: '1 min' }
  ];
  
  const videoResolutions = [
    { value: '480p', label: '480p' },
    { value: '720p', label: '720p' },
    { value: '1080p', label: '1080p' },
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden font-sans ${darkMode ? 'bg-gradient-radial from-indigo-900 via-purple-950 to-black animate-gradient-slow' : 'bg-gradient-radial from-indigo-100 via-purple-100 to-white'}`}>
      <Header />
      
      {/* Particles overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30 z-0" id="particles-js"></div>
      
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div 
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className={`fixed top-0 left-0 h-full w-72 z-50 ${darkMode ? 'bg-indigo-950/90' : 'bg-white/90'} backdrop-blur-xl shadow-xl border-r ${darkMode ? 'border-indigo-500/20' : 'border-indigo-200'}`}
          >
            <div className="p-4 flex justify-between items-center border-b border-indigo-500/20">
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-indigo-950'}`}>HayeAI</h2>
              <button 
                onClick={() => setShowSidebar(false)}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-indigo-800/50' : 'hover:bg-indigo-100'} transition-all`}
              >
                <X size={20} className={darkMode ? 'text-white' : 'text-indigo-950'} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-6">
                <h3 className={`text-sm uppercase tracking-wider mb-2 font-medium ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  <History size={16} className="inline mr-2" />
                  Histórico
                </h3>
                {promptHistory.length === 0 ? (
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nenhum histórico disponível</p>
                ) : (
                  <ul className="space-y-2">
                    {promptHistory.map((historyItem, index) => (
                      <li 
                        key={index}
                        onClick={() => usePromptFromHistory(historyItem)}
                        className={`p-2 rounded-lg text-sm truncate cursor-pointer ${darkMode ? 'hover:bg-indigo-800/50 text-gray-200' : 'hover:bg-indigo-100 text-gray-700'} transition-all`}
                      >
                        {historyItem}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="mb-6">
                <h3 className={`text-sm uppercase tracking-wider mb-2 font-medium ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  <Settings size={16} className="inline mr-2" />
                  Configurações
                </h3>
                <div className="space-y-3">
               
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Áudio</span>
                    <button 
                      onClick={toggleMute}
                      className={`w-12 h-6 rounded-full relative ${!muted ? 'bg-indigo-600' : 'bg-gray-300'} transition-all duration-300`}
                    >
                      <motion.div 
                        className="absolute top-1 w-4 h-4 rounded-full bg-white"
                        animate={{ left: !muted ? '1.75rem' : '0.25rem' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className={`text-sm uppercase tracking-wider mb-2 font-medium ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  <Film size={16} className="inline mr-2" />
                  Biblioteca
                </h3>
                <div className="space-y-2">
                  <div className={`p-2 rounded-lg cursor-pointer ${darkMode ? 'hover:bg-indigo-800/50 text-gray-200' : 'hover:bg-indigo-100 text-gray-700'} transition-all`}>
                    <span className="text-sm">Todos os vídeos ({generatedVideos.length})</span>
                  </div>
                  <div className={`p-2 rounded-lg cursor-pointer ${darkMode ? 'hover:bg-indigo-800/50 text-gray-200' : 'hover:bg-indigo-100 text-gray-700'} transition-all`}>
                    <span className="text-sm">Favoritos ({favorites.length})</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Toggle sidebar button */}
      <button 
        onClick={() => setShowSidebar(!showSidebar)}
        className={`fixed top-20 left-4 z-40 p-3 rounded-full shadow-lg ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-white hover:bg-gray-100'} transition-all duration-300 transform hover:scale-105`}
      >
        <Menu size={20} className={darkMode ? 'text-white' : 'text-indigo-950'} />
      </button>
      
      {/* Main content */}
      <main className={`container mx-auto px-4 py-8 ${fadeIn} relative z-10`}>
        <div className="max-w-6xl mx-auto">
          {/* Hero section */}
          <motion.div
            ref={heroRef}
            style={{ opacity: heroOpacity, scale: heroScale }}
            whileHover={{ scale: 1.02 }}
            className={`text-center mb-12 relative backdrop-blur-lg ${darkMode ? 'bg-black/10 border-white/10 shadow-purple-500/10' : 'bg-white/30 border-indigo-200/50 shadow-indigo-200/30'} rounded-3xl p-8 border shadow-xl`}>
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent ${darkMode ? 'bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800'} animate-gradient tracking-tight`}>
              Crie vídeos incríveis com IA
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} text-lg md:text-xl max-w-2xl mx-auto leading-relaxed`}>
              Transforme suas ideias em vídeos de alta qualidade com apenas uma descrição.
              Perfeito para redes sociais, apresentações e projetos criativos.
            </motion.p>
          </motion.div>
          
          {/* Generator section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className={`backdrop-blur-xl ${darkMode ? 'bg-black/40 border-white/10 hover:shadow-purple-500/30 hover:border-purple-500/40' : 'bg-white/60 border-indigo-200/50 hover:shadow-indigo-300/40 hover:border-indigo-400/40'} rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.15)] border mb-12 transition-all duration-500 transform hover:-translate-y-1`}>
            <h3 className={`text-2xl font-semibold mb-6 flex items-center ${darkMode ? 'text-white' : 'text-indigo-950'}`}>
              <Film className={`mr-2 ${darkMode ? 'text-purple-400' : 'text-indigo-600'}`} />
              Gerador de Vídeos
            </h3>
            
            {/* Style selector */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Escolha um estilo:</label>
              <div className="flex flex-wrap gap-3">
                {videoStyles.map(style => (
                  <motion.button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center ${
                      selectedStyle === style.id 
                        ? (darkMode ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-500/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20') 
                        : (darkMode ? 'bg-black/20 hover:bg-purple-500/20 border border-white/10' : 'bg-white/40 hover:bg-indigo-100/60 border border-indigo-200/50')
                    }`}
                  >
                    {style.icon}
                    {style.name}
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Duration selector */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Duração:</label>
              <div className="flex flex-wrap gap-3">
                {videoDurations.map(duration => (
                  <motion.button
                    key={duration.value}
                    onClick={() => setSelectedDuration(duration.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center ${
                      selectedDuration === duration.value 
                        ? (darkMode ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-500/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20') 
                        : (darkMode ? 'bg-black/20 hover:bg-purple-500/20 border border-white/10' : 'bg-white/40 hover:bg-indigo-100/60 border border-indigo-200/50')
                    }`}
                  >
                    <Clock className="mr-2" size={16} />
                    {duration.label}
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Resolution selector */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Resolução:</label>
              <div className="flex flex-wrap gap-3">
                {videoResolutions.map(resolution => (
                  <motion.button
                    key={resolution.value}
                    onClick={() => setVideoResolution(resolution.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 ${
                      videoResolution === resolution.value 
                        ? (darkMode ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-500/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20') 
                        : (darkMode ? 'bg-black/20 hover:bg-purple-500/20 border border-white/10' : 'bg-white/40 hover:bg-indigo-100/60 border border-indigo-200/50')
                    }`}
                  >
                    {resolution.label}
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Input section */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Descreva o vídeo que você deseja criar..."
                  className={`w-full p-4 md:p-8 transition-all duration-300 rounded-2xl border outline-none text-lg md:text-xl font-medium tracking-wide shadow-inner ${
                    darkMode 
                      ? 'bg-gradient-to-br from-black/80 to-indigo-900/60 backdrop-blur-lg border-indigo-400/30 focus:border-indigo-300/90 focus:ring-2 focus:ring-indigo-300/60 placeholder-white/60 text-white shadow-purple-500/10' 
                      : 'bg-white/80 backdrop-blur-lg border-indigo-300/50 focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/40 placeholder-gray-500/90 text-gray-800 shadow-indigo-200/30'
                  }`}
                  rows={3}
                  id="prompt-input"
                />
              </div>
              
              <div className="flex items-end">
                <motion.button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-4 md:px-10 md:py-5 rounded-2xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center w-full md:w-auto text-lg md:text-xl font-medium tracking-wide ${
                    darkMode 
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:shadow-xl hover:shadow-indigo-500/30 text-white' 
                      : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:shadow-xl hover:shadow-indigo-300/40 text-white'
                  } disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none disabled:hover:transform-none`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <Film className="mr-2" />
                  )}
                  {loading ? 'Gerando...' : 'Gerar Vídeo'}
                  {!loading && <ChevronRight className="ml-1" />}
                </motion.button>
              </div>
            </div>
          </motion.div>
          
          {/* Generated videos section */}
          <AnimatePresence>
            {generatedVideos.length > 0 && (
              <motion.div 
                className="mt-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className={`text-2xl font-semibold mb-6 flex items-center ${darkMode ? 'text-white' : 'text-indigo-950'}`}>
                  <Film className={`mr-2 ${darkMode ? 'text-purple-400' : 'text-indigo-600'}`} />
                  Vídeos Gerados
                </h3>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  {(showFavorites ? generatedVideos.filter(video => favorites.includes(video.id)) : generatedVideos).map((video) => (
                    <motion.div
                      key={video.id}
                      variants={fadeInUp}
                      className={`${
                        darkMode 
                          ? 'bg-gradient-to-br from-indigo-950/40 via-purple-950/40 to-black/50 border-indigo-500/30 hover:border-indigo-500/50 hover:shadow-indigo-500/30' 
                          : 'bg-white/70 border-indigo-200/50 hover:border-indigo-400/70 hover:shadow-indigo-300/30'
                      } backdrop-blur-lg rounded-2xl overflow-hidden group hover:shadow-2xl border transition-all duration-500 transform hover:-translate-y-2`}
                    >
                      <div className="relative aspect-video">
                        <video
                          ref={el => videoRefs.current[video.id] = el}
                          src={video.url}
                          className="w-full h-full object-cover"
                          poster={video.thumbnail}
                          muted={muted as boolean}
                          onEnded={() => handleVideoEnded(video.id)}
                          controls={false}
                        />
                        
                        {/* Video controls overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button
                            onClick={() => togglePlayVideo(video.id)}
                            className="p-4 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all transform hover:scale-110"
                          >
                            {playingVideo === video.id ? (
                              <Pause className="w-6 h-6 text-white" />
                            ) : (
                              <Play className="w-6 h-6 text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {video.prompt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleToggleFavorite(video.id)}
                              className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                            >
                              <Heart
                                className={`w-5 h-5 ${favorites.includes(video.id) ? 'fill-pink-500 text-pink-500' : darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                              />
                            </button>
                            <button
                              onClick={() => handleShare(video)}
                              className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                            >
                              <Share2 className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                            >
                              <Trash2 className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                            </button>
                          </div>
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {video.duration}s • {video.resolution}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AIVideoGenerator;