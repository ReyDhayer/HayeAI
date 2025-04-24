import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Image, Sparkles, Loader2, Download, Camera, PlusCircle, Trash2, Heart, Share2, RefreshCw, MessageSquare, History, Menu, X, Settings, Zap } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar a API Gemini
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBJdcax0rOhfbjVpHlDKutHbezIFLN4DDQ';
const genAI = new GoogleGenerativeAI(API_KEY);

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
  const [imageHistory, setImageHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [activeHistoryTab, setActiveHistoryTab] = useState('prompts'); // 'prompts' ou 'images'
  const [showImageDetail, setShowImageDetail] = useState(false);
  const [detailImage, setDetailImage] = useState(null);
  const fadeIn = useFadeIn(100);
  
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 200], [1, 0.2]);
  const heroScale = useTransform(scrollY, [0, 200], [1, 0.95]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteImages');
    const savedHistory = localStorage.getItem('promptHistory');
    const savedImageHistory = localStorage.getItem('imageHistory');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    if (savedHistory) {
      setPromptHistory(JSON.parse(savedHistory));
    }
    
    if (savedImageHistory) {
      setImageHistory(JSON.parse(savedImageHistory));
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

  // Função para converter arquivo para base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Função para lidar com o upload de imagem
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      setUploadedImage(file);
      setImageBase64(base64.toString());
      toast.success('Imagem carregada com sucesso!', {
        icon: <Image className="text-blue-500" />,
        position: 'bottom-right',
      });
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      toast.error('Erro ao carregar imagem. Tente novamente.', {
        position: 'bottom-right',
      });
    }
  };
  
  // Função para gerar imagem com Gemini (conforme documentação oficial)
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor, insira um prompt para gerar a imagem.', {
        position: 'bottom-right',
      });
      return;
    }
    
    setLoading(true);
    
    // Adicionar ao histórico
    const newHistory = [prompt, ...promptHistory.slice(0, 9)];
    setPromptHistory(newHistory);
    localStorage.setItem('promptHistory', JSON.stringify(newHistory));
    
    try {
      // Preparar o prompt com base no estilo selecionado
      let stylePrompt = prompt;
      switch (selectedModel) {
        case 'realista':
          stylePrompt = `Photorealistic, high definition, detailed, 4K, high quality image: ${prompt}`;
          break;
        case 'artistico':
          stylePrompt = `Artistic style, digital painting, colorful, vibrant, detailed: ${prompt}`;
          break;
        case 'abstrato':
          stylePrompt = `Abstract art, geometric shapes, vibrant colors, modern: ${prompt}`;
          break;
        case 'anime':
          stylePrompt = `Anime style, Japanese drawing, colorful, detailed, anime illustration: ${prompt}`;
          break;
      }
      // Gemini Imagen 3 NÃO está disponível no browser/front-end.
      toast.error('A geração de imagens com Gemini Imagen 3 só está disponível via backend Node.js. Usando imagem de exemplo (fallback).', {
        position: 'bottom-right',
      });
      // Fallback para simulação de imagem em caso de erro
      const newImage = {
        id: Date.now(),
        url: `https://source.unsplash.com/random/${imageSize}/?${encodeURIComponent(prompt)}`,
        prompt: prompt,
        model: selectedModel + " (fallback)",
        created: new Date().toISOString()
      };
      setGeneratedImages([newImage, ...generatedImages]);
      setImageHistory([newImage, ...imageHistory]);
      localStorage.setItem('imageHistory', JSON.stringify([newImage, ...imageHistory]));
    } finally {
      setLoading(false);
    }
  };

  // Função para editar imagem com Gemini
  const handleEditImage = async () => {
    if (!imageBase64 || !editPrompt.trim()) {
      toast.error('Por favor, carregue uma imagem e insira instruções de edição.', {
        position: 'bottom-right',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Configurar o modelo Gemini para edição de imagens
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      // Extrair apenas a parte base64 da string
      const base64Data = imageBase64.split(',')[1];
      const mimeType = imageBase64.split(',')[0].split(':')[1].split(';')[0];
      
      console.log("Enviando imagem para edição com prompt:", editPrompt);
      console.log("Tipo MIME:", mimeType);
      
      // Tentar fazer uma requisição direta para a API Gemini usando fetch
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { 
                    inlineData: { 
                      mimeType: mimeType, 
                      data: base64Data 
                    } 
                  },
                  { text: `Edite esta imagem: ${editPrompt}. Responda APENAS com a imagem editada, sem texto.` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 32,
              topP: 1,
              maxOutputTokens: 4096,
              responseMimeType: "image/png"
            }
          })
        });
        
        const data = await response.json();
        console.log("Resposta da API direta (edição):", data);
        
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
          const parts = data.candidates[0].content.parts;
          const imagePart = parts.find(part => part.inlineData && part.inlineData.data);
          
          if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
            const imageData = imagePart.inlineData.data;
            
            // Criar objeto de imagem editada
            const newImage = {
              id: Date.now(),
              url: `data:${imagePart.inlineData.mimeType || mimeType};base64,${imageData}`,
              prompt: editPrompt,
              model: 'editado',
              created: new Date().toISOString()
            };
            
            setGeneratedImages([newImage, ...generatedImages]);
            setImageHistory([newImage, ...imageHistory]);
            localStorage.setItem('imageHistory', JSON.stringify([newImage, ...imageHistory]));
            setEditMode(false);
            setUploadedImage(null);
            setImageBase64('');
            setEditPrompt('');
            
            toast.success('Imagem editada com sucesso!', {
              icon: <Sparkles className="text-purple-500" />,
              position: 'bottom-right',
            });
            setLoading(false);
            return;
          }
        }
        
        // Se chegou aqui, não conseguiu extrair a imagem da resposta
        throw new Error('Não foi possível extrair a imagem da resposta');
      } catch (directApiError) {
        console.error('Erro na chamada direta da API (edição):', directApiError);
        
        // Tentar com a biblioteca padrão
        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                { 
                  inlineData: { 
                    mimeType: mimeType, 
                    data: base64Data 
                  } 
                },
                { text: `Edite esta imagem: ${editPrompt}. Responda APENAS com a imagem editada, sem texto.` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
          },
        });
        
        const response = result.response;
        console.log("Resposta completa da API (edição):", response);
        
        // Verificar se há dados de imagem na resposta
        if (response.candidates && response.candidates[0].content.parts) {
          const parts = response.candidates[0].content.parts;
          console.log("Partes da resposta (edição):", parts);
          
          // Procurar por dados de imagem em qualquer parte da resposta
          const imagePart = parts.find(part => part.inlineData && part.inlineData.data);
          
          if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
            // Extrair a imagem em base64
            const imageData = imagePart.inlineData.data;
            console.log("Dados de imagem editada encontrados:", imageData.substring(0, 50) + "...");
            
            // Criar objeto de imagem editada
            const newImage = {
              id: Date.now(),
              url: `data:${imagePart.inlineData.mimeType || mimeType};base64,${imageData}`,
              prompt: editPrompt,
              model: 'editado',
              created: new Date().toISOString()
            };
            
            setGeneratedImages([newImage, ...generatedImages]);
            setImageHistory([newImage, ...imageHistory]);
            localStorage.setItem('imageHistory', JSON.stringify([newImage, ...imageHistory]));
            setEditMode(false);
            setUploadedImage(null);
            setImageBase64('');
            setEditPrompt('');
            
            toast.success('Imagem editada com sucesso!', {
              icon: <Sparkles className="text-purple-500" />,
              position: 'bottom-right',
            });
            setLoading(false);
            return;
          }
        }
        
        // Se chegou aqui, não conseguiu extrair a imagem da resposta
        throw new Error('Não foi possível extrair a imagem da resposta');
      }
    } catch (error) {
      console.error('Erro ao editar imagem:', error);
      
      // Fallback para caso de erro na edição
      const newImage = {
        id: Date.now(),
        url: imageBase64,
        prompt: `${editPrompt} (erro - original mantida)`,
        model: 'editado (erro)',
        created: new Date().toISOString()
      };
      
      setGeneratedImages([newImage, ...generatedImages]);
      setImageHistory([newImage, ...imageHistory]);
      localStorage.setItem('imageHistory', JSON.stringify([newImage, ...imageHistory]));
      
      toast.warning('Erro ao editar imagem, mantendo original', {
        position: 'bottom-right',
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para deletar imagem
  const handleDeleteImage = (id) => {
    setGeneratedImages(generatedImages.filter(img => img.id !== id));
    setImageHistory(imageHistory.filter(img => img.id !== id));
    localStorage.setItem('imageHistory', JSON.stringify(imageHistory.filter(img => img.id !== id)));
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
        title: 'Imagem Gerada por IA - HayeAI',
        text: `Imagem criada com HayeAI: ${image.prompt}`,
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
    document.getElementById('prompt-input')?.focus();
  };
  
  const useImageFromHistory = (image) => {
    setImageBase64(image.url);
    setEditMode(true);
    setEditPrompt(`Modifique esta imagem de: ${image.prompt}`);
    setShowSidebar(false);
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
            className={`fixed top-0 left-0 h-full w-80 z-50 shadow-2xl ${
              darkMode ? 'bg-gradient-to-b from-indigo-950/90 to-purple-950/90 border-r border-white/10' : 'bg-white/90 border-r border-indigo-200/50'
            } backdrop-blur-xl p-6 overflow-y-auto`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-indigo-950'}`}>Menu</h3>
              <button 
                onClick={() => setShowSidebar(false)}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-white/10' : 'hover:bg-indigo-100'} transition-colors`}
              >
                <X size={20} className={darkMode ? 'text-white' : 'text-indigo-950'} />
              </button>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Settings className={`mr-2 ${darkMode ? 'text-purple-400' : 'text-indigo-600'}`} />
                <h4 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-indigo-950'}`}>Configurações</h4>
              </div>
              
             
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <History className={`mr-2 ${darkMode ? 'text-purple-400' : 'text-indigo-600'}`} />
                <h4 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-indigo-950'}`}>Histórico</h4>
              </div>
              
              <div className="flex gap-4 mb-4">
                <button 
                  onClick={() => setActiveHistoryTab('prompts')}
                  className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center justify-center w-full md:w-auto ${
                    activeHistoryTab === 'prompts' 
                      ? (darkMode ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-500/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20') 
                      : (darkMode ? 'bg-black/20 hover:bg-purple-500/20 border border-white/10' : 'bg-white/40 hover:bg-indigo-100/60 border border-indigo-200/50')
                  }`}
                >
                  Prompts
                </button>
                <button 
                  onClick={() => setActiveHistoryTab('images')}
                  className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center justify-center w-full md:w-auto ${
                    activeHistoryTab === 'images' 
                      ? (darkMode ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-500/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20') 
                      : (darkMode ? 'bg-black/20 hover:bg-purple-500/20 border border-white/10' : 'bg-white/40 hover:bg-indigo-100/60 border border-indigo-200/50')
                  }`}
                >
                  Imagens
                </button>
              </div>
              
              {activeHistoryTab === 'prompts' ? (
                <div>
                  {promptHistory.length > 0 ? (
                    <div className="space-y-2">
                      {promptHistory.map((historyPrompt, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            darkMode 
                              ? 'bg-black/20 hover:bg-purple-900/30 border border-white/10' 
                              : 'bg-white hover:bg-indigo-50 border border-indigo-100'
                          }`}
                          onClick={() => usePromptFromHistory(historyPrompt)}
                        >
                          <p className={`text-sm line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {historyPrompt}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Nenhum prompt no histórico ainda.
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  {imageHistory.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {imageHistory.map((image) => (
                        <motion.div 
                          key={image.id}
                          whileHover={{ scale: 1.05 }}
                          className="aspect-square rounded-lg overflow-hidden relative cursor-pointer"
                          onClick={() => {
                            setDetailImage(image);
                            setShowImageDetail(true);
                          }}
                        >
                          <img 
                            src={image.url} 
                            alt={image.prompt}
                            className="w-full h-full object-cover"
                          />
                          <div 
                            className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <div className="absolute bottom-2 right-2">
                              <Heart className={`text-white ${favorites.includes(image.id) ? 'fill-white' : ''}`} size={16} />
                            </div>
                            <div 
                              className="absolute bottom-2 left-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                useImageFromHistory(image);
                              }}
                            >
                              <RefreshCw className="text-white" size={16} />
                            </div>
                            <div 
                              className="absolute top-2 right-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailImage(image);
                                setShowImageDetail(true);
                              }}
                            >
                              <MessageSquare className="text-white" size={16} />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Nenhuma imagem no histórico ainda.
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center mb-4">
                <Heart className={`mr-2 ${darkMode ? 'text-purple-400' : 'text-indigo-600'}`} />
                <h4 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-indigo-950'}`}>Favoritos</h4>
              </div>
              
              {favorites.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {generatedImages
                    .filter(img => favorites.includes(img.id))
                    .map((image) => (
                      <motion.div 
                        key={image.id}
                        whileHover={{ scale: 1.05 }}
                        className="aspect-square rounded-lg overflow-hidden relative"
                      >
                        <img 
                          src={image.url} 
                          alt={image.prompt}
                          className="w-full h-full object-cover"
                        />
                        <div 
                          className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity"
                          onClick={() => handleToggleFavorite(image.id)}
                        >
                          <div className="absolute bottom-2 right-2">
                            <Heart className="text-white fill-white" size={16} />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Nenhuma imagem favorita ainda.
                </p>
              )}
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
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <motion.div 
          ref={heroRef}
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="text-center mb-12"
        >
          <motion.h1 
            className={`text-4xl md:text-6xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              HayeAI
            </span>
          </motion.h1>
          <motion.p 
            className={`text-xl md:text-2xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Transforme suas ideias em imagens incríveis com IA
          </motion.p>
          
          {/* Tabs para alternar entre geração e edição */}
          <motion.div 
            className="flex justify-center mb-8 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.button
              className={`px-6 py-3 rounded-full font-medium transition-all ${!editMode 
                ? (darkMode ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40') 
                : (darkMode ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-700 cursor-not-allowed')
              }`}
              onClick={() => setEditMode(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="inline-block mr-2 h-5 w-5" />
              Gerar Imagem
            </motion.button>
            <motion.button
              className={`px-6 py-3 rounded-full font-medium transition-all ${editMode 
                ? (darkMode ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40') 
                : (darkMode ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-700 cursor-not-allowed')
              }`}
              onClick={() => setEditMode(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image className="inline-block mr-2 h-5 w-5" />
              Editar Imagem
            </motion.button>
          </motion.div>
        </motion.div>
        
        {/* Modo de Geração de Imagem */}
        {!editMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className={`max-w-4xl mx-auto p-6 rounded-xl backdrop-blur-md ${
              darkMode ? 'bg-black/30 border border-white/10 shadow-xl' : 'bg-white/70 border border-gray-200 shadow-lg'
            }`}
          >
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Descreva a imagem que deseja criar
                  </label>
                  <div className="relative">
                    <textarea
                      id="prompt-input"
                      className={`w-full p-4 pr-12 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                      } focus:ring-2 focus:outline-none transition-all`}
                      placeholder="Ex: Um gato astronauta flutuando no espaço, estilo realista"
                      rows={3}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          e.preventDefault();
                          handleGenerate();
                        }
                      }}
                    />
                    <div className="absolute right-3 bottom-3 text-xs text-gray-500">
                      {prompt.length} caracteres
                    </div>
                  </div>
                  <div className="text-xs mt-1 text-gray-500">
                    Pressione Ctrl+Enter para gerar
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Estilo
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {models.map((model) => (
                      <motion.button
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center justify-center w-full md:w-auto ${
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
                
                <div>
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tamanho
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {imageSizes.map((size) => (
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
              </div>
              
              <motion.button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                whileHover={!loading && prompt.trim() ? { scale: 1.03 } : {}}
                whileTap={!loading && prompt.trim() ? { scale: 0.97 } : {}}
                className={`w-full py-3 px-6 rounded-lg flex items-center justify-center font-medium transition-all ${
                  !loading && prompt.trim()
                    ? (darkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40')
                    : (darkMode ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-700 cursor-not-allowed')
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Gerando imagem...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Gerar Imagem
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
        
        {/* Modo de Edição de Imagem */}
        {editMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className={`max-w-4xl mx-auto p-6 rounded-xl backdrop-blur-md ${
              darkMode ? 'bg-black/30 border border-white/10 shadow-xl' : 'bg-white/70 border border-gray-200 shadow-lg'
            }`}
          >
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-6 mb-4">
                <div className="flex-1">
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Carregue uma imagem para editar
                  </label>
                  
                  {!imageBase64 ? (
                    <div 
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                        darkMode 
                          ? 'border-gray-600 hover:border-purple-500 bg-gray-900/30' 
                          : 'border-gray-300 hover:border-indigo-500 bg-gray-100/50'
                      }`}
                      onClick={() => document.getElementById('image-upload').click()}
                    >
                      <input
                        type="file"
                        id="image-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <Image className={`mx-auto h-12 w-12 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Clique para selecionar ou arraste uma imagem
                      </p>
                      <p className="text-sm mt-2 text-gray-500">
                        PNG, JPG ou JPEG (max. 5MB)
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img 
                        src={imageBase64} 
                        alt="Imagem carregada" 
                        className="w-full h-auto rounded-lg object-contain max-h-64"
                      />
                      <button
                        onClick={() => {
                          setUploadedImage(null);
                          setImageBase64('');
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Instruções de edição
                  </label>
                  <textarea
                    className={`w-full p-4 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                    } focus:ring-2 focus:outline-none transition-all`}
                    placeholder="Ex: Adicione um chapéu vermelho, mude o fundo para uma praia"
                    rows={5}
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                  />
                </div>
              </div>
              
              <motion.button
                onClick={handleEditImage}
                disabled={loading || !imageBase64 || !editPrompt.trim()}
                whileHover={!loading && imageBase64 && editPrompt.trim() ? { scale: 1.03 } : {}}
                whileTap={!loading && imageBase64 && editPrompt.trim() ? { scale: 0.97 } : {}}
                className={`w-full py-3 px-6 rounded-lg flex items-center justify-center font-medium transition-all ${
                  !loading && imageBase64 && editPrompt.trim()
                    ? (darkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40')
                    : (darkMode ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-700 cursor-not-allowed')
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Editando imagem...
                  </>
                ) : (
                  <>
                    <Image className="mr-2 h-5 w-5" />
                    Editar Imagem
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
        
        {/* Galeria de imagens geradas */}
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
        
        {/* Modal para visualização detalhada de imagem */}
        <AnimatePresence>
          {showImageDetail && detailImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setShowImageDetail(false)}
            >
              <motion.div 
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.5 }}
                transition={{ duration: 0.3 }}
                className={`max-w-4xl w-full p-6 rounded-2xl ${darkMode ? 'bg-gray-900/90 text-white' : 'bg-white/90 text-gray-900'} backdrop-blur-lg shadow-2xl`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">{detailImage.prompt}</h3>
                  <button 
                    onClick={() => setShowImageDetail(false)}
                    className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <img 
                      src={detailImage.url} 
                      alt={detailImage.prompt}
                      className="w-full h-auto rounded-lg object-contain max-h-[60vh]"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold mb-2">Detalhes</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>Modelo:</strong> {detailImage.model}
                      </p>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>Criado em:</strong> {new Date(detailImage.created).toLocaleString()}
                      </p>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>Prompt:</strong> {detailImage.prompt}
                      </p>
                    </div>
                    
                    <div className="mt-auto space-y-3">
                      <button
                        onClick={() => {
                          setPrompt(detailImage.prompt);
                          setShowImageDetail(false);
                          setEditMode(false);
                          document.getElementById('prompt-input')?.focus();
                        }}
                        className={`w-full py-3 px-4 rounded-lg flex items-center justify-center ${
                          darkMode 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        } transition-colors`}
                      >
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Reutilizar Prompt
                      </button>
                      
                      <button
                        onClick={() => {
                          useImageFromHistory(detailImage);
                          setShowImageDetail(false);
                        }}
                        className={`w-full py-3 px-4 rounded-lg flex items-center justify-center ${
                          darkMode 
                            ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                            : 'bg-pink-600 hover:bg-pink-700 text-white'
                        } transition-colors`}
                      >
                        <Image className="mr-2 h-5 w-5" />
                        Editar Esta Imagem
                      </button>
                      
                      <button
                        onClick={() => {
                          handleToggleFavorite(detailImage.id);
                          setShowImageDetail(false);
                        }}
                        className={`w-full py-3 px-4 rounded-lg flex items-center justify-center ${
                          favorites.includes(detailImage.id)
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : (darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900')
                        } transition-colors`}
                      >
                        <Heart className="mr-2 h-5 w-5" fill={favorites.includes(detailImage.id) ? 'currentColor' : 'none'} />
                        {favorites.includes(detailImage.id) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                      </button>
                      
                      <button
                        onClick={() => window.open(detailImage.url, '_blank')}
                        className={`w-full py-3 px-4 rounded-lg flex items-center justify-center ${
                          darkMode 
                            ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                        } transition-colors`}
                      >
                        <Download className="mr-2 h-5 w-5" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
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
          2025 HayeAI - Transforme suas ideias em realidade.
        </motion.p>
      </footer>
    </div>
  );
};

export default AIImageGenerator;