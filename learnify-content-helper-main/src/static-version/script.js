
document.addEventListener('DOMContentLoaded', function() {
  // --- AUTENTICAÇÃO HTML ---
  // Login
  const loginForm = document.querySelector('#loginModal .login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      // Validação obrigatória
      if (!email || !password) {
        showNotification('Preencha todos os campos!', 'error');
        return;
      }
      if (!validateEmail(email)) {
        showNotification('Digite um e-mail válido!', 'error');
        return;
      }
      const storedUsers = localStorage.getItem('users');
      let users = [];
      try { users = storedUsers ? JSON.parse(storedUsers) : []; } catch { users = []; }
      const foundUser = users.find(user => user.email === email);
      if (!foundUser) {
        showNotification('Usuário não encontrado', 'error');
        return;
      }
      if (foundUser.password !== password) {
        showNotification('Senha incorreta', 'error');
        return;
      }
      if (foundUser.status && foundUser.status !== 'active') {
        showNotification('Usuário inativo. Contate o suporte.', 'error');
        return;
      }
      // Login OK
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', foundUser.role || 'usuario');
      showNotification('Login realizado com sucesso!');
      setTimeout(() => { window.location.href = '/'; }, 1200);
    });
    // Esqueceu senha
    const forgotLink = loginForm.querySelector('.forgot-password a');
    if (forgotLink) {
      forgotLink.addEventListener('click', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        if (!email) { showNotification('Digite seu e-mail para recuperar a senha', 'error'); return; }
        if (!validateEmail(email)) { showNotification('Digite um e-mail válido!', 'error'); return; }
        const storedUsers = localStorage.getItem('users');
        let users = [];
        try { users = storedUsers ? JSON.parse(storedUsers) : []; } catch { users = []; }
        const foundUser = users.find(user => user.email === email);
        if (!foundUser) {
          showNotification('Usuário não encontrado', 'error');
          return;
        }
        // Simula envio de senha para o email (alerta seguro)
        showNotification('Enviamos instruções para redefinir sua senha para o e-mail informado (simulação).', 'success');
        setTimeout(() => {
          alert('Senha cadastrada: ' + foundUser.password + '\n(Somente para demonstração. Em produção, envie um e-mail real!)');
        }, 1000);
      });
    }
  }

  // Login com Google
  window.handleGoogleLogin = function(response) {
    // Decodifica o token JWT do Google
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const userData = JSON.parse(jsonPayload);
    // Salva usuário Google em localStorage
    let users = [];
    try { users = JSON.parse(localStorage.getItem('users')) || []; } catch { users = []; }
    let foundUser = users.find(u => u.email === userData.email);
    if (!foundUser) {
      foundUser = { name: userData.name, email: userData.email, password: '', role: 'usuario', status: 'active', google: true };
      users.push(foundUser);
      localStorage.setItem('users', JSON.stringify(users));
    }
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', foundUser.role || 'usuario');
    showNotification('Login Google realizado com sucesso!');
    setTimeout(() => { window.location.href = '/'; }, 1200);
  }

  // Cadastro
  const signupForm = document.querySelector('#signupModal .login-form');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirm = document.getElementById('signup-confirm').value;
      const terms = document.getElementById('terms').checked;
      // Checar todos campos obrigatórios
      if (!name || !email || !password || !confirm) {
        showNotification('Preencha todos os campos', 'error'); return;
      }
      if (!validateEmail(email)) {
        showNotification('Digite um e-mail válido!', 'error'); return;
      }
      if (password.length < 5) {
        showNotification('A senha deve ter pelo menos 5 caracteres', 'error'); return;
      }
      if (password !== confirm) {
        showNotification('As senhas não coincidem', 'error'); return;
      }
      if (!terms) {
        showNotification('Você deve aceitar os Termos de Serviço e Política de Privacidade', 'error'); return;
      }
      const storedUsers = localStorage.getItem('users');
      let users = [];
      try { users = storedUsers ? JSON.parse(storedUsers) : []; } catch { users = []; }
      if (users.find(u => u.email === email)) {
        showNotification('E-mail já cadastrado', 'error'); return;
      }
      users.push({ name, email, password, role: 'usuario', status: 'active' });
      localStorage.setItem('users', JSON.stringify(users));
      // Login automático após cadastro
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'usuario');
      showNotification('Cadastro realizado! Redirecionando...');
      setTimeout(() => {
        document.getElementById('signupModal').classList.remove('active');
        window.location.href = '/';
      }, 1200);
      signupForm.reset();
    });
  }
  // Função para validar email
  function validateEmail(email) {
    return /^([\w-.]+)@([\w-]+\.)+[\w-]{2,}$/.test(email);
  }
  // --- FIM AUTENTICAÇÃO ---

  // Estado da aplicação
  const state = {
    selectedTool: null,
    history: [],
    response: {
      content: '',
      loading: false,
      error: null
    }
  };

  // Elementos DOM
  const toolCards = document.querySelectorAll('.tool-card');
  const selectedToolTitle = document.getElementById('selected-tool-title');
  const responseContent = document.getElementById('response-content');
  const inputArea = document.getElementById('input-area');
  const queryInput = document.getElementById('query-input');
  const youtubeInputContainer = document.getElementById('youtube-input-container');
  const fileInputContainer = document.getElementById('file-input-container');
  const youtubeUrl = document.getElementById('youtube-url');
  const fileUpload = document.getElementById('file-upload');
  const fileName = document.getElementById('file-name');
  const submitButton = document.getElementById('submit-button');
  const historyItems = document.getElementById('history-items');
  const clearHistoryButton = document.getElementById('clear-history');

  // Funções de utilidade
  function generateId() {
    return '_' + Math.random().toString(36).substring(2, 11);
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Funções para gerenciar o estado
  function selectTool(toolId) {
    state.selectedTool = toolId;
    state.response = {
      content: '',
      loading: false,
      error: null
    };
    
    updateUI();
  }

  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Mostrar notificação
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Remover notificação
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  function setLoading(isLoading) {
    state.response.loading = isLoading;
    updateUI();
  }

  function setResponse(content, error = null) {
    state.response = {
      content: content,
      loading: false,
      error: error
    };
    
    updateUI();
  }

  function addToHistory(query, response) {
    const historyItem = {
      id: generateId(),
      toolId: state.selectedTool,
      query: query,
      response: response,
      timestamp: new Date()
    };
    
    state.history.unshift(historyItem);
    updateUI();
  }

  function clearHistory() {
    state.history = [];
    updateUI();
    showNotification('Histórico limpo com sucesso!');
  }

  function selectHistoryItem(id) {
    const item = state.history.find(h => h.id === id);
    if (item) {
      state.selectedTool = item.toolId;
      state.response = {
        content: item.response,
        loading: false,
        error: null
      };
      updateUI();
    }
  }

  // Funções de UI
  function updateUI() {
    // Atualizar seleção de ferramenta
    toolCards.forEach(card => {
      if (card.dataset.id === state.selectedTool) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
    
    // Atualizar título da ferramenta selecionada
    if (state.selectedTool) {
      const selectedToolName = getToolName(state.selectedTool);
      selectedToolTitle.textContent = selectedToolName;
      inputArea.classList.remove('hidden');
      
      // Mostrar/esconder campos específicos por ferramenta
      if (state.selectedTool === 'youtube') {
        youtubeInputContainer.classList.remove('hidden');
      } else {
        youtubeInputContainer.classList.add('hidden');
      }
      
      // Mostrar/esconder upload de arquivo
      if (['essay', 'summarizer', 'code'].includes(state.selectedTool)) {
        fileInputContainer.classList.remove('hidden');
      } else {
        fileInputContainer.classList.add('hidden');
      }
    } else {
      selectedToolTitle.textContent = 'Selecione uma ferramenta para começar';
      inputArea.classList.add('hidden');
    }
    
    // Atualizar área de resposta
    if (state.response.loading) {
      responseContent.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    } else if (state.response.error) {
      responseContent.innerHTML = `<div class="error">${state.response.error}</div>`;
    } else {
      responseContent.innerHTML = state.response.content;
    }
    
    // Atualizar histórico
    renderHistory();
  }

  function renderHistory() {
    historyItems.innerHTML = '';
    
    if (state.history.length === 0) {
      historyItems.innerHTML = `
        <div class="empty-history">
          <p>Seu histórico aparecerá aqui</p>
        </div>
      `;
      return;
    }
    
    state.history.forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.classList.add('history-item');
      historyItem.dataset.id = item.id;
      
      historyItem.innerHTML = `
        <div class="history-item-title">${getToolName(item.toolId)}: ${item.query.substring(0, 30)}${item.query.length > 30 ? '...' : ''}</div>
        <div class="history-item-date">${formatDate(new Date(item.timestamp))}</div>
      `;
      
      historyItems.appendChild(historyItem);
    });
  }

  function getToolName(toolId) {
    const toolNames = {
      assistant: 'Assistente de Aprendizagem',
      generator: 'Gerador de Conteúdo',
      language: 'Idioma',
      essay: 'Ajudante de Ensaios',
      summarizer: 'Resumidor',
      code: 'Aprimorador de Código',
      youtube: 'Resumo do YouTube'
    };
    
    return toolNames[toolId] || 'Ferramenta';
  }

  // Evento para selecionar ferramenta
  toolCards.forEach(card => {
    card.addEventListener('click', function() {
      selectTool(this.dataset.id);
    });
  });

  // Evento para submeter consulta
  submitButton.addEventListener('click', function() {
    const text = queryInput.value.trim();
    const ytUrl = youtubeUrl.value.trim();
    const file = fileUpload.files[0];
    
    if (!text && !file && !ytUrl) {
      showNotification('Por favor, forneça algum conteúdo para processar.', 'error');
      return;
    }
    
    // Mostrar loading
    setLoading(true);
    
    // Simular chamada de API
    setTimeout(() => {
      const toolName = getToolName(state.selectedTool);
      
      // Criar resposta simulada
      let mockResponse = '';
      
      if (text) {
        mockResponse = `<h3>Resposta do ${toolName}</h3><p>Aqui está uma resposta para: "${text}"</p>`;
        
        if (file) {
          mockResponse += `<p>Arquivo processado: ${file.name}</p>`;
        }
        
        if (ytUrl) {
          mockResponse += `<p>Link do YouTube analisado: ${ytUrl}</p>`;
        }
        
        // Adicionar conteúdo específico por ferramenta
        switch(state.selectedTool) {
          case 'assistant':
            mockResponse += "<p>Como assistente, posso explicar conceitos, responder perguntas e fornecer informações detalhadas sobre qualquer assunto.</p>";
            break;
          case 'generator':
            mockResponse += "<p>Como gerador de conteúdo, posso criar poemas, artigos de blog e ensaios completos com base nas suas instruções.</p>";
            break;
          case 'language':
            mockResponse += "<p>Como ferramenta de idioma, posso traduzir textos, verificar gramática e ortografia, e ajudar com a fluência em diferentes línguas.</p>";
            break;
          case 'essay':
            mockResponse += "<p>Como ajudante de ensaios, posso aprimorar a estrutura, clareza e estilo dos seus textos acadêmicos, além de parafrasear conteúdo.</p>";
            break;
          case 'summarizer':
            mockResponse += "<p>Como resumidor, posso condensar textos longos, extrair os pontos principais e identificar palavras-chave importantes.</p>";
            break;
          case 'code':
            mockResponse += "<p>Como aprimorador de código, posso otimizar, refatorar e corrigir problemas no seu código, além de sugerir melhorias de performance.</p>";
            break;
          case 'youtube':
            mockResponse += "<p>Como resumidor de YouTube, posso analisar vídeos e fornecer sínteses claras do conteúdo, pontos principais e conclusões.</p>";
            break;
        }
      } else if (file) {
        mockResponse = `<h3>Arquivo Processado</h3><p>Analisamos seu arquivo: ${file.name}</p>`;
      } else if (ytUrl) {
        mockResponse = `<h3>Resumo do Vídeo</h3><p>Analisamos o vídeo: ${ytUrl}</p><p>Este é um resumo simulado do conteúdo do vídeo. Em uma implementação real, extrairíamos informações do vídeo do YouTube.</p>`;
      }
      
      // Atualizar estado
      setResponse(mockResponse);
      
      // Adicionar ao histórico
      addToHistory(text || file?.name || ytUrl || "Solicitação", mockResponse);
      
      // Limpar campos
      queryInput.value = '';
      youtubeUrl.value = '';
      fileUpload.value = '';
      fileName.textContent = 'Nenhum arquivo selecionado';
      
      // Mostrar notificação
      showNotification('Resposta gerada com sucesso!');
    }, 1500);
  });

  // Evento para limpar histórico
  clearHistoryButton.addEventListener('click', clearHistory);

  // Evento para selecionar item do histórico
  historyItems.addEventListener('click', function(e) {
    const item = e.target.closest('.history-item');
    if (item) {
      selectHistoryItem(item.dataset.id);
    }
  });

  // Evento para exibir nome do arquivo selecionado
  fileUpload.addEventListener('change', function() {
    if (this.files.length > 0) {
      fileName.textContent = this.files[0].name;
    } else {
      fileName.textContent = 'Nenhum arquivo selecionado';
    }
  });

  // Inicializar UI
  updateUI();

  // Adicionar CSS para notificações
  const style = document.createElement('style');
  style.textContent = `
    .notification {
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 12px 24px;
      background-color: white;
      border-left: 4px solid var(--primary);
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateX(120%);
      transition: transform 0.3s ease;
      z-index: 1000;
    }
    
    .notification-success {
      border-left-color: #10b981;
    }
    
    .notification-error {
      border-left-color: #ef4444;
    }
    
    .notification.show {
      transform: translateX(0);
    }
  `;
  document.head.appendChild(style);
});
