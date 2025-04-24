import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-10 flex justify-between items-center transition-all duration-300",
      scrolled ? "bg-white/90 backdrop-blur shadow-md py-3" : "bg-transparent py-4"
    )}>
      <div className="flex items-center">
        <Link to="/" className="relative group">
          <h1 className={cn(
            "text-3xl font-bold transition-all duration-300 text-gradient"
          )}>
            HayeAI
          </h1>
          <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-[#6366F1] to-[#E16EDD] transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></div>
        </Link>
      </div>

      {/* Mobile menu button */}
      <button 
        className="md:hidden text-gray-700 focus:outline-none" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Desktop navigation */}
      <div className="hidden md:flex items-center space-x-8">
        {[
          { name: "Recursos", href: "#recursos" },
          { name: "Como Funciona", href: "#como-funciona" },
          { name: "Planos", href: "#planos" },
          { name: "Depoimentos", href: "#depoimentos" },
         
        ].map((item, index) => (
          item.href.startsWith('#') ? (
            <a 
              key={index}
              href={item.href} 
              className={cn(
                "relative group transition-colors duration-300",
                scrolled ? "text-gray-700 hover:text-[#6366F1]" : "text-gray-700 hover:text-[#6366F1]"
              )}
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#6366F1] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </a>
          ) : (
            <Link 
              key={index}
              to={item.href} 
              className={cn(
                "relative group transition-colors duration-300",
                scrolled ? "text-gray-700 hover:text-[#6366F1]" : "text-gray-700 hover:text-[#6366F1]"
              )}
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#6366F1] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
          )
        ))}
      </div>

      {/* Auth buttons */}
      <div className="hidden md:flex items-center space-x-4">
        <Button variant="ghost" className="text-[#6366F1] hover:bg-[#6366F1]/10 hover-scale">
          Entrar
        </Button>
        <Button className="bg-[#6366F1] text-white hover:bg-[#5355d1] hover-scale shadow-sm">
          Cadastrar
        </Button>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        "absolute top-full left-0 right-0 bg-white shadow-lg md:hidden transition-all duration-300 ease-in-out",
        isMenuOpen ? "max-h-screen opacity-100 py-4" : "max-h-0 opacity-0 py-0 overflow-hidden"
      )}>
        <div className="px-6 flex flex-col space-y-4">
          <a href="#recursos" className="text-gray-700 hover:text-[#6366F1] py-2">Recursos</a>
          <a href="#como-funciona" className="text-gray-700 hover:text-[#6366F1] py-2">Como Funciona</a>
          <a href="#planos" className="text-gray-700 hover:text-[#6366F1] py-2">Planos</a>
          <a href="#depoimentos" className="text-gray-700 hover:text-[#6366F1] py-2">Depoimentos</a>
          <Link to="/all-in-one" className="text-gray-700 hover:text-[#6366F1] py-2">Visão Completa</Link>
          <Link to="/single-file" className="text-gray-700 hover:text-[#6366F1] py-2">Versão Single-File</Link>
          
          <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
            <Button variant="ghost" className="btn-secondary justify-center">
              Entrar
            </Button>
            <Button className="btn-primary justify-center">
              Cadastrar
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
