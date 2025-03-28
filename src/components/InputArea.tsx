import React, { useState } from 'react';
import { Youtube } from 'lucide-react';

interface InputAreaProps {
  selectedTool: string;
  onSubmit: (text: string, file?: File | null, youtubeUrl?: string) => void;
}

const InputArea: React.FC<InputAreaProps> = ({ selectedTool, onSubmit }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(text, file, youtubeUrl);
    setText('');
    setFile(null);
    setYoutubeUrl('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite sua pergunta ou texto aqui..."
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />

        {selectedTool === 'youtube' && (
          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <Youtube className="w-5 h-5 text-red-500" />
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Cole o link do vídeo do YouTube aqui"
              className="flex-1 focus:outline-none"
            />
          </div>
        )}

        <div className="flex items-center gap-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="px-4 py-2 text-sm border rounded-lg cursor-pointer hover:bg-gray-50"
          >
            {file ? file.name : 'Escolher arquivo'}
          </label>

          <button
            type="submit"
            className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Enviar
          </button>
        </div>
      </div>
    </form>
  );
};

export default InputArea;