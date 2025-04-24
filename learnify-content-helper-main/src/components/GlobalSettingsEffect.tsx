import { useEffect } from 'react';

/**
 * Aplica configurações globais de tema, idioma e modo leitura em todas as páginas.
 * Deve ser usado no topo da árvore de componentes (ex: em App.tsx ou main.tsx)
 */
export default function GlobalSettingsEffect() {
  useEffect(() => {
    // Carregar configurações do localStorage
    const settingsRaw = localStorage.getItem('userSettings');
    let settings: any = null;
    if (settingsRaw) {
      try {
        settings = JSON.parse(settingsRaw);
      } catch {
        settings = null;
      }
    }
    if (!settings) return;

    // Tema (aparência)
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (settings.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
      root.classList.toggle('light', !prefersDark);
    }

    // Idioma
    if (settings.language) {
      root.setAttribute('lang', settings.language);
    }

    // Modo leitura (aplica classes customizadas ou CSS vars)
    if (settings.readingMode) {
      // Exemplo: tamanho da fonte, espaçamento, família de fonte, alinhamento, esquema de cor
      root.style.setProperty('--reading-font-size', settings.readingMode.fontSize || 'medium');
      root.style.setProperty('--reading-line-spacing', settings.readingMode.lineSpacing || 'normal');
      root.style.setProperty('--reading-font-family', settings.readingMode.fontFamily || 'default');
      root.style.setProperty('--reading-text-align', settings.readingMode.textAlign || 'left');
      root.style.setProperty('--reading-color-scheme', settings.readingMode.colorScheme || 'default');
    }

    // Escutar mudanças em tempo real (opcional, via evento customizado)
    const handler = () => {
      // Força re-execução do efeito ao receber evento global
      window.location.reload();
    };
    window.addEventListener('settingsUpdate', handler);
    return () => window.removeEventListener('settingsUpdate', handler);
  }, []);

  return null;
}
