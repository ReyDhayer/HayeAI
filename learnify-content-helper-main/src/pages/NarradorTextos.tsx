import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Volume2, Settings, Download, Trash, Save, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import { toast } from 'sonner';

const NarradorTextos = () => {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [voice, setVoice] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [history, setHistory] = useState<{ text: string; date: string }[]>([]);
  const synth = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  React.useEffect(() => {
    // Verificar suporte à síntese de voz
    if (!('speechSynthesis' in window)) {
      toast.error('Seu navegador não suporta síntese de voz.');
      return;
    }

    // Verificar permissão de áudio
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(result => {
          if (result.state === 'denied') {
            toast.error('Permissão de áudio negada. Verifique as configurações do seu navegador.');
          }
        });
    }

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      if (availableVoices.length === 0) {
        toast.error('Nenhuma voz disponível. Verifique as configurações do seu navegador.');
        return;
      }
      setVoices(availableVoices);
      if (!voice) {
        const ptVoice = availableVoices.find(v => v.lang.startsWith('pt'));
        setVoice(ptVoice ? ptVoice.name : availableVoices[0].name);
      }
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Testar áudio
    const testAudio = new Audio();
    testAudio.play().catch(error => {
      if (error.name === 'NotAllowedError') {
        toast.error('Reprodução de áudio bloqueada. Verifique as permissões do navegador.');
      }
    });

    return () => {
      synth.cancel();
      testAudio.remove();
    };
  }, [voice]);

  const handlePlay = () => {
    if (text.trim() === '') {
      toast.error('Por favor, insira um texto para narrar.');
      return;
    }

    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
      return;
    }

    if (synth.paused) {
      synth.resume();
      setIsPlaying(true);
      return;
    }

    try {
      utteranceRef.current = new SpeechSynthesisUtterance(text);
      const selectedVoice = voices.find(v => v.name === voice);
      if (!selectedVoice) {
        toast.error('Voz selecionada não encontrada. Selecione outra voz.');
        return;
      }
      utteranceRef.current.voice = selectedVoice;
      utteranceRef.current.volume = volume;
      utteranceRef.current.rate = rate;

      utteranceRef.current.onend = () => {
        setIsPlaying(false);
      };

      utteranceRef.current.onerror = (event) => {
        console.error('Erro na síntese de voz:', event);
        toast.error('Erro ao reproduzir o áudio. Tente novamente.');
        setIsPlaying(false);
      };

      synth.speak(utteranceRef.current);
      setIsPlaying(true);
    } catch (error) {
      console.error('Erro ao iniciar a síntese de voz:', error);
      toast.error('Não foi possível iniciar a narração. Verifique as configurações de áudio.');
      setIsPlaying(false);
    }

    // Adicionar ao histórico
    const newHistoryItem = {
      text,
      date: new Date().toLocaleString('pt-BR')
    };
    setHistory(prev => [newHistoryItem, ...prev]);
  };

  const handleStop = () => {
    synth.cancel();
    setIsPlaying(false);
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!utteranceRef.current) {
      toast.error('Primeiro reproduza o texto para poder baixar o áudio');
      return;
    }

    try {
      setIsDownloading(true);
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const mediaStreamDest = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(mediaStreamDest.stream, {
        mimeType: 'audio/webm'
      });
      const audioChunks: BlobPart[] = [];

      // Criar um novo utterance para download
      const downloadUtterance = new SpeechSynthesisUtterance(text);
      downloadUtterance.voice = utteranceRef.current.voice;
      downloadUtterance.volume = volume;
      downloadUtterance.rate = rate;

      // Conectar o oscilador ao destino para manter o contexto de áudio ativo
      oscillator.connect(mediaStreamDest);
      oscillator.start();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        oscillator.stop();
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `narrador-texto-${new Date().getTime()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsDownloading(false);
        toast.success('Áudio baixado com sucesso!');
      };

      // Configurar intervalo de captura de dados
      mediaRecorder.start(100);
      
      // Iniciar a síntese de voz
      synth.speak(downloadUtterance);

      downloadUtterance.onend = () => {
        setTimeout(() => {
          mediaRecorder.stop();
          audioContext.close();
        }, 500); // Pequeno delay para garantir que todo o áudio seja capturado
      };

      // Tratamento de erro na síntese de voz
      downloadUtterance.onerror = (event) => {
        console.error('Erro na síntese de voz:', event);
        mediaRecorder.stop();
        audioContext.close();
        setIsDownloading(false);
        toast.error('Erro ao gerar o áudio. Por favor, tente novamente.');
      };
    } catch (error) {
      console.error('Erro ao baixar áudio:', error);
      toast.error('Erro ao gerar o áudio. Por favor, tente novamente.');
      setIsDownloading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-center mb-8">Narrador de Textos</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Texto para Narração</h2>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Cole ou digite seu texto aqui..."
                className="min-h-[200px] mb-4"
              />
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Select value={voice} onValueChange={setVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma voz" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((v) => (
                        <SelectItem key={v.name} value={v.name}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Volume2 size={20} />
                  <Slider
                    value={[volume * 100]}
                    onValueChange={(value) => setVolume(value[0] / 100)}
                    max={100}
                    step={1}
                    className="w-48"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Settings size={20} />
                  <Slider
                    value={[rate * 100]}
                    onValueChange={(value) => setRate(value[0] / 100)}
                    max={200}
                    min={50}
                    step={10}
                    className="w-48"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handlePlay}>
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    {isPlaying ? 'Pausar' : 'Reproduzir'}
                  </Button>
                 
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Histórico</h2>
                <Button variant="ghost" onClick={clearHistory}>
                  <Trash size={20} className="mr-2" />
                  Limpar
                </Button>
              </div>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {history.map((item, index) => (
                  <Card key={index} className="p-4">
                    <p className="text-sm text-muted-foreground mb-2">{item.date}</p>
                    <p className="line-clamp-2">{item.text}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setText(item.text)}
                      >
                        <Save size={16} className="mr-2" />
                        Carregar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default NarradorTextos;