import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";

import { useFadeIn } from '@/lib/animations';

const NotFound = () => {
  const fadeIn = useFadeIn(100);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/src/pages/inicio.html") {
      console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname
      );
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
    
      <main className={`min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 ${fadeIn}`}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        >
          <motion.h1 
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20 
          }}
          className="text-6xl font-bold text-gray-800 mb-6"
        >
          404
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-600 mb-8"
        >
         Opaa! Essa página que você procura não existe.
        </motion.p>
        <Link
  to="/inicio"
  className="inline-block px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 transform hover:scale-105"
>
Voltar para Casa
</Link>
      </motion.div>
      </main>
    </div>
  );
};

export default NotFound;
