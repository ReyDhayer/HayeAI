import React from 'react';
interface ToolProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  onClick?: (id: string) => void;
  isSelected?: boolean;
}
import * as Icons from 'lucide-react';

const ToolCard: React.FC<ToolProps> = ({ id, title, description, icon, onClick, isSelected }) => {
  const IconComponent = Icons[icon as keyof typeof Icons];

  return (
    <button
      onClick={() => onClick?.(id)}
      className={`p-4 rounded-lg border transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
      }`}
    >
      <div className="flex items-start gap-3">
        {IconComponent && (
          <div className="mt-1">
            <IconComponent className="w-5 h-5 text-blue-500" />
          </div>
        )}
        <div className="text-left">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default ToolCard;