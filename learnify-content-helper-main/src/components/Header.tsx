
import React from "react";
import { useFadeIn } from "@/lib/animations";

const Header = () => {
  const fadeIn = useFadeIn(100);
  
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
          <ul className="flex space-x-6">
            <li>
              <a 
                href="src\pages\inicio.html" 
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
    </header>
  );
};

export default Header;
