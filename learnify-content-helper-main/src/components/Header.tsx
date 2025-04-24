
import React, { useState } from "react";
import { useFadeIn } from "@/lib/animations";
import { Settings } from "lucide-react";
import SettingsMenu from "./SettingsMenu";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const fadeIn = useFadeIn(100);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userSettings, setUserSettings] = useState(() => {
    const savedSettings = localStorage.getItem('userSettings');
    return savedSettings ? JSON.parse(savedSettings) : null;
  });
  // Estado para menu mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent) => {
      setUserSettings(prev => ({ ...prev, [event.detail.key]: event.detail.value }));
    };
    window.addEventListener('settingsUpdate', handleSettingsUpdate as EventListener);
    return () => window.removeEventListener('settingsUpdate', handleSettingsUpdate as EventListener);
  }, []);
  
  return (
    <header className={`w-full py-4 px-4 md:py-6 md:px-8 ${fadeIn}`}>
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        <div className="flex items-center space-x-2 w-full md:w-auto justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-blue-500 opacity-70 rounded-full blob"></div>
              <div className="absolute inset-1 bg-white dark:bg-black rounded-full flex items-center justify-center">
                <span className="text-blue-500 font-bold text-lg">AI</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gradient"> HayeAI</h1>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 ml-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6 items-center">
            {/* --- navegação desktop --- */}
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
              <Link
                to="/inicio"
                className="text-foreground/70 hover:text-foreground transition-colors relative after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left w-full text-left"
              >
                Início
              </Link>
            </li>
            <li>
              <Link 
                to="/" 
                className="text-foreground/70 hover:text-foreground transition-colors relative after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
              >
                Ferramentas
              </Link>
            </li>
            <li>
              <Link 
                to="/painel-controle" 
                className="text-foreground/70 hover:text-foreground transition-colors relative after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
              >
                Conta
              </Link>
            </li>
            <li>
              <a 
                href="/jogos" 
                className="text-foreground/70 hover:text-foreground transition-colors relative after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
              >
          
              </a>
            </li>
          </ul>
        </nav>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex md:hidden">
            <div className="bg-white dark:bg-gray-900 w-64 h-full shadow-lg flex flex-col p-6 relative animate-slideInLeft">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
              <ul className="flex flex-col gap-6 mt-10">
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
                    <div>
                      <p className="text-sm font-medium">{userSettings.accountSettings.name || 'Usuário'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{userSettings.accountSettings.status || 'Online'}</p>
                    </div>
                  </li>
                )}
                <li>
                  <button onClick={() => { setIsSettingsOpen(true); setMobileMenuOpen(false); }} className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors">
                    <Settings className="w-5 h-5" /> Configurações
                  </button>
                </li>
               
                <li>
                  <Link to="/" className="text-foreground/70 hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Ferramentas
                  </Link>
                </li>
                <li>
                  <Link to="/painel-controle" className="text-foreground/70 hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Conta
                  </Link>
                </li>
                {/* <li>
                  <a href="/jogos" className="text-foreground/70 hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Jogos
                  </a>
                </li> */}
              </ul>
            </div>
            {/* Clique fora fecha o menu */}
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

      </div>
      <SettingsMenu isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
};

export default Header;
