import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ParticleEffectProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
  originX?: number;
  originY?: number;
  colors?: string[];
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({ 
  active, 
  duration = 1000, 
  particleCount = 30,
  originX = 50,
  originY = 50,
  colors = ['#166bb3', '#4a6fa5', '#90cdf4']
}) => {
  const [particles, setParticles] = useState<React.ReactNode[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (active) {
      const newParticles = [];
      
      for (let i = 0; i < particleCount; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * 360;
        const distance = 30 + Math.random() * 70;
        const size = 3 + Math.random() * 4;
        const duration = 0.5 + Math.random() * 0.5;
        
        // Calcular posição final com base no ângulo e distância
        const finalX = originX + Math.cos(angle * Math.PI / 180) * distance;
        const finalY = originY + Math.sin(angle * Math.PI / 180) * distance;

        newParticles.push(
          <motion.div
            key={i}
            className="particle"
            initial={{ 
              x: originX,
              y: originY,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              opacity: 1
            }}
            animate={{ 
              x: finalX,
              y: finalY,
              opacity: 0
            }}
            transition={{ 
              duration,
              ease: [0.32, 0.72, 0, 1]
            }}
            style={{ 
              position: 'absolute',
              borderRadius: '50%',
              zIndex: 9999
            }}
          />
        );
      }

      setParticles(newParticles);
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, particleCount, originX, originY, colors]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="particles-container"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {particles}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ParticleEffect;