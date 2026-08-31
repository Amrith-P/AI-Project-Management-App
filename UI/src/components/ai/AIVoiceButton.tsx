import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface AIVoiceButtonProps {
  onTranscript: (text: string) => void;
}

export const AIVoiceButton: React.FC<AIVoiceButtonProps> = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      setSupported(true);
    }
  }, []);

  const handleToggleListen = () => {
    if (!supported) {
      alert('Speech Recognition API is not supported in your browser.');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (err: any) => {
      console.error('[Speech Recognition Error]:', err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={handleToggleListen}
      title={isListening ? 'Listening... Click to stop' : 'Click to speak voice prompt'}
      className={`p-2 rounded-xl border transition-all ${
        isListening
          ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-lg shadow-rose-500/30'
          : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700 hover:bg-slate-700'
      }`}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
};
