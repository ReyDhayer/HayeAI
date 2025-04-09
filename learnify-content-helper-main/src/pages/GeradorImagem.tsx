import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Image, Sparkles, Loader2, Download, Camera, PlusCircle, Trash2, Heart, Share2, RefreshCw, MessageSquare, History, Menu, X, Settings, Zap } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';

const AIImageGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [selectedModel, setSelectedModel] = useState('realista');
  const [isHovered, setIsHovered] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [imageSize, setImageSize] = useState('512x512');
  const [promptHistory, setPromptHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const fadeIn = useFadeIn(100);
  
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 200], [1, 0.2]);
  const heroScale = useTransform(scrollY, [0, 200], [1, 0.95]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteImages');
    const savedHistory = localStorage.getItem('promptHistory');
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
  
  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    
    // Adicionar ao histórico
    const newHistory = [prompt, ...promptHistory.slice(0, 9)];
    setPromptHistory(newHistory);
    localStorage.setItem('promptHistory', JSON.stringify(newHistory));
    
    // Simular o tempo de geração de imagem
    setTimeout(() => {
      // Em uma implementação real, aqui seria feita uma chamada para a API de geração de imagens
      const newImage = {
        id: Date.now(),
        url: `https://source.unsplash.com/random/${imageSize}/?${encodeURIComponent(prompt)}`,
        prompt: prompt,
        model: selectedModel,
        created: new Date().toISOString()
      };
      
      setGeneratedImages([newImage, ...generatedImages]);
      setLoading(false);
      toast.success('Imagem gerada com sucesso!', {
        icon: <Sparkles className="text-purple-500" />,
        position: 'bottom-right',
      });
    }, 2000);
  };
  
  const handleDeleteImage = (id) => {
    setGeneratedImages(generatedImages.filter(img => img.id !== id));
    setFavorites(favorites.filter(favId => favId !== id));
    localStorage.setItem('favoriteImages', JSON.stringify(favorites.filter(favId => favId !== id)));
    toast.success('Imagem removida com sucesso', {
      icon: <Trash2 className="text-red-500" />,
      position: 'bottom-right',
    });
  };

  const handleToggleFavorite = (id) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    
    setFavorites(newFavorites);
    localStorage.setItem('favoriteImages', JSON.stringify(newFavorites));
    toast.success(
      favorites.includes(id) ? 'Removido dos favoritos' : 'Adicionado aos favoritos',
      {
        icon: <Heart className={favorites.includes(id) ? "text-gray-500" : "text-pink-500"} />,
        position: 'bottom-right',
      }
    );
  };

  const handleShare = async (image) => {
    try {
      await navigator.share({
        title: 'Imagem Gerada por IA - ImaginAI',
        text: `Imagem criada com ImaginAI: ${image.prompt}`,
        url: image.url
      });
      toast.success('Imagem compartilhada com sucesso', {
        icon: <Share2 className="text-blue-500" />,
        position: 'bottom-right',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      // Fallback para copiar para a área de transferência
      navigator.clipboard.writeText(image.url);
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
  
  const models = [
    { id: 'realista', name: 'Realista', icon: <Camera className="mr-2" /> },
    { id: 'artistico', name: 'Artístico', icon: <Image className="mr-2" /> },
    { id: 'abstrato', name: 'Abstrato', icon: <Sparkles className="mr-2" /> },
    { id: 'anime', name: 'Anime', icon: <Zap className="mr-2" /> }
  ];
  
  const imageSizes = [
    { value: '256x256', label: '256×256' },
    { value: '512x512', label: '512×512' },
    { value: '1024x1024', label: '1024×1024' }
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
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-indigo-950'}`}>ImaginAI</h2>
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
                    <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Modo Escuro</span>
                    <button 
                      onClick={toggleDarkMode}
                      className={`w-12 h-6 rounded-full relative ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'} transition-all duration-300`}
                    >
                      <motion.div 
                        className="absolute top-1 w-4 h-4 rounded-full bg-white"
                        animate={{ left: darkMode ? '1.75rem' : '0.25rem' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      />
                    </button>
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
              Transforme suas ideias em imagens incríveis
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} text-lg md:text-xl max-w-2xl mx-auto leading-relaxed`}>
              Utilize o poder da Inteligência Artificial para criar imagens únicas em segundos,
              perfeitas para seus projetos criativos.
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
              <Camera className={`mr-2 ${darkMode ? 'text-purple-400' : 'text-indigo-600'}`} />
              Gerador de Imagens
            </h3>
            
            {/* Model selector */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Escolha um estilo:</label>
              <div className="flex flex-wrap gap-3">
                {models.map(model => (
                  <motion.button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center ${
                      selectedModel === model.id 
                        ? (darkMode ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-500/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20') 
                        : (darkMode ? 'bg-black/20 hover:bg-purple-500/20 border border-white/10' : 'bg-white/40 hover:bg-indigo-100/60 border border-indigo-200/50')
                    }`}
                  >
                    {model.icon}
                    {model.name}
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Image size selector */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Tamanho da imagem:</label>
              <div className="flex flex-wrap gap-3">
                {imageSizes.map(size => (
                  <motion.button
                    key={size.value}
                    onClick={() => setImageSize(size.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 ${
                      imageSize === size.value 
                        ? (darkMode ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-500/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20') 
                        : (darkMode ? 'bg-black/20 hover:bg-purple-500/20 border border-white/10' : 'bg-white/40 hover:bg-indigo-100/60 border border-indigo-200/50')
                    }`}
                  >
                    {size.label}
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
                  placeholder="Descreva a imagem que você deseja criar..."
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
                    <Sparkles className="mr-2" />
                  )}
                  {loading ? 'Gerando...' : 'Gerar Imagem'}
                  {!loading && <ChevronRight className="ml-1" />}
                </motion.button>
              </div>
            </div>
          </motion.div>
          
          {/* Generated images section */}
          <AnimatePresence>
            {generatedImages.length > 0 && (
              <motion.div 
                className="mt-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className={`text-2xl font-semibold mb-6 flex items-center ${darkMode ? 'text-white' : 'text-indigo-950'}`}>
                  <Image className={`mr-2 ${darkMode ? 'text-purple-400' : 'text-indigo-600'}`} />
                  Imagens Geradas
                </h3>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  {generatedImages.map((image) => (
                    <motion.div
                      key={image.id}
                      variants={fadeInUp}
                      className={`${
                        darkMode 
                          ? 'bg-gradient-to-br from-indigo-950/40 via-purple-950/40 to-black/50 border-indigo-500/30 hover:border-indigo-500/50 hover:shadow-indigo-500/30' 
                          : 'bg-white/70 border-indigo-200/50 hover:border-indigo-400/70 hover:shadow-indigo-300/30'
                      } backdrop-blur-lg rounded-2xl overflow-hidden group hover:shadow-2xl border transition-all duration-500 transform hover:-translate-y-2`}
                    >
                      <div className="relative aspect-square">
                        <img
                          src={image.url}
                          alt={image.prompt}
                          className="w-full h-full object-cover transition-all duration-700 filter"
                          onLoad={(e) => {
                            const imgElement = e.target as HTMLImageElement;
                            imgElement.style.opacity = '1';
                            imgElement.parentElement?.querySelector('.loading-overlay')?.classList.add('opacity-0');
                            setTimeout(() => {
                              imgElement.parentElement?.querySelector('.loading-overlay')?.remove();
                            }, 500);
                          }}
                          style={{ opacity: '0' }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 loading-overlay transition-opacity duration-500">
                          <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-purple-400' : 'text-indigo-500'}`} />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                            <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-white'} bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full`}>
                              {image.model}
                            </div>
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-900 hover:bg-white transition-all duration-300 shadow-lg"
                                onClick={() => window.open(image.url, '_blank')}
                              >
                                <Download size={20} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-2 backdrop-blur-sm rounded-full transition-all duration-300 shadow-lg ${favorites.includes(image.id) ? 'bg-pink-500 text-white' : 'bg-white/90 text-gray-900'}`}
                                onClick={() => handleToggleFavorite(image.id)}
                              >
                                <Heart size={20} fill={favorites.includes(image.id) ? 'currentColor' : 'none'} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-900 hover:bg-white transition-all duration-300 shadow-lg"
                                onClick={() => handleShare(image)}
                              >
                                <Share2 size={20} />
                              </motion.button>
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 bg-red-500/90 backdrop-blur-sm rounded-full text-white hover:bg-red-600 transition-all duration-300 shadow-lg"
                                onClick={() => handleDeleteImage(image.id)}
                              >
                                <Trash2 size={20} />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className={`text-sm line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{image.prompt}</p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(image.created).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  <motion.div 
                    variants={fadeInUp}
                    className={`${
                      darkMode 
                        ? 'border-2 border-dashed border-white/20 backdrop-blur-lg bg-black/30 hover:border-purple-500/70 hover:bg-black/40 hover:shadow-purple-500/20' 
                        : 'border-2 border-dashed border-indigo-200/60 backdrop-blur-lg bg-white/40 hover:border-indigo-400/70 hover:bg-white/60 hover:shadow-indigo-300/20'
                    } rounded-2xl flex items-center justify-center aspect-square cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl`}
                    onClick={() => document.getElementById('prompt-input').focus()}
                  >
                    <div className={`flex flex-col items-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <PlusCircle size={40} className="mb-2" />
                      <p>Gerar nova imagem</p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      {/* Footer */}
      <footer className={`p-10 text-center border-t backdrop-blur-sm font-light tracking-wide ${
        darkMode 
          ? 'text-indigo-300/70 border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 via-purple-950/20 to-black/30' 
          : 'text-indigo-800/70 border-indigo-200/30 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-white/50'
      }`}>
        <motion.p 
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          © 2025 ImaginAI - Transforme suas ideias em realidade.
        </motion.p>
      </footer>
    </div>
  );
};

export default AIImageGenerator;