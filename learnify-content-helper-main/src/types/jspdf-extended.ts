import { jsPDF } from 'jspdf';

export interface ExtendedJsPDF extends jsPDF {
  // Adicione aqui quaisquer métodos ou propriedades adicionais que você precise
  // Por exemplo:
  setHeaderFooter?: (header: string, footer: string) => void;
  addWatermark?: (text: string) => void;
}