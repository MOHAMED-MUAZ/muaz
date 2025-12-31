import { useState, useCallback, useEffect, useRef } from 'react';

interface UseVoiceOptions {
  continuous?: boolean;
  language?: string;
}

interface UseVoiceReturn {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  lastResult: string;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, options?: SpeechOptions) => void;
  stopSpeaking: () => void;
  isSupported: boolean;
  clearTranscript: () => void;
}

interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export const useVoice = (options: UseVoiceOptions = {}): UseVoiceReturn => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResult, setLastResult] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) &&
    'speechSynthesis' in window;

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;
    
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = true;
    recognition.lang = options.language ?? 'en-US';

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        console.log('Final transcript:', finalTranscript);
        setLastResult(finalTranscript.trim());
        setTranscript(finalTranscript.trim());
      } else if (interimTranscript) {
        setTranscript(interimTranscript);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('Speech recognition error:', event.error);
      // Don't treat no-speech as a critical error
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported, options.continuous, options.language]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      console.log('Recognition not available');
      return;
    }
    
    // Stop any ongoing speech first
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
    
    setTranscript('');
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.log('Recognition already started or error:', error);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.log('Error stopping recognition:', error);
    }
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string, speechOptions: SpeechOptions = {}) => {
    if (!synthRef.current) {
      console.log('Speech synthesis not available');
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechOptions.rate ?? 0.9;
    utterance.pitch = speechOptions.pitch ?? 1;
    utterance.volume = speechOptions.volume ?? 1;
    utterance.lang = options.language ?? 'en-US';

    utterance.onstart = () => {
      console.log('Speaking:', text);
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.log('Speech error:', event);
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
  }, [options.language]);

  const stopSpeaking = useCallback(() => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsSpeaking(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setLastResult('');
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    lastResult,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isSupported,
    clearTranscript,
  };
};
