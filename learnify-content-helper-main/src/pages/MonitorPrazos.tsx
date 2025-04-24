import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Header from "@/components/Header";
import { toast } from "sonner";
import { Calendar, Clock, CheckCircle, AlertTriangle, BarChart, Upload, Bell, Users, Filter, X, Download, Eye } from "lucide-react";

// Define types for our deadline management
interface Deadline {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  category: string;
  priority: "baixa" | "média" | "alta";
  status: "pendente" | "em andamento" | "concluído" | "atrasado";
  discipline?: string;
  attachments: {
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
    uploadDate: Date;
  }[];
  notifications?: {
    type: "email" | "push" | "whatsapp";
    timing: "1 semana" | "3 dias" | "1 dia" | "no dia";
  }[];
  collaborators?: string[];
  comments?: {
    id: string;
    author: string;
    text: string;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MonitorPrazos = () => {
  // State management
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [filteredDeadlines, setFilteredDeadlines] = useState<Deadline[]>([]);
  const [activeView, setActiveView] = useState<"lista" | "calendario" | "kanban">("lista");
  const [filterCategory, setFilterCategory] = useState<string>("todas");
  const [filterPriority, setFilterPriority] = useState<string>("todas");
  const [filterStatus, setFilterStatus] = useState<string>("todas");
  const [newDeadline, setNewDeadline] = useState<Partial<Deadline>>({
    title: "",
    description: "",
    dueDate: new Date(),
    category: "Trabalho",
    priority: "média",
    status: "pendente",
    discipline: "",
  });
  const [isAddingDeadline, setIsAddingDeadline] = useState(false);
  const [editingDeadlineId, setEditingDeadlineId] = useState<string | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<Deadline['attachments'][0] | null>(null);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);

  // Categories for academic deadlines
  const categories = [
    "Trabalho",
    "Prova",
    "Atividade",
    "Leitura",
    "Apresentação",
    "Pesquisa",
    "Artigo",
    "Monografia",
    "TCC",
    "Outro"
  ];

  // Load deadlines from localStorage on component mount
  useEffect(() => {
    const savedDeadlines = localStorage.getItem("deadlines");
    if (savedDeadlines) {
      try {
        // Convert string dates back to Date objects
        const parsedDeadlines = JSON.parse(savedDeadlines, (key, value) => {
          if (key === "dueDate" || key === "createdAt" || key === "updatedAt" || key === "timestamp") {
            return new Date(value);
          }
          return value;
        });
        setDeadlines(parsedDeadlines);
        setFilteredDeadlines(parsedDeadlines);
      } catch (error) {
        console.error("Error parsing deadlines:", error);
        toast.error("Erro ao carregar prazos salvos");
      }
    }
  }, []);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    let filtered = [...deadlines];
    
    if (filterCategory !== "todas") {
      filtered = filtered.filter(deadline => deadline.category === filterCategory);
    }
    
    if (filterPriority !== "todas") {
      filtered = filtered.filter(deadline => deadline.priority === filterPriority);
    }
    
    if (filterStatus !== "todas") {
      filtered = filtered.filter(deadline => deadline.status === filterStatus);
    }
    
    // Sort by due date (closest first)
    filtered.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    
    setFilteredDeadlines(filtered);
  }, [deadlines, filterCategory, filterPriority, filterStatus]);

  // Check for overdue deadlines
  useEffect(() => {
    const now = new Date();
    const updatedDeadlines = deadlines.map(deadline => {
      if (deadline.status !== "concluído" && deadline.dueDate < now) {
        return { ...deadline, status: "atrasado" };
      }
      return deadline;
    });
    
    if (JSON.stringify(updatedDeadlines) !== JSON.stringify(deadlines)) {
      setDeadlines(updatedDeadlines as Deadline[]);
      // Save to localStorage
      localStorage.setItem("deadlines", JSON.stringify(updatedDeadlines));
    }
  }, [deadlines]);

  // Handle adding a new deadline
  // Add these new state variables in the component
  const [files, setFiles] = useState<File[]>([]);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  // Add this function to handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      
      // Create preview for the first file if it's an image
      const firstFile = selectedFiles[0];
      if (firstFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(firstFile);
      } else {
        setFilePreview(null);
      }
    }
  };
  
  // Modify the handleAddDeadline function to include file attachments
  const handleAddDeadline = () => {
    if (!newDeadline.title || !newDeadline.dueDate) {
      toast.error("Título e data de entrega são obrigatórios");
      return;
    }
  
    // Process file attachments
    const attachments = files.map(file => ({
      id: uuidv4(),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file), // For local preview only
      size: file.size,
      uploadDate: new Date()
    }));
  
    const deadline: Deadline = {
      id: uuidv4(),
      title: newDeadline.title || "",
      description: newDeadline.description || "",
      dueDate: newDeadline.dueDate || new Date(),
      category: newDeadline.category || "Trabalho",
      priority: newDeadline.priority as "baixa" | "média" | "alta" || "média",
      status: newDeadline.status as "pendente" | "em andamento" | "concluído" | "atrasado" || "pendente",
      discipline: newDeadline.discipline || "",
      attachments: attachments,
      collaborators: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedDeadlines = [...deadlines, deadline];
    setDeadlines(updatedDeadlines);
    
    // Save to localStorage
    localStorage.setItem("deadlines", JSON.stringify(updatedDeadlines));
    
    // Reset form
    setNewDeadline({
      title: "",
      description: "",
      dueDate: new Date(),
      category: "Trabalho",
      priority: "média",
      status: "pendente",
      discipline: "",
    });
    
    setIsAddingDeadline(false);
    toast.success("Prazo adicionado com sucesso!");
  };

  // Handle updating a deadline
  const handleUpdateDeadline = (id: string, updates: Partial<Deadline>) => {
    const updatedDeadlines = deadlines.map(deadline => {
      if (deadline.id === id) {
        return {
          ...deadline,
          ...updates,
          updatedAt: new Date()
        };
      }
      return deadline;
    });
    
    setDeadlines(updatedDeadlines);
    
    // Save to localStorage
    localStorage.setItem("deadlines", JSON.stringify(updatedDeadlines));
    
    toast.success("Prazo atualizado com sucesso!");
    setEditingDeadlineId(null);
  };

  // Handle deleting a deadline
  const handleDeleteDeadline = (id: string) => {
    const updatedDeadlines = deadlines.filter(deadline => deadline.id !== id);
    setDeadlines(updatedDeadlines);
    
    // Save to localStorage
    localStorage.setItem("deadlines", JSON.stringify(updatedDeadlines));
    
    toast.success("Prazo removido com sucesso!");
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (dueDate: Date) => {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta": return "bg-red-500";
      case "média": return "bg-yellow-500";
      case "baixa": return "bg-green-500";
      default: return "bg-blue-500";
    }
  };

  // Get status color and icon
  const getStatusInfo = (status: string, daysRemaining: number) => {
    switch (status) {
      case "concluído": 
        return { color: "bg-green-500", textColor: "text-green-500", icon: <CheckCircle className="w-5 h-5" /> };
      case "atrasado": 
        return { color: "bg-red-500", textColor: "text-red-500", icon: <AlertTriangle className="w-5 h-5" /> };
      case "em andamento": 
        return { color: "bg-blue-500", textColor: "text-blue-500", icon: <Clock className="w-5 h-5" /> };
      default: 
        return daysRemaining <= 3 
          ? { color: "bg-orange-500", textColor: "text-orange-500", icon: <AlertTriangle className="w-5 h-5" /> }
          : { color: "bg-gray-500", textColor: "text-gray-500", icon: <Clock className="w-5 h-5" /> };
    }
  };

  // Calculate completion statistics
  const getCompletionStats = () => {
    const total = deadlines.length;
    const completed = deadlines.filter(d => d.status === "concluído").length;
    const overdue = deadlines.filter(d => d.status === "atrasado").length;
    const pending = total - completed - overdue;
    
    return {
      total,
      completed,
      overdue,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const stats = getCompletionStats();

  // Função para abrir o anexo
  const openAttachment = (attachment: Deadline['attachments'][0]) => {
    setSelectedAttachment(attachment);
    setShowAttachmentModal(true);
  };

  // Função para baixar o anexo
  const downloadAttachment = (attachment: Deadline['attachments'][0], e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Baixando: ${attachment.name}`);
  };

  // Função para renderizar anexos
  const renderAttachments = (attachments: Deadline['attachments']) => {
    if (!attachments || attachments.length === 0) return null;
    
    return (
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2">Anexos ({attachments.length}):</p>
        <div className="flex flex-wrap gap-2">
          {attachments.map(attachment => (
            <div 
              key={attachment.id}
              className="flex items-center p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              onClick={() => openAttachment(attachment)}
            >
              <span className="text-sm mr-1">
                {attachment.type.includes('image') ? '🖼️' : 
                 attachment.type.includes('pdf') ? '📄' : 
                 attachment.type.includes('word') ? '📝' : 
                 attachment.type.includes('excel') ? '📊' : 
                 '📎'}
              </span>
              <span className="text-xs text-gray-700 truncate max-w-[100px]">
                {attachment.name}
              </span>
              <button 
                onClick={(e) => downloadAttachment(attachment, e)}
                className="ml-2 text-gray-500 hover:text-indigo-600"
                title="Baixar arquivo"
              >
                <Download className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Monitor de Prazos Acadêmicos</h1>
          <button 
            onClick={() => setIsAddingDeadline(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <span>+ Novo Prazo</span>
          </button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-indigo-600 mb-2">{stats.total}</div>
            <div className="text-gray-500">Total de Prazos</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-green-500 mb-2">{stats.completed}</div>
            <div className="text-gray-500">Concluídos</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-orange-500 mb-2">{stats.pending}</div>
            <div className="text-gray-500">Pendentes</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-red-500 mb-2">{stats.overdue}</div>
            <div className="text-gray-500">Atrasados</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Progresso Geral</h2>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
          <div className="text-right text-gray-600">{stats.completionRate}% concluído</div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 font-medium">Filtros:</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="todas">Todas as Categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select 
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="todas">Todas as Prioridades</option>
                <option value="alta">Alta</option>
                <option value="média">Média</option>
                <option value="baixa">Baixa</option>
              </select>
              
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="todas">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="em andamento">Em Andamento</option>
                <option value="concluído">Concluído</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setActiveView("lista")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeView === "lista" ? "bg-indigo-600 text-white" : "bg-white text-gray-700"}`}
          >
            <Filter className="w-5 h-5" />
            <span>Lista</span>
          </button>
          
          <button 
            onClick={() => setActiveView("calendario")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeView === "calendario" ? "bg-indigo-600 text-white" : "bg-white text-gray-700"}`}
          >
            <Calendar className="w-5 h-5" />
            <span>Calendário</span>
          </button>
          
          <button 
            onClick={() => setActiveView("kanban")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeView === "kanban" ? "bg-indigo-600 text-white" : "bg-white text-gray-700"}`}
          >
            <BarChart className="w-5 h-5" />
            <span>Kanban</span>
          </button>
        </div>

        {/* Deadlines List View */}
        {activeView === "lista" && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDeadlines.length > 0 ? (
                    filteredDeadlines.map(deadline => {
                      const daysRemaining = getDaysRemaining(deadline.dueDate);
                      const statusInfo = getStatusInfo(deadline.status, daysRemaining);
                      
                      return (
                        <tr key={deadline.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-grow">
                                <div className="text-sm font-medium text-gray-900 mb-1">{deadline.title}</div>
                                {deadline.discipline && (
                                  <div className="text-xs text-gray-500">{deadline.discipline}</div>
                                )}
                                {deadline.description && (
                                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{deadline.description}</div>
                                )}
                              </div>
                              {deadline.attachments && deadline.attachments.length > 0 && (
                                <div className="flex items-center space-x-2">
                                  <div className="flex -space-x-2">
                                    {deadline.attachments.slice(0, 3).map((attachment, index) => (
                                      <div
                                        key={attachment.id}
                                        className="h-6 w-6 rounded-full bg-gray-100 border border-white flex items-center justify-center"
                                        title={attachment.name}
                                      >
                                        <span className="text-xs">
                                          {attachment.type.includes('image') ? '🖼️' : 
                                           attachment.type.includes('pdf') ? '📄' : 
                                           attachment.type.includes('word') ? '📝' : 
                                           attachment.type.includes('excel') ? '📊' : 
                                           '📎'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  {deadline.attachments.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{deadline.attachments.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {deadline.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(deadline.dueDate)}</div>
                            <div className={`text-sm ${daysRemaining <= 0 ? 'text-red-500' : daysRemaining <= 3 ? 'text-orange-500' : 'text-gray-500'}`}>
                              {daysRemaining === 0 ? 'Hoje' : 
                               daysRemaining < 0 ? `${Math.abs(daysRemaining)} dias atrás` : 
                               `${daysRemaining} dias restantes`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(deadline.priority)} text-white`}>
                              {deadline.priority.charAt(0).toUpperCase() + deadline.priority.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color} text-white`}>
                              {statusInfo.icon}
                              <span className="ml-1">{deadline.status.charAt(0).toUpperCase() + deadline.status.slice(1)}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => {
                                  setEditingDeadlineId(deadline.id);
                                  setNewDeadline(deadline);
                                  setIsAddingDeadline(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Editar
                              </button>
                              <button 
                                onClick={() => handleUpdateDeadline(deadline.id, { 
                                  status: deadline.status === "concluído" ? "pendente" : "concluído" 
                                })}
                                className={deadline.status === "concluído" ? "text-orange-600 hover:text-orange-900" : "text-green-600 hover:text-green-900"}
                              >
                                {deadline.status === "concluído" ? "Reabrir" : "Concluir"}
                              </button>
                              <button 
                                onClick={() => handleDeleteDeadline(deadline.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        Nenhum prazo encontrado. Adicione um novo prazo para começar!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {activeView === "calendario" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold">Visualização de Calendário</h3>
              <p className="text-gray-500">Em breve: Integração com Google Calendar</p>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
                <div key={day} className="text-center font-medium py-2 bg-gray-100 rounded">
                  {day}
                </div>
              ))}
              {/* Placeholder for calendar days */}
              {Array.from({ length: 35 }).map((_, index) => {
                const day = index + 1;
                const hasDeadline = filteredDeadlines.some(d => {
                  const dueDate = new Date(d.dueDate);
                  return dueDate.getDate() === day && dueDate.getMonth() === new Date().getMonth();
                });
                
                return (
                  <div 
                    key={index} 
                    className={`min-h-[80px] p-2 border rounded ${hasDeadline ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200'} ${day === new Date().getDate() ? 'ring-2 ring-indigo-500' : ''}`}
                  >
                    <div className="text-right text-sm font-medium">{day <= 31 ? day : ''}</div>
                    {day <= 31 && filteredDeadlines
                      .filter(d => {
                        const dueDate = new Date(d.dueDate);
                        return dueDate.getDate() === day && dueDate.getMonth() === new Date().getMonth();
                      })
                      .map(deadline => (
                        <div 
                          key={deadline.id} 
                          className={`text-xs p-1 mt-1 rounded truncate ${getPriorityColor(deadline.priority)} text-white`}
                        >
                          {deadline.title}
                        </div>
                      ))
                    }
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Kanban View */}
        {activeView === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {["pendente", "em andamento", "concluído", "atrasado"].map(status => (
              <div key={status} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className={`p-4 ${
                  status === "pendente" ? "bg-gray-100" :
                  status === "em andamento" ? "bg-blue-100" :
                  status === "concluído" ? "bg-green-100" :
                  "bg-red-100"
                }`}>
                  <h3 className="font-semibold text-lg capitalize">{status}</h3>
                  <div className="text-sm text-gray-500">
                    {filteredDeadlines.filter(d => d.status === status).length} itens
                  </div>
                </div>
                
                <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredDeadlines
                    .filter(d => d.status === status)
                    .map(deadline => {
                      const daysRemaining = getDaysRemaining(deadline.dueDate);
                      
                      return (
                        <div 
                          key={deadline.id} 
                          className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{deadline.title}</h4>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(deadline.priority)} text-white`}>
                              {deadline.priority}
                            </span>
                          </div>
                          
                          {deadline.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{deadline.description}</p>
                          )}
                          
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(deadline.dueDate)}
                            </div>
                            
                            <div className={daysRemaining <= 0 ? 'text-red-500' : daysRemaining <= 3 ? 'text-orange-500' : 'text-gray-500'}>
                              {daysRemaining === 0 ? 'Hoje' : 
                               daysRemaining < 0 ? `${Math.abs(daysRemaining)}d atrás` : 
                               `${daysRemaining}d restantes`}
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                            <button 
                              onClick={() => {
                                const nextStatus = {
                                  "pendente": "em andamento",
                                  "em andamento": "concluído",
                                  "atrasado": "concluído",
                                  "concluído": "pendente"
                                }[status] as "pendente" | "em andamento" | "concluído" | "atrasado";
                                
                                handleUpdateDeadline(deadline.id, { status: nextStatus });
                              }}
                              className="text-xs text-indigo-600 hover:text-indigo-800"
                            >
                              {status === "concluído" ? "Reabrir" : "Avançar →"}
                            </button>
                            
                            <button 
                              onClick={() => {
                                setEditingDeadlineId(deadline.id);
                                setNewDeadline(deadline);
                                setIsAddingDeadline(true);
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    
                  {filteredDeadlines.filter(d => d.status === status).length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      Nenhum item
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Deadline Modal */}
        {isAddingDeadline && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
              <h2 className="text-2xl font-bold mb-6">
                {editingDeadlineId ? "Editar Prazo" : "Adicionar Novo Prazo"}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={newDeadline.title || ""}
                    onChange={(e) => setNewDeadline({...newDeadline, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ex: Entrega do Trabalho de Física"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
                  <input
                    type="text"
                    value={newDeadline.discipline || ""}
                    onChange={(e) => setNewDeadline({...newDeadline, discipline: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ex: Física, Matemática, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={newDeadline.category || "Trabalho"}
                    onChange={(e) => setNewDeadline({...newDeadline, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrega</label>
                  <input
                    type="date"
                    value={newDeadline.dueDate ? new Date(newDeadline.dueDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => setNewDeadline({...newDeadline, dueDate: new Date(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                  <select
                    value={newDeadline.priority || "média"}
                    onChange={(e) => setNewDeadline({...newDeadline, priority: e.target.value as "baixa" | "média" | "alta"})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="média">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={newDeadline.description || ""}
                  onChange={(e) => setNewDeadline({...newDeadline, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32"
                  placeholder="Descreva os detalhes deste prazo..."
                ></textarea>
              </div>
              
              {editingDeadlineId && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newDeadline.status || "pendente"}
                    onChange={(e) => setNewDeadline({...newDeadline, status: e.target.value as "pendente" | "em andamento" | "concluído" | "atrasado"})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em andamento">Em Andamento</option>
                    <option value="concluído">Concluído</option>
                    <option value="atrasado">Atrasado</option>
                  </select>
                </div>
              )}
              
              {/* File attachments section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Anexos</label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Arraste arquivos aqui ou clique para fazer upload</p>
                  <p className="text-xs text-gray-400 mt-1">Suporta imagens, PDFs, documentos e outros arquivos</p>
                </div>
                
                {/* File preview */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">{files.length} arquivo(s) selecionado(s):</p>
                    
                    {filePreview && (
                      <div className="mt-2 relative w-full max-w-xs mx-auto">
                        <img 
                          src={filePreview} 
                          alt="Preview" 
                          className="rounded-lg shadow-md max-h-40 mx-auto object-contain" 
                        />
                      </div>
                    )}
                    
                    <ul className="mt-2 divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                      {files.map((file, index) => (
                        <li key={index} className="flex items-center justify-between p-3 hover:bg-gray-50">
                          <div className="flex items-center">
                            <span className={`mr-2 text-lg ${
                              file.type.includes('image') ? 'text-blue-500' : 
                              file.type.includes('pdf') ? 'text-red-500' : 
                              file.type.includes('word') ? 'text-indigo-500' : 
                              file.type.includes('excel') ? 'text-green-500' : 
                              'text-gray-500'
                            }`}>
                              {file.type.includes('image') ? '🖼️' : 
                               file.type.includes('pdf') ? '📄' : 
                               file.type.includes('word') ? '📝' : 
                               file.type.includes('excel') ? '📊' : 
                               '📎'}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setFiles(files.filter((_, i) => i !== index));
                              if (index === 0) setFilePreview(null);
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remover
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Future feature: Notifications */}
              <div className="mb-6 opacity-50 cursor-not-allowed">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notificações (Em breve)</label>
                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Lembretes automáticos</div>
                    <div className="text-xs text-gray-500">Receba notificações antes do prazo</div>
                  </div>
                  <div className="ml-auto">
                    <input type="checkbox" disabled className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  </div>
                </div>
              </div>
              
              {/* Future feature: Collaborators */}
              <div className="mb-6 opacity-50 cursor-not-allowed">
                <label className="block text-sm font-medium text-gray-700 mb-1">Colaboradores (Em breve)</label>
                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Compartilhar com colegas</div>
                    <div className="text-xs text-gray-500">Trabalhe em equipe nos mesmos prazos</div>
                  </div>
                  <div className="ml-auto">
                    <button disabled className="text-gray-400 text-sm">+ Adicionar</button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsAddingDeadline(false);
                    setEditingDeadlineId(null);
                    setNewDeadline({
                      title: "",
                      description: "",
                      dueDate: new Date(),
                      category: "Trabalho",
                      priority: "média",
                      status: "pendente",
                      discipline: "",
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (editingDeadlineId) {
                      handleUpdateDeadline(editingDeadlineId, newDeadline);
                    } else {
                      handleAddDeadline();
                    }
                    setIsAddingDeadline(false);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingDeadlineId ? "Salvar Alterações" : "Adicionar Prazo"}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Empty state */}
        {deadlines.length === 0 && !isAddingDeadline && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Nenhum prazo cadastrado</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Comece adicionando seus prazos acadêmicos para acompanhar suas entregas e nunca mais perder uma data importante.
            </p>
            <button 
              onClick={() => setIsAddingDeadline(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
            >
              <span>+ Adicionar Primeiro Prazo</span>
            </button>
          </div>
        )}

        {/* Modal para visualizar anexos */}
        {showAttachmentModal && selectedAttachment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold flex items-center">
                  <span className="mr-2">
                    {selectedAttachment.type.includes('image') ? '🖼️' : 
                     selectedAttachment.type.includes('pdf') ? '📄' : 
                     selectedAttachment.type.includes('word') ? '📝' : 
                     selectedAttachment.type.includes('excel') ? '📊' : 
                     '📎'}
                  </span>
                  {selectedAttachment.name}
                </h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => downloadAttachment(selectedAttachment, {} as React.MouseEvent)}
                    className="p-2 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-gray-100"
                    title="Baixar arquivo"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setShowAttachmentModal(false)}
                    className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                {selectedAttachment.type.includes('image') ? (
                  <img 
                    src={selectedAttachment.url} 
                    alt={selectedAttachment.name} 
                    className="max-h-[60vh] mx-auto object-contain"
                  />
                ) : selectedAttachment.type.includes('pdf') ? (
                  <iframe 
                    src={selectedAttachment.url} 
                    className="w-full h-[60vh] border-0"
                    title={selectedAttachment.name}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                    <div className="text-6xl mb-4">
                      {selectedAttachment.type.includes('word') ? '📝' : 
                       selectedAttachment.type.includes('excel') ? '📊' : 
                       '📎'}
                    </div>
                    <p className="text-lg text-gray-700 mb-2">
                      Este tipo de arquivo não pode ser visualizado diretamente
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {selectedAttachment.name} ({(selectedAttachment.size / 1024).toFixed(1)} KB)
                    </p>
                    <button 
                      onClick={() => downloadAttachment(selectedAttachment, {} as React.MouseEvent)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Arquivo
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Nome: {selectedAttachment.name}</p>
                <p>Tipo: {selectedAttachment.type}</p>
                <p>Tamanho: {(selectedAttachment.size / 1024).toFixed(1)} KB</p>
                <p>Data de upload: {new Date(selectedAttachment.uploadDate).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MonitorPrazos;