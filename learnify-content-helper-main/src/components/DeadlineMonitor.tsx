import React, { useState, useEffect } from "react";
import { Calendar, Clock, AlertTriangle, CheckCircle, Trash, Edit, Image, Plus, X } from "lucide-react";
import { useFadeIn } from "@/lib/animations";

export interface DeadlineItem {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  isUrgent: boolean;
  imageUrl?: string;
  completed: boolean;
}

interface DeadlineMonitorProps {
  deadlines: DeadlineItem[];
  onAddDeadline: (deadline: Omit<DeadlineItem, "id">) => void;
  onUpdateDeadline: (deadline: DeadlineItem) => void;
  onDeleteDeadline: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const DeadlineMonitor: React.FC<DeadlineMonitorProps> = ({
  deadlines,
  onAddDeadline,
  onUpdateDeadline,
  onDeleteDeadline,
  onToggleComplete,
}) => {
  const fadeIn = useFadeIn(400);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<DeadlineItem | null>(null);
  const [newDeadline, setNewDeadline] = useState<Omit<DeadlineItem, "id">>({  
    title: "",
    description: "",
    dueDate: new Date(),
    isUrgent: false,
    imageUrl: "",
    completed: false,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "urgent" | "non-urgent" | "completed">("all");

  useEffect(() => {
    // Limpar a pré-visualização quando o formulário for fechado
    if (!showAddForm && !editingDeadline) {
      setPreviewUrl("");
      setSelectedImage(null);
    }
  }, [showAddForm, editingDeadline]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Criar URL para pré-visualização
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDeadline) {
      // Atualizar prazo existente
      onUpdateDeadline({
        ...editingDeadline,
        ...newDeadline,
        imageUrl: previewUrl || editingDeadline.imageUrl,
      });
      setEditingDeadline(null);
    } else {
      // Adicionar novo prazo
      onAddDeadline({
        ...newDeadline,
        imageUrl: previewUrl,
      });
    }
    
    // Resetar formulário
    setNewDeadline({
      title: "",
      description: "",
      dueDate: new Date(),
      isUrgent: false,
      imageUrl: "",
      completed: false,
    });
    setShowAddForm(false);
    setPreviewUrl("");
    setSelectedImage(null);
  };

  const handleEdit = (deadline: DeadlineItem) => {
    setEditingDeadline(deadline);
    setNewDeadline({
      title: deadline.title,
      description: deadline.description,
      dueDate: deadline.dueDate,
      isUrgent: deadline.isUrgent,
      imageUrl: deadline.imageUrl,
      completed: deadline.completed,
    });
    setPreviewUrl(deadline.imageUrl || "");
    setShowAddForm(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const getDaysRemaining = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const filteredDeadlines = deadlines.filter(deadline => {
    switch (filter) {
      case "urgent":
        return deadline.isUrgent && !deadline.completed;
      case "non-urgent":
        return !deadline.isUrgent && !deadline.completed;
      case "completed":
        return deadline.completed;
      default:
        return true;
    }
  });

  return (
    <div className={`mt-8 ${fadeIn}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Monitor de Prazos</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-all duration-300 ${filter === "all" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter("urgent")}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-all duration-300 ${filter === "urgent" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Urgentes
          </button>
          <button
            onClick={() => setFilter("non-urgent")}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-all duration-300 ${filter === "non-urgent" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Não Urgentes
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-all duration-300 ${filter === "completed" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Concluídos
          </button>
        </div>
      </div>

      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Plus size={16} />
          Adicionar Prazo
        </button>
      )}

      {showAddForm && (
        <div className="mb-6 backdrop-blur-lg bg-white/50 rounded-xl p-6 border border-white/30 shadow-xl transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xl font-semibold text-gray-800">
              {editingDeadline ? "Editar Prazo" : "Novo Prazo"}
            </h4>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingDeadline(null);
                setPreviewUrl("");
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                type="text"
                value={newDeadline.title}
                onChange={(e) => setNewDeadline({...newDeadline, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={newDeadline.description}
                onChange={(e) => setNewDeadline({...newDeadline, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 min-h-[100px]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrega</label>
              <input
                type="date"
                value={newDeadline.dueDate instanceof Date ? newDeadline.dueDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                onChange={(e) => setNewDeadline({...newDeadline, dueDate: new Date(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                required
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isUrgent"
                checked={newDeadline.isUrgent}
                onChange={(e) => setNewDeadline({...newDeadline, isUrgent: e.target.checked})}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isUrgent" className="ml-2 text-sm font-medium text-gray-700">Marcar como Urgente</label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagem (opcional)</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 flex items-center gap-2">
                  <Image size={16} />
                  Escolher Imagem
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
                {previewUrl && (
                  <div className="relative">
                    <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl("");
                        setSelectedImage(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-all duration-300"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {editingDeadline ? "Atualizar" : "Adicionar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredDeadlines.length === 0 ? (
        <div className="backdrop-blur-lg bg-white/30 rounded-xl p-8 text-center border border-white/20 shadow-xl transition-all duration-300 hover:bg-white/40">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600 font-medium">
            {filter === "all" 
              ? "Nenhum prazo cadastrado. Adicione um novo prazo para começar."
              : filter === "urgent"
                ? "Nenhum prazo urgente cadastrado."
                : filter === "non-urgent"
                  ? "Nenhum prazo não urgente cadastrado."
                  : "Nenhum prazo concluído."}
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {filteredDeadlines.map((deadline, index) => {
            const daysRemaining = getDaysRemaining(deadline.dueDate);
            let statusColor = "bg-blue-100 text-blue-800";
            let statusText = `${daysRemaining} dias restantes`;
            
            if (deadline.completed) {
              statusColor = "bg-purple-100 text-purple-800";
              statusText = "Concluído";
            } else if (daysRemaining < 0) {
              statusColor = "bg-gray-100 text-gray-800";
              statusText = `Atrasado em ${Math.abs(daysRemaining)} dias`;
            } else if (daysRemaining === 0) {
              statusColor = "bg-orange-100 text-orange-800";
              statusText = "Vence hoje";
            } else if (deadline.isUrgent) {
              statusColor = "bg-red-100 text-red-800";
              statusText = `Urgente - ${daysRemaining} dias`;
            }
            
            return (
              <div
                key={deadline.id}
                className={`backdrop-blur-lg ${deadline.completed ? 'bg-white/20' : 'bg-white/30'} rounded-xl p-4 border ${deadline.isUrgent && !deadline.completed ? 'border-red-200' : 'border-white/20'} shadow-lg transition-all duration-300 hover:bg-white/40 hover:shadow-xl transform hover:-translate-y-1`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  {deadline.imageUrl && (
                    <div className="flex-shrink-0">
                      <img 
                        src={deadline.imageUrl} 
                        alt={deadline.title} 
                        className="w-20 h-20 object-cover rounded-lg shadow-md" 
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-semibold text-lg ${deadline.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                        {deadline.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onToggleComplete(deadline.id)}
                          className={`p-1.5 rounded-full transition-all duration-300 ${deadline.completed ? 'bg-purple-100 hover:bg-purple-200 text-purple-600' : 'bg-green-100 hover:bg-green-200 text-green-600'}`}
                          title={deadline.completed ? "Marcar como pendente" : "Marcar como concluído"}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(deadline)}
                          className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-all duration-300"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteDeadline(deadline.id)}
                          className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-all duration-300"
                          title="Excluir"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm">{deadline.description}</p>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(deadline.dueDate)}
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeadlineMonitor;