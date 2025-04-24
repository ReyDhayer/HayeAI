
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Testimonial = {
  content: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
};

const testimonials: Testimonial[] = [
  {
    content: "O HayeAI me ajudou muito durante meu TCC! As explicações são claras e o suporte para escrita acadêmica é incrível. Consegui melhorar muito minha produção científica.",
    author: "Maria Alves",
    role: "Estudante de Engenharia",
    avatar: "MA",
    rating: 5,
  },
  {
    content: "O assistente de matemática salvou meu semestre. Recebi explicações detalhadas passo a passo que me ajudaram a entender conceitos complexos de cálculo.",
    author: "Pedro Santos",
    role: "Estudante de Física",
    avatar: "PS",
    rating: 5,
  },
  {
    content: "Como professora, uso o HayeAI para criar planos de aula e material didático. Economizo horas de trabalho e consigo oferecer conteúdo personalizado aos alunos.",
    author: "Ana Oliveira",
    role: "Professora de Biologia",
    avatar: "AO",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const nextTestimonial = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setDirection('right');
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        setIsAnimating(false);
      }, 300);
    }
  };

  const prevTestimonial = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setDirection('left');
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
        setIsAnimating(false);
      }, 300);
    }
  };

  useEffect(() => {
    // Auto-rotate testimonials
    const autoRotate = setInterval(() => {
      nextTestimonial();
    }, 6000);

    return () => clearInterval(autoRotate);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -100px 0px"
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section ref={sectionRef} id="depoimentos" className="py-16 md:py-24 px-6 md:px-10 bg-gray-50 relative overflow-hidden opacity-100">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <svg className="absolute top-0 right-0 text-blue-100 w-32 h-32 md:w-64 md:h-64" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path d="M39.5,-65.6C52.9,-60.5,66.8,-52.8,73.1,-41.2C79.4,-29.5,78,-14.8,74.9,-1.8C71.8,11.2,66.9,22.4,60.5,32.2C54.1,42,46,50.4,36.3,56.9C26.6,63.5,15.3,68.3,3.3,64.1C-8.7,60,-20.4,47,-30.9,37.1C-41.5,27.3,-51,20.6,-58.4,10C-65.9,-0.6,-71.4,-14.9,-68.7,-27.4C-66,-39.9,-55.1,-50.6,-42.8,-56.2C-30.5,-61.8,-16.8,-62.4,-2.2,-59.3C12.3,-56.2,26.1,-50.6,39.5,-45.6C52.9,-40.6,66.8,-35.6,73.1,-26.5C79.4,-17.4,78,-8.7,74.9,-0.1C71.8,8.5,66.9,17,60.5,24.5C54.1,32,46,38.5,36.3,42.5C26.6,46.6,13.3,48.3,1.3,46.6C-10.7,45,-21.4,40,-31.9,34.1C-42.5,28.3,-53,21.6,-58.4,11.6C-63.9,1.6,-64.4,-11.8,-60.7,-23.4C-57,-35,-49.1,-44.9,-39.3,-50.5C-29.5,-56.1,-17.8,-57.4,-5.7,-59.7C6.3,-62,12.6,-65.3,20.9,-65.3C29.3,-65.2,39.5,-61.8,46.3,-55.5Z" transform="translate(100 100)" />
        </svg>
        <svg className="absolute bottom-0 left-0 text-purple-100 w-32 h-32 md:w-64 md:h-64" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path d="M45.3,-76.2C59.9,-69.5,73.5,-59.2,81.2,-45.4C88.8,-31.6,90.5,-14.3,88.3,1.9C86.2,18.1,80.2,33.3,71.2,46.5C62.3,59.7,50.3,71,36.1,76.1C21.9,81.3,5.5,80.3,-11.4,78.7C-28.2,77.2,-45.3,75.1,-58.1,66.5C-70.8,57.9,-79,42.8,-83,27.1C-87,11.4,-86.8,-4.9,-81.7,-19.3C-76.7,-33.6,-66.9,-46,-54.8,-53.4C-42.6,-60.8,-28.1,-63.1,-14.4,-70C-0.7,-76.9,12.1,-88.3,26.3,-89.5C40.5,-90.7,55.9,-81.7,70.3,-69.7C84.7,-57.6,98,-42.4,101.5,-25.5C105,-8.6,98.7,10,90.9,27.2C83.1,44.3,73.9,60.1,60,67.8C46.1,75.6,27.6,75.4,11.1,71.3C-5.3,67.2,-19.8,59.1,-32.9,50.9C-46,42.7,-57.7,34.3,-66.2,22.8C-74.7,11.2,-80,-3.6,-79.7,-18.5C-79.5,-33.4,-73.6,-48.5,-63.4,-58.3C-53.1,-68.1,-38.5,-72.6,-23.9,-76.5C-9.2,-80.3,5.4,-83.6,18.4,-80.6C31.4,-77.5,42.9,-68.2,53.8,-58.1C64.8,-48,75.3,-37.1,77.9,-24.8C80.6,-12.5,75.4,1.2,70.1,14.5C64.7,27.8,59.2,40.7,49.7,49.7C40.3,58.8,27,63.9,12.8,68.6C-1.4,73.2,-16.5,77.3,-30.4,74.6C-44.4,71.9,-57.1,62.3,-67,50C-76.9,37.7,-83.9,22.7,-87.3,6.3C-90.6,-10,-90.3,-27.7,-83.5,-42.6C-76.7,-57.5,-63.5,-69.6,-48.4,-76.8C-33.3,-84,-16.6,-86.3,-0.6,-85.4C15.5,-84.5,30.9,-80.3,42,-72.4C53.1,-64.4,59.9,-52.6,69.9,-40.4C80,-28.1,93.2,-15.5,97.1,-0.6C101,14.3,95.6,30.7,86.7,44C77.8,57.3,65.4,67.6,51.2,73.4C36.9,79.3,20.9,80.7,5.6,78.5C-9.7,76.3,-24.4,70.5,-37.6,63C-50.8,55.4,-62.6,46.1,-70.2,34C-77.9,21.9,-81.5,7.2,-80.9,-7.3C-80.2,-21.8,-75.4,-36,-66.8,-47.9C-58.1,-59.8,-45.6,-69.3,-31.7,-75.7C-17.8,-82,-2.5,-85.2,12.3,-86.5C27.1,-87.8,41.5,-87.3,53.4,-81.1C65.2,-74.9,74.6,-63.1,82.1,-49.6C89.7,-36,95.3,-20.7,96.7,-4.6C98.1,11.5,95.3,28.3,87.5,42.1C79.8,55.9,67.2,66.7,53,73.1C38.8,79.6,23,81.7,7.5,79.3C-8.1,77,-23.3,70.1,-37,62.1C-50.6,54.1,-62.7,44.9,-70.8,32.9C-79,20.9,-83.2,6,-81.3,-7.9C-79.5,-21.7,-71.7,-34.6,-62,-44.9C-52.4,-55.3,-41,-63.2,-28.3,-70.5C-15.6,-77.9,-1.6,-84.6,11.3,-85.1C24.2,-85.6,35.9,-79.9,48.1,-73.2C60.3,-66.6,73,-59,79.3,-47.6C85.6,-36.1,85.7,-20.8,85.8,-5.5" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="text-center mb-12">
        <div className="inline-block bg-blue-100 text-[#6366F1] px-4 py-1 rounded-full text-sm font-medium mb-4">
          Depoimentos
        </div>
        <h2 className="text-3xl md:text-4xl font-bold">
          O Que Nossos <span className="text-gradient">Clientes</span> Dizem
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mt-4">
          Veja como o HayeAI tem transformado a pesquisa educacional em instituições de todo o país.
        </p>
      </div>

      <div className="max-w-4xl mx-auto relative">
        <Card className="border-0 shadow-xl hover-lift">
          <CardContent className="p-8 md:p-12">
            <div className="flex justify-center mb-4">
              {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            <blockquote className={cn(
              "text-lg md:text-xl text-gray-700 mb-8 italic text-center transition-all duration-300",
              isAnimating && (direction === 'left' ? 'opacity-0 -translate-x-12' : 'opacity-0 translate-x-12'),
              !isAnimating && 'opacity-100 translate-x-0'
            )}>
              "{testimonials[currentIndex].content}"
            </blockquote>

            <div className="flex items-center justify-center">
              <div className={cn(
                "bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white h-12 w-12 rounded-full flex items-center justify-center text-xl font-semibold shadow-lg",
                isAnimating ? 'scale-50 opacity-0' : 'scale-100 opacity-100',
                'transition-all duration-300'
              )}>
                {testimonials[currentIndex].avatar}
              </div>
              <div className={cn(
                "ml-4 text-left",
                isAnimating ? 'opacity-0' : 'opacity-100',
                'transition-all duration-300'
              )}>
                <p className="font-semibold">{testimonials[currentIndex].author}</p>
                <p className="text-gray-500 text-sm">{testimonials[currentIndex].role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-6">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-white border-gray-200 shadow-md hover:bg-[#6366F1] hover:text-white transition-all duration-300"
            onClick={prevTestimonial}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-6">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-white border-gray-200 shadow-md hover:bg-[#6366F1] hover:text-white transition-all duration-300"
            onClick={nextTestimonial}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              index === currentIndex ? "bg-[#6366F1] w-6" : "bg-gray-300 w-2 hover:bg-gray-400"
            )}
            aria-label={`Ver depoimento ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
