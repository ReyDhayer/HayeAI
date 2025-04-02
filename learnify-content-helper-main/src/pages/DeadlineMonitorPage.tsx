import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Header from "@/components/Header";
import DeadlineMonitor, { DeadlineItem } from "@/components/DeadlineMonitor";

const DeadlineMonitorPage: React.FC = () => {
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);

  // Carregar prazos do localStorage ao iniciar
  useEffect(() => {
    const savedDeadlines = localStorage.getItem("deadlines");
    if (savedDeadlines) {
      try {
        // Converter as strings de data de volta para objetos Date
        const parsedDeadlines = JSON.parse(savedDeadlines, (key, value) => {
          if (key === "dueDate") return new Date(value);
          return value;
        });
        setDeadlines(parsedDeadlines);
      } catch (error) {
        console.error("Erro ao carregar prazos:", error);
      }
    }
  }, []);

  // Salvar prazos no localStorage quando houver alterações
  useEffect(() => {
    localStorage.setItem("deadlines", JSON.stringify(deadlines));
  }, [deadlines]);

  const handleAddDeadline = (newDeadline: Omit<DeadlineItem, "id">) => {
    const deadline: DeadlineItem = {
      ...newDeadline,
      id: uuidv4(),
    };
    setDeadlines(prev => [deadline, ...prev]);
  };

  const handleUpdateDeadline = (updatedDeadline: DeadlineItem) => {
    setDeadlines(prev =>
      prev.map(deadline =>
        deadline.id === updatedDeadline.id ? updatedDeadline : deadline
      )
    );
  };

  const handleDeleteDeadline = (id: string) => {
    setDeadlines(prev => prev.filter(deadline => deadline.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setDeadlines(prev =>
      prev.map(deadline =>
        deadline.id === id
          ? { ...deadline, completed: !deadline.completed }
          : deadline
      )
    );
  };

  // Renderizar blobs para decoração de fundo
  const renderBlobs = () => {
    return (
      <>
        <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {renderBlobs()}
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex flex-col gap-8">
            <div className="w-full">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8 animate-gradient">
                Monitor de Prazos
              </h1>
              
              <div className="backdrop-blur-lg bg-white/30 rounded-xl p-6 border border-white/20 shadow-xl transition-all duration-300 mb-8">
                <p className="text-gray-700 text-lg">
                  Bem-vindo ao Monitor de Prazos! Aqui você pode gerenciar seus prazos acadêmicos, 
                  personalizar descrições, adicionar imagens e categorizar por urgência. 
                  Mantenha-se organizado e nunca mais perca um prazo importante.
                </p>
              </div>
              
              <DeadlineMonitor
                deadlines={deadlines}
                onAddDeadline={handleAddDeadline}
                onUpdateDeadline={handleUpdateDeadline}
                onDeleteDeadline={handleDeleteDeadline}
                onToggleComplete={handleToggleComplete}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DeadlineMonitorPage;