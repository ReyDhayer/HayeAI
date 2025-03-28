import React from 'react';
import { Trash2 } from 'lucide-react';

interface HistoryItem {
  id: string;
  toolId: string;
  query: string;
  response: string;
  timestamp: Date;
}

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
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Histórico</h2>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-red-500 hover:text-red-600 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpar
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Nenhuma interação registrada ainda.
        </p>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectHistoryItem(item.id)}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
            >
              <p className="font-medium text-gray-800 truncate">{item.query}</p>
              <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                <span>{new Date(item.timestamp).toLocaleString()}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistorySection;