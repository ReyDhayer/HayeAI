
import React, { useState } from "react";
import { Paperclip, Send, Mic, Trash, Youtube, ChevronDown } from "lucide-react";
import { useFadeIn } from "@/lib/animations";
import { AIModel, AI_MODELS } from "@/lib/types/ai-models";

interface InputAreaProps {
  selectedTool: string | null;
  onSubmit: (text: string, model: AIModel, fileData?: File | null, youtubeUrl?: string) => void;
}

const InputArea: React.FC<InputAreaProps> = ({ selectedTool, onSubmit }) => {
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  
  const fadeIn = useFadeIn(300);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText && !file && !youtubeUrl) || !selectedTool) return;
    
    onSubmit(inputText, selectedModel, file, youtubeUrl);
    setInputText("");
    setFile(null);
    setYoutubeUrl("");
    setShowYoutubeInput(false);
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const toggleYoutubeInput = () => {
    setShowYoutubeInput(!showYoutubeInput);
  };

  if (!selectedTool) return null;

  return (
    <div className={`w-full mt-6 ${fadeIn}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {file && (
          <div className="flex items-center p-3 bg-secondary rounded-lg">
            <span className="flex-1 truncate">{file.name}</span>
            <button 
              type="button"
              onClick={handleRemoveFile}
              className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash size={18} />
            </button>
          </div>
        )}
        
        {showYoutubeInput && (
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Cole o link do YouTube aqui"
              className="input-field flex-1"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          </div>
        )}
        
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={selectedTool === "youtube" ? "Digite um comentário ou deixe em branco para apenas resumir" : "Digite sua mensagem..."}
              className="input-field pr-24"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <div className="relative">
               
                
              </div>
          
              {selectedTool === "youtube" && (
                <button
                  type="button"
                  className={`text-muted-foreground hover:text-foreground transition-colors ${youtubeUrl ? "text-primary" : ""}`}
                  onClick={toggleYoutubeInput}
                >
                  <Youtube size={20} />
                </button>
              )}
              
            </div>
          </div>
          <button
            type="submit"
            className="btn-primary h-[50px] w-[50px] flex items-center justify-center p-0 rounded-full"
            disabled={!inputText && !file && !youtubeUrl}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputArea;
