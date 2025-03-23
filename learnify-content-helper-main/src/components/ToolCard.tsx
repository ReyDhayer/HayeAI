
import React from "react";
import { ToolProps } from "@/lib/types";
import { useSequentialFadeIn } from "@/lib/animations";
import * as LucideIcons from "lucide-react";

interface ToolCardProps extends ToolProps {
  index: number;
  onClick: (id: string) => void;
  isSelected: boolean;
}

const ToolCard: React.FC<ToolCardProps> = ({
  id,
  title,
  description,
  icon,
  index,
  onClick,
  isSelected,
}) => {
  const fadeIn = useSequentialFadeIn(index, 75);
  
  // @ts-ignore - Dynamic icon import
  const Icon = LucideIcons[icon] || LucideIcons.HelpCircle;

  return (
    <div
      className={`tool-card ${fadeIn} ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => onClick(id)}
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <div className="relative">
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full" />
        )}
        <Icon className="tool-icon" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default ToolCard;
