import React, { useState } from 'react';
import { Settings, Moon, Sun, Globe, Bell, Type, Sparkles, Save, Keyboard, UserCircle, Trash2, Mail, BookOpen } from 'lucide-react';
import { UserSettings, defaultSettings } from '@/lib/types/settings';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const savedSettings = localStorage.getItem('userSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const event = new CustomEvent('settingsUpdate', { detail: { key, value } });
    window.dispatchEvent(event);

    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('userSettings', JSON.stringify(newSettings));
      
      if (key === 'theme') {
        const root = document.documentElement;
        if (value === 'dark') {
          root.classList.add('dark');
          root.classList.remove('light');
        } else if (value === 'light') {
          root.classList.add('light');
          root.classList.remove('dark');
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.classList.toggle('dark', prefersDark);
          root.classList.toggle('light', !prefersDark);
        }
      }
      
      return newSettings;
    });
  };

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (settings.theme === 'system') {
        const root = document.documentElement;
        root.classList.toggle('dark', mediaQuery.matches);
        root.classList.toggle('light', !mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    handleChange();

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl transform transition-transform duration-300 ease-in-out shadow-2xl border-l border-white/20 z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="p-6 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Configurações
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {/* Perfil e Status */}
          <div className="setting-group mb-6">
            <div className="flex flex-col items-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-3">
                {settings.accountSettings.avatar ? (
                  <img
                    src={settings.accountSettings.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-full h-full text-gray-400" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      updateSetting('accountSettings', { ...settings.accountSettings, avatar: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-2 mb-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <input
                type="text"
                value={settings.accountSettings.status}
                onChange={(e) => updateSetting('accountSettings', { ...settings.accountSettings, status: e.target.value })}
                className="w-full bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-2"
                placeholder="Digite seu status..."
              />
            </div>
          </div>

          {/* Códigos Promocionais */}
          <div className="setting-group mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Códigos Promocionais
            </h3>
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite o código promocional"
                    className="flex-1 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-2 transition-all"
                    onChange={(e) => {
                      const code = e.target.value.toUpperCase();
                      const isValidFormat = /^[A-Z0-9]{4,12}$/.test(code);
                      e.target.className = `flex-1 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-2 transition-all ${isValidFormat ? 'border-2 border-green-500' : code.length > 0 ? 'border-2 border-red-500' : ''}`;
                    }}
                  />
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                      const code = input.value.toUpperCase();
                      const isValidFormat = /^[A-Z0-9]{4,12}$/.test(code);
                      
                      if (isValidFormat) {
                        // Simular verificação do código
                        const isValid = Math.random() > 0.5;
                        if (isValid) {
                          updateSetting('accountSettings', {
                            ...settings.accountSettings,
                            premium: true,
                            premiumFeatures: [...(settings.accountSettings.premiumFeatures || []), 'premium_theme']
                          });
                          alert('Código resgatado com sucesso! Recursos premium desbloqueados.');
                          input.value = '';
                        } else {
                          alert('Código inválido ou já utilizado.');
                        }
                      } else {
                        alert('Formato de código inválido. Use 4-12 caracteres alfanuméricos.');
                      }
                    }}
                  >
                    Resgatar
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Digite um código com 4-12 caracteres (letras e números)
                </p>
              </div>
            </div>
          </div>

          {/* Notificações */}
          <div className="setting-group mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Ativar notificações</span>
                <button
                  onClick={() => updateSetting('notifications', !settings.notifications)}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.notifications ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'} relative`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.notifications ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              {settings.notifications && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email</span>
                    <button
                      onClick={() => updateSetting('notificationTypes', { ...settings.notificationTypes, email: !settings.notificationTypes.email })}
                      className={`w-10 h-5 rounded-full transition-colors ${settings.notificationTypes.email ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'} relative`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${settings.notificationTypes.email ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Plataforma</span>
                    <button
                      onClick={() => updateSetting('notificationTypes', { ...settings.notificationTypes, platform: !settings.notificationTypes.platform })}
                      className={`w-10 h-5 rounded-full transition-colors ${settings.notificationTypes.platform ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'} relative`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${settings.notificationTypes.platform ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gerenciamento de Conta */}
          <div className="setting-group mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <UserCircle className="w-5 h-5" />
              Gerenciamento de Conta
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm">Nome</label>
                <input
                  type="text"
                  value={settings.accountSettings.name}
                  onChange={(e) => updateSetting('accountSettings', { ...settings.accountSettings, name: e.target.value })}
                  className="bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-2"
                  placeholder="Seu nome"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm">Email</label>
                <input
                  type="email"
                  value={settings.accountSettings.email}
                  onChange={(e) => updateSetting('accountSettings', { ...settings.accountSettings, email: e.target.value })}
                  className="bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-2"
                  placeholder="seu@email.com"
                />
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Nível {settings.accountSettings.level}</span>
                    {settings.accountSettings.premium && (
                      <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-xs font-medium rounded-full">Premium</span>
                    )}
                  </div>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{settings.accountSettings.points} pontos</span>
                </div>
                <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-blue-500 rounded-full transition-all duration-300 ease-out transform origin-left"
                    style={{
                      width: `${(settings.accountSettings.points % 100)}%`,
                      animation: 'progress-pulse 2s ease-in-out infinite'
                    }}
                  />
                  <style>{`
                    @keyframes progress-pulse {
                      0%, 100% { opacity: 1; }
                      50% { opacity: 0.7; }
                    }
                  `}</style>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {100 - (settings.accountSettings.points % 100)} pontos para o próximo nível
                </p>
              </div>
            </div>
          </div>

          {/* Aparência */}
          <div className="setting-group mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Sun className="w-5 h-5" />
              Aparência
            </h3>
            <div className="flex gap-3">
              {['light', 'dark', 'system'].map((theme) => (
                <button
                  key={theme}
                  onClick={() => updateSetting('theme', theme as UserSettings['theme'])}
                  className={`px-4 py-2 rounded-lg flex-1 transition-all ${settings.theme === theme ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Idioma */}
          <div className="setting-group mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Idioma
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('language', 'pt-BR')}
                className={`px-4 py-2 rounded-lg flex-1 transition-all ${settings.language === 'pt-BR' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                Português
              </button>
              <button
                onClick={() => updateSetting('language', 'en-US')}
                className={`px-4 py-2 rounded-lg flex-1 transition-all ${settings.language === 'en-US' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                English
              </button>
            </div>
          </div>

          {/* Modo de Leitura */}
          <div className="setting-group mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Modo de Leitura
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  <span>Fonte</span>
                </div>
                <select
                  value={settings.readingMode.fontFamily}
                  onChange={(e) => updateSetting('readingMode', { ...settings.readingMode, fontFamily: e.target.value as UserSettings['readingMode']['fontFamily'] })}
                  className="bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="default">Padrão</option>
                  <option value="serif">Serif</option>
                  <option value="sans-serif">Sans Serif</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  <span>Espaçamento</span>
                </div>
                <select
                  value={settings.readingMode.lineSpacing}
                  onChange={(e) => updateSetting('readingMode', { ...settings.readingMode, lineSpacing: e.target.value as UserSettings['readingMode']['lineSpacing'] })}
                  className="bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="compact">Compacto</option>
                  <option value="normal">Normal</option>
                  <option value="relaxed">Relaxado</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;