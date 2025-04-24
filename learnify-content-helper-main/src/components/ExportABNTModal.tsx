import React, { useState } from 'react';

interface ExportABNTModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { nome: string; instituicao: string; ano: string; titulo: string }) => void;
}

export const ExportABNTModal: React.FC<ExportABNTModalProps> = ({ open, onClose, onSubmit }) => {
  const [nome, setNome] = useState('');
  const [instituicao, setInstituicao] = useState('');
  const [ano, setAno] = useState(new Date().getFullYear().toString());
  const [titulo, setTitulo] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Exportar em formato ABNT</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit({ nome, instituicao, ano, titulo });
          }}
        >
          <label className="block mb-2">
            Nome do autor:
            <input type="text" className="mt-1 w-full border rounded px-2 py-1" value={nome} onChange={e => setNome(e.target.value)} required />
          </label>
          <label className="block mb-2">
            Instituição:
            <input type="text" className="mt-1 w-full border rounded px-2 py-1" value={instituicao} onChange={e => setInstituicao(e.target.value)} required />
          </label>
          <label className="block mb-2">
            Ano:
            <input type="number" className="mt-1 w-full border rounded px-2 py-1" value={ano} onChange={e => setAno(e.target.value)} required />
          </label>
          <label className="block mb-2">
            Título do trabalho:
            <input type="text" className="mt-1 w-full border rounded px-2 py-1" value={titulo} onChange={e => setTitulo(e.target.value)} required />
          </label>
          <div className="flex justify-end mt-4 gap-2">
            <button type="button" className="px-3 py-1 rounded bg-gray-200" onClick={onClose}>Cancelar</button>
            <button type="submit" className="px-3 py-1 rounded bg-primary text-white">Exportar</button>
          </div>
        </form>
      </div>
    </div>
  );
};
