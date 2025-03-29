
import React, { useState } from "react";
import { useFadeIn } from "@/lib/animations";
import { Settings } from "lucide-react";
import SettingsMenu from "./SettingsMenu";

const Header = () => {
  const fadeIn = useFadeIn(100);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userSettings, setUserSettings] = useState(() => {
    const savedSettings = localStorage.getItem('userSettings');
    return savedSettings ? JSON.parse(savedSettings) : null;
  });

  React.useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent) => {
      setUserSettings(prev => ({ ...prev, [event.detail.key]: event.detail.value }));
    };
    window.addEventListener('settingsUpdate', handleSettingsUpdate as EventListener);
    return () => window.removeEventListener('settingsUpdate', handleSettingsUpdate as EventListener);
  }, []);
  
  return (
    <header className={`w-full py-6 px-8 ${fadeIn}`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-blue-500 opacity-70 rounded-full blob"></div>
            <div className="absolute inset-1 bg-white dark:bg-black rounded-full flex items-center justify-center">
              <span className="text-blue-500 font-bold text-lg">AI</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gradient"> HayeAI</h1>
        </div>
        
        <nav>
          <ul className="flex space-x-6 items-center">
            {userSettings && (
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {userSettings.accountSettings.avatar ? (
                    <img src={userSettings.accountSettings.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{userSettings.accountSettings.name || 'Usuário'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{userSettings.accountSettings.status || 'Online'}</p>
                </div>
              </li>
            )}
            <li>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="text-foreground/70 hover:text-foreground transition-colors relative flex items-center gap-2 after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
              >
                <Settings className="w-5 h-5" />
                Configurações
              </button>
            </li>
            <li>
              <a 
                href="src/pages/inicio.html" 
                className="text-foreground/70 hover:text-foreground transition-colors relative after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
              >
                Início
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className="text-foreground/70 hover:text-foreground transition-colors relative after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
              >
                Ferramentas
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className="text-foreground/70 hover:text-foreground transition-colors relative after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
              >
                Histórico
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <SettingsMenu isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
};

export default Header;
