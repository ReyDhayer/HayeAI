import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';
import xlsx from 'xlsx';

export async function readFileContent(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let content = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      content += textContent.items
        .map((item: any) => item.str)
        .join(' ') + '\n';
    }
    
    return content;
  } else {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }
}

async function readDocxContent(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function readExcelContent(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = xlsx.read(arrayBuffer);
  let content = '';
  
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    content += `Sheet: ${sheetName}\n${xlsx.utils.sheet_to_csv(sheet)}\n\n`;
  });
  
  return content;
}

async function readTextContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}