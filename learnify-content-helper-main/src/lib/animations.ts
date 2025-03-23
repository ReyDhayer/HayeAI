
import { useEffect, useState } from "react";

export const useFadeIn = (delay = 0) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return isVisible ? 'animate-fade-in opacity-100' : 'opacity-0';
};

export const useSequentialFadeIn = (index: number, baseDelay = 100) => {
  return useFadeIn(baseDelay * index);
};

export const staggeredAnimation = (index: number, baseDelay = 100) => {
  return {
    animationDelay: `${index * baseDelay}ms`,
  };
};
