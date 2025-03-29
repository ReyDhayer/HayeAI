
import React from "react";
import { HistoryItem } from "@/lib/types";
import { useFadeIn } from "@/lib/animations";
import { Clock, Trash, Search } from "lucide-react";

interface HistorySectionProps {
  history: HistoryItem[];
  onSelectHistoryItem: (id: string) => void;
  onClearHistory: () => void;
}

const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  const fadeIn = useFadeIn(400);

  if (history.length === 0) {
    return (
      <div className={`mt-8 ${fadeIn}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Histórico</h3>
        </div>
        <div className="backdrop-blur-lg bg-white/30 rounded-xl p-8 text-center border border-white/20 shadow-xl transition-all duration-300 hover:bg-white/40">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600 font-medium">Seu histórico aparecerá aqui</p>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }).format(date);
  };

  return (
    <div className={`mt-8 ${fadeIn}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Histórico</h3>
        <button
          onClick={onClearHistory}
          className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow"
        >
          <Trash size={16} />
          Limpar
        </button>
      </div>
      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {history.map((item, index) => (
          <div
            key={item.id}
            className="backdrop-blur-lg bg-white/30 rounded-xl p-4 border border-white/20 shadow-lg transition-all duration-300 hover:bg-white/40 hover:shadow-xl cursor-pointer transform hover:-translate-y-1"
            onClick={() => onSelectHistoryItem(item.id)}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex-1 space-y-2">
              <p className="font-semibold text-gray-800 line-clamp-1">
                {item.query.substring(0, 40)}{item.query.length > 40 ? '...' : ''}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock size={14} className="mr-2" />
                {formatDate(item.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistorySection;
