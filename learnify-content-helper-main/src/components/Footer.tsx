
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const elements = entry.target.querySelectorAll('.footer-animate');
          elements.forEach((el, index) => {
            setTimeout(() => {
              el.classList.add('fade-in');
              el.classList.remove('opacity-0');
            }, index * 100);
          });
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    if (footerRef.current) {
      observer.observe(footerRef.current);
    }
    
    return () => {
      if (footerRef.current) observer.unobserve(footerRef.current);
    };
  }, []);

  return (
    <footer ref={footerRef} className="bg-[#121826] text-white pt-16 pb-8 px-6 md:px-10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-20 bg-gradient-to-b from-[#1A1F2C] to-transparent opacity-30"></div>
        <div className="hidden md:block absolute top-20 right-20 w-32 h-32 rounded-full bg-[#6366F1] opacity-5 blur-xl"></div>
        <div className="hidden md:block absolute bottom-40 left-20 w-40 h-40 rounded-full bg-[#E16EDD] opacity-5 blur-xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          <div className="md:col-span-1 footer-animate opacity-0">
            <h3 className="text-[#6366F1] font-bold text-2xl mb-4 relative inline-block">
              HayeAI
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#6366F1] to-[#E16EDD]"></span>
            </h3>
            <p className="text-gray-400 mb-6">
              Revolucionando a forma de aprender com inteligência artificial avançada, tornando o conhecimento mais
              acessível e eficiente para todos.
            </p>
            <div className="flex space-x-4">
              {[
                { name: "Facebook", path: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" },
                { name: "Twitter", path: "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" },
                { name: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
                { name: "LinkedIn", path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" },
              ].map((social, index) => (
                <a key={index} href="#" className="bg-gray-800 hover:bg-[#6366F1] text-gray-400 hover:text-white h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 hover-scale" aria-label={social.name}>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="footer-animate opacity-0">
            <h3 className="text-lg font-semibold mb-4 relative inline-block">
              Navegação
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#6366F1] to-transparent"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Início", href: "#" },
                { name: "Ferramentas", href: "#recursos" },
                { name: "Planos", href: "#planos" },
                { name: "Suporte", href: "#" },
              ].map((link, index) => (
                <li key={index} className="transform hover:translate-x-1 transition-transform duration-300">
                  <a href={link.href} className="text-gray-400 hover:text-white flex items-center">
                    <svg className="w-3 h-3 mr-2 text-[#6366F1]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-animate opacity-0" style={{animationDelay: "100ms"}}>
            <h3 className="text-lg font-semibold mb-4 relative inline-block">
              Recursos
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#6366F1] to-transparent"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Tutoriais", href: "#" },
                { name: "Materiais", href: "#" },
                { name: "FAQ", href: "#" },
                { name: "Comunidade", href: "#" },
              ].map((link, index) => (
                <li key={index} className="transform hover:translate-x-1 transition-transform duration-300">
                  <a href={link.href} className="text-gray-400 hover:text-white flex items-center">
                    <svg className="w-3 h-3 mr-2 text-[#6366F1]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-animate opacity-0" style={{animationDelay: "200ms"}}>
            <h3 className="text-lg font-semibold mb-4 relative inline-block">
              Fique por dentro
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#6366F1] to-transparent"></span>
            </h3>
            <p className="text-gray-400 mb-4">
              Receba dicas de estudo, novidades sobre IA e conteúdo exclusivo.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 uppercase mb-1">NOME</label>
                <Input 
                  type="text" 
                  placeholder="Digite seu nome"
                  className="bg-[#1E293B] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#6366F1] focus:ring-[#6366F1]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 uppercase mb-1">EMAIL</label>
                <Input 
                  type="email" 
                  placeholder="Digite seu e-mail"
                  className="bg-[#1E293B] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#6366F1] focus:ring-[#6366F1]"
                />
              </div>
              <Button className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5355d1] hover:to-[#7B4CF5] hover-scale">
                ENVIAR
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm footer-animate opacity-0" style={{animationDelay: "300ms"}}>
          <p>© {new Date().getFullYear()} HayeAI. Todos os direitos reservados.</p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="#" className="text-gray-500 hover:text-gray-300">Termos de Uso</a>
            <a href="#" className="text-gray-500 hover:text-gray-300">Política de Privacidade</a>
            <a href="#" className="text-gray-500 hover:text-gray-300">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
