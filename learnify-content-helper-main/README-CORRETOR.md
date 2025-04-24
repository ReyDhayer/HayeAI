# Corretor de Redações - Instruções de Configuração

Este componente permite analisar redações usando a API Gemini do Google. Para que funcione corretamente, siga as instruções abaixo:

## Configuração da API Gemini

1. Obtenha uma chave de API Gemini em: https://aistudio.google.com/app/apikey
2. Crie um arquivo `.env.local` na raiz do projeto (copie o arquivo `.env.sample`)
3. Adicione sua chave API no arquivo `.env.local`:
   ```
   VITE_GEMINI_API_KEY=sua_chave_api_aqui
   ```

## Instalação de Dependências

Execute o seguinte comando para instalar todas as dependências necessárias:

```bash
npm install
```

## Executando o Aplicativo

Para iniciar o aplicativo em modo de desenvolvimento:

```bash
npm run dev
```

## Como Usar o Corretor de Redações

1. Navegue até a página "Corretor de Redações" no aplicativo
2. Cole sua redação na caixa de texto ou faça upload de um arquivo
3. Clique em "Analisar Redação"
4. O sistema irá analisar sua redação e fornecer feedback detalhado sobre:
   - Estrutura e organização
   - Argumentação e desenvolvimento
   - Gramática e ortografia
   - Coesão e coerência
   - Adequação ao tema

## Solução de Problemas

Se você encontrar o erro "A chave da API do Gemini não está configurada", verifique se:
1. Você criou o arquivo `.env.local` corretamente
2. A chave API foi inserida corretamente
3. O aplicativo foi reiniciado após a configuração da chave API

## Limitações

- O componente suporta análise de arquivos .doc, .docx, .pdf e .txt, mas a extração de texto pode variar dependendo do formato
- A análise é limitada pela capacidade do modelo Gemini e pode não capturar todos os aspectos de uma redação
