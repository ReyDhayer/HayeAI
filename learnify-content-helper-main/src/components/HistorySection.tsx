
import React from "react";
import { HistoryItem } from "@/lib/types";
import { useFadeIn } from "@/lib/animations";
import { Clock, Trash } from "lucide-react";

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
          <h3 className="text-lg font-semibold">Histórico</h3>
        </div>
        <div className="glass-panel rounded-xl p-4 text-center text-muted-foreground">
          <p>Seu histórico aparecerá aqui</p>
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Histórico</h3>
        <button
          onClick={onClearHistory}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center"
        >
          <Trash size={14} className="mr-1" />
          Limpar
        </button>
      </div>
      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
        {history.map((item, index) => (
          <div
            key={item.id}
            className="history-item flex items-center"
            onClick={() => onSelectHistoryItem(item.id)}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex-1 truncate">
              <p className="font-medium truncate">{item.query.substring(0, 40)}{item.query.length > 40 ? '...' : ''}</p>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Clock size={12} className="mr-1" />
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
