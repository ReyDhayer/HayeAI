import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiEffectProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ 
  active, 
  duration = 3000, 
  particleCount = 100 
}) => {
  const [particles, setParticles] = useState<React.ReactNode[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (active) {
      const newParticles = [];
      const colors = ['#166bb3', '#4a6fa5', '#90cdf4', '#ffc107', '#28a745', '#dc3545'];
      const shapes = ['square', 'circle', 'triangle'];

      for (let i = 0; i < particleCount; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const left = `${Math.random() * 100}%`;
        const size = `${Math.random() * 10 + 5}px`;
        const delay = `${Math.random() * 0.5}s`;
        const duration = `${Math.random() * 2 + 2}s`;

        newParticles.push(
          <motion.div
            key={i}
            className={`confetti ${shape}`}
            initial={{ 
              top: '-10px', 
              left, 
              width: size, 
              height: size, 
              backgroundColor: shape === 'triangle' ? 'transparent' : color,
              borderBottom: shape === 'triangle' ? `${parseInt(size) * 2}px solid ${color}` : 'none',
              opacity: 1,
              rotate: 0
            }}
            animate={{ 
              top: '100vh', 
              rotate: Math.random() * 360,
              opacity: 0 
            }}
            transition={{ 
              duration: parseFloat(duration), 
              delay: parseFloat(delay),
              ease: 'easeOut' 
            }}
            style={{ 
              position: 'absolute',
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
  }, [active, duration, particleCount]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="confetti-container"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {particles}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfettiEffect;