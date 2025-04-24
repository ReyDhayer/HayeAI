import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Header from "@/components/Header";
import { toast } from "sonner";
import { ArrowLeft, Download, Share, Trash, Maximize, Minimize, Image, Link as LinkIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Install react-spring with: npm install react-spring
import { useSpring, animated } from "react-spring";
// Install babylonjs with: npm install babylonjs babylonjs-loaders
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
// Install framer-motion with: npm install framer-motion
import { motion, AnimatePresence } from "framer-motion";
// Import MindElixir
import MindElixir from 'mind-elixir';
import type { MindElixirInstance } from 'mind-elixir';
// Remove the problematic import
// import 'mind-elixir/dist/style.css';
import { Plus, Minus, Target } from 'lucide-react';

// Add this import at the top of your MindMap.tsx file
import '../styles/mind-elixir.css';
// Import jsPDF globally to ensure MindMapExporter works
import { jsPDF } from 'jspdf';
// Import MindMapExporter para exportação em PDF
import { MindMapExporter } from '@/components/MindMapExporter';

// Novo: estado para controlar se o MindElixir está pronto
import { useState as useReactState } from 'react';

interface MindMapNode {
  id: string;
  text: string;
  type: "main" | "history" | "data" | "context" | "date" | "important";
  children: MindMapNode[];
  imageUrl?: string;
  sourceUrl?: string;
}

interface MindMapHistoryItem {
  id: string;
  query: string;
  mindMapData: MindMapNode;
  timestamp: Date;
}

// Define NodeData interface since it's not exported from mind-elixir
interface NodeData {
  id: string;
  topic: string;
  tags?: string[];
  children?: NodeData[];
  hyperLink?: string;
  expanded?: boolean;
  data?: {
    imageUrl?: string;
    sourceUrl?: string;
    type?: string;
  };
}

// Add this interface to extend the MindElixirInstance type
interface ExtendedMindElixirInstance extends MindElixirInstance {
  enterFocusMode: () => void;
  quit: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  toCenter: () => void;
  scale: (scaleVal: number) => void;
  x: number;
  y: number;
}

const MindMap = () => {
  // Replace Next.js router with React Router hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  const [prompt, setPrompt] = useState<string>("");
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<MindMapHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["root"]));
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [imageModalNode, setImageModalNode] = useState<MindMapNode | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  // Add missing refs for MindElixir
  const mindMapRef = useRef<HTMLDivElement>(null);
  // Add this interface to extend the MindElixirInstance type
  const mindElixirInstanceRef = useRef<ExtendedMindElixirInstance | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("mindMapHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    
    // Get query from URL using URLSearchParams
    const searchParams = new URLSearchParams(location.search);
    const queryParam = searchParams.get('query');
    
    // If query is provided via URL, generate mind map
    if (queryParam) {
      setPrompt(queryParam);
      generateMindMap(queryParam);
    }
  }, [location]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("mindMapHistory", JSON.stringify(history));
  }, [history]);

  // Initialize Babylon.js scene when viewMode changes to 3D
  useEffect(() => {
    if (viewMode === "3d" && canvasRef.current && mindMapData) {
      // Initialize Babylon.js
      const canvas = canvasRef.current;
      const engine = new BABYLON.Engine(canvas, true);
      engineRef.current = engine;
      
      // Create scene
      const scene = new BABYLON.Scene(engine);
      sceneRef.current = scene;
      
      // Add camera
      const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0), scene);
      camera.attachControl(canvas, true);
      camera.wheelPrecision = 50;
      camera.lowerRadiusLimit = 5;
      camera.upperRadiusLimit = 30;
      
      // Add light
      const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
      light.intensity = 0.7;
      
      // Create 3D mind map
      create3DMindMap(scene, mindMapData);
      
      // Run render loop
      engine.runRenderLoop(() => {
        scene.render();
      });
      
      // Handle window resize
      window.addEventListener("resize", () => {
        engine.resize();
      });
      
      return () => {
        engine.dispose();
        window.removeEventListener("resize", () => {
          engine.resize();
        });
      };
    }
  }, [viewMode, mindMapData]);

  // Função para exportar o mapa mental como PDF
  const prepareMindMapForExport = async () => {
    if (!mindElixirInstanceRef.current) return;
    
    // Centralizar o mapa
    mindElixirInstanceRef.current.toCenter();
    
    // Ajustar o zoom para mostrar todo o conteúdo
    mindElixirInstanceRef.current.scale(0.8);
    
    // Aguardar a renderização
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Função para exportar o mapa mental como PDF

  // Remove exportToPDF function as it's now handled by MindMapExporter component

  // Função auxiliar para obter todos os IDs dos nós
  const getAllNodeIds = (node: MindMapNode | null): string[] => {
    if (!node) return [];
    const ids = [node.id];
    if (node.children) {
      node.children.forEach(child => {
        ids.push(...getAllNodeIds(child));
      });
    }
    return ids;
  };

  const create3DMindMap = (scene: BABYLON.Scene, node: MindMapNode, parentPosition?: BABYLON.Vector3, level = 0, index = 0) => {
      const typeColors = {
        main: new BABYLON.Color3(0.5, 0.3, 0.8),
        history: new BABYLON.Color3(0.3, 0.4, 0.8),
        data: new BABYLON.Color3(0.3, 0.8, 0.4),
        context: new BABYLON.Color3(0.8, 0.8, 0.3),
        date: new BABYLON.Color3(0.8, 0.3, 0.3),
        important: new BABYLON.Color3(0.8, 0.3, 0.8)
      };
      
      // Calculate position
      const position = parentPosition 
        ? new BABYLON.Vector3(
            parentPosition.x + (level === 0 ? 0 : 3), 
            parentPosition.y + (level === 0 ? 0 : index * 1.5 - (node.children.length * 0.75)), 
            parentPosition.z + (level === 0 ? 0 : 0)
          )
        : new BABYLON.Vector3(0, 0, 0);
      
      // Create sphere for node
      const sphere = BABYLON.MeshBuilder.CreateSphere(`node-${node.id}`, { diameter: level === 0 ? 1.5 : 1 }, scene);
      sphere.position = position;
      
      // Create material
      const material = new BABYLON.StandardMaterial(`material-${node.id}`, scene);
      material.diffuseColor = typeColors[node.type];
      material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      material.emissiveColor = typeColors[node.type].scale(0.3);
      sphere.material = material;
      
      // Add text
      const textPlane = BABYLON.MeshBuilder.CreatePlane(`text-${node.id}`, { width: 2, height: 0.5 }, scene);
      textPlane.position = new BABYLON.Vector3(position.x, position.y + 0.7, position.z);
      textPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
      
      const textTexture = new BABYLON.DynamicTexture(`texture-${node.id}`, { width: 256, height: 64 }, scene, true);
      const textContext = textTexture.getContext();
      textContext.clearRect(0, 0, 256, 64);
      textContext.font = "bold 24px Arial";
      textContext.fillStyle = "white";
      // Fix for textAlign property
      (textContext as any).textAlign = "center";
      textContext.fillText(node.text.substring(0, 20) + (node.text.length > 20 ? "..." : ""), 128, 40);
      textTexture.update();
      
      const textMaterial = new BABYLON.StandardMaterial(`textMaterial-${node.id}`, scene);
      textMaterial.diffuseTexture = textTexture;
      textMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
      textMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
      textMaterial.backFaceCulling = false;
      textPlane.material = textMaterial;
      
      // Add animation
      const animation = new BABYLON.Animation(
        `animation-${node.id}`,
        "scaling",
        30,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      );
      
      const keys = [];
      keys.push({ frame: 0, value: new BABYLON.Vector3(1, 1, 1) });
      keys.push({ frame: 15, value: new BABYLON.Vector3(1.1, 1.1, 1.1) });
      keys.push({ frame: 30, value: new BABYLON.Vector3(1, 1, 1) });
      animation.setKeys(keys);
      
      sphere.animations = [animation];
      scene.beginAnimation(sphere, 0, 30, true);
      
      // Add action manager for interactivity
      sphere.actionManager = new BABYLON.ActionManager(scene);
      sphere.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPointerOverTrigger,
          () => {
            sphere.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
            material.emissiveColor = typeColors[node.type].scale(0.5);
          }
        )
      );
      sphere.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPointerOutTrigger,
          () => {
            sphere.scaling = new BABYLON.Vector3(1, 1, 1);
            material.emissiveColor = typeColors[node.type].scale(0.3);
          }
        )
      );
      
      // Create connections to children
      if (node.children && node.children.length > 0) {
        node.children.forEach((child, childIndex) => {
          create3DMindMap(scene, child, position, level + 1, childIndex);
          
          // Create line connecting parent to child
          const childPosition = new BABYLON.Vector3(
            position.x + 3,
            position.y + childIndex * 1.5 - (node.children.length * 0.75),
            position.z
          );
          
          const lines = BABYLON.MeshBuilder.CreateLines(`line-${node.id}-${child.id}`, {
            points: [position, childPosition],
            updatable: true
          }, scene);
          
          lines.color = typeColors[node.type];
        });
      }
    };

    // Keep only one generateMindMap function
    // Update the generateMindMap function to request more detailed content
    const generateMindMap = async (text: string) => {
      try {
        setLoading(true);
        setError(null);
        
        const genAI = new GoogleGenerativeAI("AIzaSyBjrD1WtKKseislU-NuWpdU0o5qUziX5A0");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });
        
        const prompt = `Crie um mapa mental sobre ${text}. O mapa deve conter um tópico central, vários subtópicos e cada subnó deve ter pontos detalhados. Formate a resposta de maneira clara e hierárquica, usando listas para organização.
        
        Forneça o resultado em formato JSON com a seguinte estrutura:
        {
          "id": "root",
          "text": "${text}",
          "type": "main",
          "children": [
            {
              "id": "history1",
              "text": "Fato histórico 1 com texto mais detalhado e explicativo para melhor compreensão do tema",
              "type": "history",
              "children": [],
              "imageUrl": "URL de uma imagem relacionada de alta qualidade",
              "sourceUrl": "URL da fonte da informação"
            },
            {
              "id": "data1",
              "text": "Dado importante 1 com explicação detalhada e contexto para facilitar o entendimento",
              "type": "data",
              "children": [],
              "imageUrl": "URL de uma imagem relacionada de alta qualidade",
              "sourceUrl": "URL da fonte da informação"
            }
          ]
        }
        
        Crie pelo menos 5 ramificações principais, cada uma com pelo menos 3-5 sub-ramificações. 
        Inclua informações detalhadas sobre:
        1. História e origem - com datas, eventos importantes e contexto histórico
        2. Dados e estatísticas relevantes - com números, percentuais e comparações
        3. Contexto social/político/científico - com análises e implicações
        4. Datas importantes - com explicação do significado de cada evento
        5. Informações cruciais - com detalhes que mostram a importância do tema
        
        Para cada nó, inclua:
        - Um ID único
        - Um texto descritivo detalhado (pelo menos 2-3 frases completas)
        - O tipo apropriado
        - Uma URL de imagem relacionada de alta qualidade (use imagens de domínio público ou Creative Commons)
        - Uma URL da fonte da informação confiável
        
        Forneça APENAS o JSON válido sem explicações adicionais.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        try {
          // Extract JSON from response
          const jsonMatch = response.text().match(/```json\n([\s\S]*?)\n```/) || 
                            response.text().match(/```\n([\s\S]*?)\n```/) || 
                            [null, response.text()];
          
          const jsonString = jsonMatch[1] || response.text();
          const parsedData = JSON.parse(jsonString);
          
          setMindMapData(parsedData);
          setExpandedNodes(new Set(["root"]));
          
          // Add to history
          const newHistoryItem: MindMapHistoryItem = {
            id: uuidv4(),
            query: text,
            mindMapData: parsedData,
            timestamp: new Date(),
          };
          
          setHistory(prev => [newHistoryItem, ...prev]);
          toast.success("Mapa mental gerado com sucesso!");
        } catch (jsonError) {
          console.error("Erro ao processar JSON:", jsonError);
          setError("Erro ao processar a resposta. Tente novamente.");
        }
      } catch (error) {
        console.error("Erro:", error);
        setError(error instanceof Error ? error.message : "Erro ao gerar mapa mental");
        toast.error("Erro ao gerar mapa mental.");
      } finally {
        setLoading(false);
      }
    };

    // Update the renderMindMapNode function to handle larger texts
    const renderMindMapNode = (node: MindMapNode, level: number = 0) => {
    // Adicionar botão de exportar PDF no nó raiz
    if (level === 0) {
      return (
        <div key={node.id} className="mind-map-container">
          <div className="flex justify-end mb-4">
            <MindMapExporter mindMapData={mindMapData} />
          </div>
          {renderMindMapNode(node, level + 1)}
        </div>
      );
    }

      // Check if node is valid to prevent errors
      if (!node || typeof node !== 'object') {
        console.error('Invalid node data:', node);
        return null;
      }
      
      const typeColors = {
        main: "bg-gradient-to-r from-purple-600 to-indigo-600",
        history: "bg-gradient-to-r from-blue-600 to-blue-400",
        data: "bg-gradient-to-r from-green-600 to-green-400",
        context: "bg-gradient-to-r from-yellow-600 to-yellow-400",
        date: "bg-gradient-to-r from-red-600 to-red-400",
        important: "bg-gradient-to-r from-pink-600 to-pink-400"
      };
      
      const typeIcons = {
        main: "🧠",
        history: "📜",
        data: "📊",
        context: "🌍",
        date: "📅",
        important: "⭐"
      };
      
      // Ensure node.type is valid
      const nodeType = node.type && typeColors[node.type] ? node.type : "main";
      
      const marginLeft = level * 40;
      const width = level === 0 ? "w-full" : level === 1 ? "w-[90%]" : "w-[85%]";
      const isExpanded = expandedNodes.has(node.id);
      
      // Determine if text should be truncated in the initial view
      const [isTextExpanded, setIsTextExpanded] = useState(false);
      const shouldTruncate = node.text.length > 100;
      const displayText = shouldTruncate && !isTextExpanded 
        ? node.text.substring(0, 100) + "..." 
        : node.text;
      
      try {
        return (
          <div 
            key={node.id} 
            className="mind-map-node" 
            style={{ marginLeft: `${marginLeft}px` }}
          >
            <div 
              className={`${width} p-4 my-3 rounded-xl ${typeColors[nodeType]} text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]`}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{typeIcons[nodeType]}</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">{displayText}</span>
                    {shouldTruncate && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsTextExpanded(!isTextExpanded);
                        }}
                        className="text-xs text-white/80 hover:text-white underline mt-1 text-left"
                      >
                        {isTextExpanded ? "Mostrar menos" : "Mostrar mais"}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {node.imageUrl && (
                    <button 
                      className="p-1 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageModalNode(node);
                      }}
                      title="Ver imagem"
                    >
                      <Image size={16} />
                    </button>
                  )}
                  {node.sourceUrl && (
                    <a 
                      href={node.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                      title="Ver fonte"
                    >
                      <LinkIcon size={16} />
                    </a>
                  )}
                  {node.children && node.children.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedNodes(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(node.id)) {
                            newSet.delete(node.id);
                          } else {
                            newSet.add(node.id);
                          }
                          return newSet;
                        });
                      }}
                      className="text-xs bg-white/20 px-2 py-1 rounded-full hover:bg-white/30 transition-colors"
                    >
                      {isExpanded ? "−" : "+"} {node.children.length}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Preview image if available */}
              {node.imageUrl && level === 0 && (
                <div className="mt-3 flex justify-center">
                  <img 
                    src={node.imageUrl} 
                    alt={node.text}
                    className="max-h-[150px] rounded-lg object-contain cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageModalNode(node);
                    }}
                  />
                </div>
              )}
            </div>
            
            {isExpanded && node.children && Array.isArray(node.children) && node.children.length > 0 && (
              <div className="mind-map-children ml-6 pl-4 border-l-2 border-gray-300">
                {node.children.map((child, index) => (
                  <React.Fragment key={child.id || `child-${index}`}>
                    {renderMindMapNode(child, level + 1)}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        );
      } catch (error) {
        console.error('Error rendering mind map node:', error, node);
        return (
          <div className="p-4 my-3 bg-red-100 text-red-700 rounded-xl">
            Error rendering node: {node.text || 'Unknown node'}
          </div>
        );
      }
    };

    // Novo: estado para controlar se o MindElixir está pronto
    const [isMindElixirReady, setIsMindElixirReady] = useReactState(false);

    // Update the useEffect to initialize MindElixir with better text handling
    useEffect(() => {
      setIsMindElixirReady(false);
      if (viewMode === "2d" && mindMapData && mindMapRef.current) {
        // Clear previous instance if exists
        if (mindElixirInstanceRef.current) {
          mindElixirInstanceRef.current.destroy();
        }
        
        mindMapRef.current.innerHTML = '';
        
        // Convert our data format to MindElixir format
        const elixirData = convertToMindElixirFormat(mindMapData);
        
        // Initialize MindElixir with proper data format
        const options = {
          el: mindMapRef.current,
          direction: 2, // Horizontal (LR)
          data: {
            nodeData: elixirData, // Wrap in nodeData property to match MindElixirData
            linkData: {} // Required by MindElixirData
          },
          draggable: true,
          contextMenu: true,
          toolBar: true,
          nodeMenu: true,
          keypress: true,
          allowUndo: true,
          locale: 'en' as any,
          theme: {
            name: 'default', // Add required theme properties
            palette: {},
            cssVar: {},
            primary: '#4361ee',
            secondary: '#7209b7',
            success: '#2a9d8f',
            warning: '#e9c46a',
            error: '#e63946',
            info: '#4895ef'
          } as any,
          // Add custom options for better text handling
          overflowHidden: false, // Allow text to overflow
          maxTextWidth: 300, // Set maximum text width
          textAutoWrapWidth: 300, // Auto wrap text at this width
          allowCollapse: true, // Allow nodes to be collapsed
        };
        
        const mindElixir = new MindElixir(options);
        // Fix: Pass the data to init method
        mindElixir.init(options.data);
        
        // Apply custom styles based on node types
        mindElixir.bus.addListener('operation', (operation) => {
          if (operation.name === 'finishEdit') {
            applyNodeStyles(mindElixir);
          }
        });
        
        // Apply styles initially
        applyNodeStyles(mindElixir);
        
        // Save reference with type assertion to fix the type error
        mindElixirInstanceRef.current = mindElixir as unknown as ExtendedMindElixirInstance;
        setIsMindElixirReady(true); // Agora está pronto!
      }
    }, [mindMapData, viewMode]);
    
    // Function to apply custom styles to nodes based on their type
    const applyNodeStyles = (mindElixir: MindElixirInstance) => {
      const root = mindElixir.nodeData;
      // Use a different approach to get all nodes since getAllDataWithChildren doesn't exist
      const getAllNodes = (node: any): any[] => {
        let nodes = [node];
        if (node.children) {
          node.children.forEach((child: any) => {
            nodes = [...nodes, ...getAllNodes(child)];
          });
        }
        return nodes;
      };
      
      const allNodes = getAllNodes(root);
      
      allNodes.forEach(node => {
        const el = document.querySelector(`[data-nodeid="${node.id}"]`);
        if (el) {
          // Remove previous type classes
          el.classList.remove('node-main', 'node-history', 'node-data', 'node-context', 'node-date', 'node-important');
          
          // Add type class
          if (node.tags && node.tags.includes('type')) {
            const typeTag = node.tags.find(tag => tag.startsWith('type:'));
            if (typeTag) {
              const type = typeTag.split(':')[1];
              el.classList.add(`node-${type}`);
              
              // Apply background gradient based on type
              const background = getNodeBackground(type);
              (el as HTMLElement).style.background = background;
              (el as HTMLElement).style.color = '#fff';
            }
          }
        }
      });
    };
    
    // Função para converter dados do formato MindMapNode para o formato MindElixir
    const convertToMindElixirFormat = (node: MindMapNode): NodeData => {
      return {
        id: node.id,
        topic: node.text,
        tags: [`type:${node.type}`],
        children: node.children.map(child => convertToMindElixirFormat(child)),
        hyperLink: node.sourceUrl || '',
        expanded: true,
        data: {
          imageUrl: node.imageUrl,
          sourceUrl: node.sourceUrl,
          type: node.type
        }
      };
    };

    // Função para exportar o mapa mental em diferentes formatos
    const exportMindMap = (format: 'json' | 'png' | 'svg') => {
      if (!mindMapData) return;

      switch (format) {
        case 'json':
          const dataStr = JSON.stringify(mindMapData, null, 2);
          const blob = new Blob([dataStr], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `mindmap-${prompt.toLowerCase().replace(/\s+/g, '-')}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          toast.success('Mapa mental exportado em JSON!');
          break;

        case 'png':
        case 'svg':
          if (mindElixirInstanceRef.current) {
            const element = mindMapRef.current;
            if (!element) return;

            html2canvas(element).then(canvas => {
              const imgData = canvas.toDataURL(`image/${format}`);
              const link = document.createElement('a');
              link.href = imgData;
              link.download = `mindmap-${prompt.toLowerCase().replace(/\s+/g, '-')}.${format}`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast.success(`Mapa mental exportado em ${format.toUpperCase()}!`);
            });
          }
          break;
      }
    };

    // Função para compartilhar o mapa mental
    const shareMindMap = async () => {
      if (!mindMapData) return;

      try {
        const shareData = {
          title: `Mapa Mental: ${prompt}`,
          text: `Confira este mapa mental sobre ${prompt}`,
          url: window.location.href
        };

        if (navigator.share) {
          await navigator.share(shareData);
          toast.success('Mapa mental compartilhado com sucesso!');
        } else {
          // Fallback para copiar URL
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Link copiado para a área de transferência!');
        }
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
        toast.error('Erro ao compartilhar o mapa mental');
      }
    };
    
    // Update the getNodeBackground function to match the MindElixir styling
    const getNodeBackground = (type: string) => {
      const backgrounds = {
        main: 'linear-gradient(to right, #7209b7, #4361ee)',
        history: 'linear-gradient(to right, #3a86ff, #4895ef)',
        data: 'linear-gradient(to right, #2a9d8f, #4cc9f0)',
        context: 'linear-gradient(to right, #e9c46a, #f4a261)',
        date: 'linear-gradient(to right, #e63946, #f72585)',
        important: 'linear-gradient(to right, #9d4edd, #c77dff)'
      };
      
      return backgrounds[type] || backgrounds.main;
    };

    // Add enhanced CSS for MindElixir node styling
    useEffect(() => {
      const style = document.createElement('style');
      style.textContent = `
    

        .mind-map-container {
          height: 700px;
          width: 100%;
          position: relative;
        }
        
        .node-main .content {
          background: linear-gradient(to right, #7209b7, #4361ee) !important;
          color: white !important;
          padding: 10px 15px !important;
          border-radius: 8px !important;
          max-width: 300px !important;
          word-wrap: break-word !important;
        }
        
        .node-history .content {
          background: linear-gradient(to right, #3a86ff, #4895ef) !important;
          color: white !important;
          padding: 8px 12px !important;
          border-radius: 8px !important;
          max-width: 280px !important;
          word-wrap: break-word !important;
        }
        
        .node-data .content {
          background: linear-gradient(to right, #2a9d8f, #4cc9f0) !important;
          color: white !important;
          padding: 8px 12px !important;
          border-radius: 8px !important;
          max-width: 280px !important;
          word-wrap: break-word !important;
        }
        
        .node-context .content {
          background: linear-gradient(to right, #e9c46a, #f4a261) !important;
          color: white !important;
          padding: 8px 12px !important;
          border-radius: 8px !important;
          max-width: 280px !important;
          word-wrap: break-word !important;
        }
        
        .node-date .content {
          background: linear-gradient(to right, #e63946, #f72585) !important;
          color: white !important;
          padding: 8px 12px !important;
          border-radius: 8px !important;
          max-width: 280px !important;
          word-wrap: break-word !important;
        }
        
        .node-important .content {
          background: linear-gradient(to right, #9d4edd, #c77dff) !important;
          color: white !important;
          padding: 8px 12px !important;
          border-radius: 8px !important;
          max-width: 280px !important;
          word-wrap: break-word !important;
        }
        
        .mind-elixir .tooltip {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          font-size: 12px;
        }
        
        /* Add styles for image thumbnails in nodes */
        .mind-elixir .node-image-thumbnail {
          max-width: 60px;
          max-height: 40px;
          margin-top: 5px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        /* Improve text readability */
        .mind-elixir .content {
          font-size: 14px !important;
          line-height: 1.4 !important;
        }
        
        /* Add hover effects */
        .mind-elixir .content:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }, []);

    // In the return statement, update the 2D view rendering
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors transform hover:scale-105"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Voltar</span>
          </button>
            
            
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-3/4">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/50 mb-8 transform transition-all hover:shadow-2xl">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  generateMindMap(prompt);
                }} className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                      Digite um tema para gerar o mapa mental
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Ex: Revolução Industrial, Inteligência Artificial, Mitologia Grega..."
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                      >
                        {loading ? "Gerando..." : "Gerar Mapa Mental"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              
              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg animate-pulse">
                  <p>{error}</p>
                </div>
              )}
              
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/50 min-h-[500px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-[500px]">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Gerando mapa mental...</p>
                  </div>
                ) : mindMapData ? (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Mapa Mental: {prompt}</h2>
                      <div className="flex gap-2">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => exportMindMap('json')}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors transform hover:scale-105"
                            title="Exportar como JSON"
                          >
                            <Download size={20} />
                          </button>
                         
                          <MindMapExporter mindMapData={mindMapData} />
                        </div>
                      </div>
                    </div>
                    
                    {viewMode === "2d" ? (
                      <div>
                        <div className="flex gap-2 mt-4 mb-2">
                         
                         
                          <button 
                            onClick={() => {
                              if (mindMapRef.current) {
                                if (document.fullscreenElement === mindMapRef.current) {
                                  document.exitFullscreen();
                                } else {
                                  mindMapRef.current.requestFullscreen();
                                }
                              }
                            }}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors transform hover:scale-105"
                            title={document.fullscreenElement === mindMapRef.current ? "Sair do modo tela cheia" : "Tela cheia"}
                          >
                            {document.fullscreenElement === mindMapRef.current ? <Minimize size={16} /> : <Maximize size={16} />}
                          </button>
                  
                          
                          <button 
                            onClick={() => {
                              if (mindElixirInstanceRef.current) {
                                mindElixirInstanceRef.current.toCenter();
                              }
                            }}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors transform hover:scale-105"
                            title="Centralizar"
                          >
                            <Target size={16} />
                          </button>
                        </div>
                        <div 
                          ref={mindMapRef} 
                          className="mind-map-container h-[600px] w-full rounded-xl overflow-hidden"
                        />
                      </div>
                    ) : (
                      <div className="h-[600px] w-full">
                        <canvas ref={canvasRef} className="w-full h-full rounded-xl" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[500px] text-center">
                    <div className="text-6xl mb-4 animate-bounce">🧠</div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">Crie seu Mapa Mental</h3>
                    <p className="text-gray-600 max-w-md">
                      Digite um tema acima e clique em "Gerar Mapa Mental" para visualizar um mapa mental completo com ramificações, histórias, dados e contextos.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-full lg:w-1/4">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/50 transform transition-all hover:shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Histórico</h2>
                  {history.length > 0 && (
                    <button
                      onClick={() => {
                        setHistory([]);
                        localStorage.removeItem("mindMapHistory");
                        toast.success("Histórico limpo com sucesso!");
                      }}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Limpar histórico"
                      >
                      <Trash size={18} />
                    </button>
                  )}
                </div>
                
                {history.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhum mapa mental gerado ainda.</p>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-auto pr-2">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setMindMapData(item.mindMapData);
                          setPrompt(item.query);
                          setExpandedNodes(new Set(["root"]));
                          toast.success("Mapa mental carregado do histórico!");
                        }}
                        className="p-3 bg-white rounded-xl shadow hover:shadow-md cursor-pointer transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-gray-800 line-clamp-2">{item.query}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newHistory = history.filter(h => h.id !== item.id);
                              setHistory(newHistory);
                              localStorage.setItem("mindMapHistory", JSON.stringify(newHistory));
                              toast.success("Item removido do histórico!");
                            }}
                            className="text-red-500 hover:text-red-700 p-1 transform hover:scale-110"
                            title="Remover do histórico"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div> {/* Add this closing tag for the flex container */}
        </main>
        
        {/* Enhanced Image Modal */}
        {imageModalNode && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setImageModalNode(null)}
          >
            <div 
              className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{imageModalNode.text}</h3>
                <button 
                  onClick={() => setImageModalNode(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Fechar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              {imageModalNode.imageUrl ? (
                <div className="flex flex-col items-center">
                  <img 
                    src={imageModalNode.imageUrl} 
                    alt={imageModalNode.text}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  />
                  {imageModalNode.sourceUrl && (
                    <div className="mt-4 text-center">
                      <a 
                        href={imageModalNode.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-2"
                      >
                        <LinkIcon size={16} />
                        <span>Fonte da imagem</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Nenhuma imagem disponível para este nó.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // At the end of your MindMap.tsx file
  export default MindMap;
