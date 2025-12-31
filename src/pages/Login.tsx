import { useState, useEffect, useRef } from 'react';
import { Mic, LogIn, UserPlus, HelpCircle, Eye, EyeOff, BookOpen, GraduationCap, Award, Lightbulb } from 'lucide-react';

type AuthMode = 'welcome' | 'login' | 'register' | 'help';

// Custom hook for voice recognition with ZERO delay
const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResult, setLastResult] = useState('');
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const shouldRestartRef = useRef(true);

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);

      if (event.results[current].isFinal) {
        setLastResult(transcriptText);
        console.log('✅ Final result:', transcriptText);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      console.log('🔴 Recognition ended');
      setIsListening(false);
      
      // INSTANT restart if should continue listening
      if (shouldRestartRef.current && !synthRef.current?.speaking) {
        setTimeout(() => {
          try {
            recognition.start();
            setIsListening(true);
            console.log('🎤 Auto-restarted immediately');
          } catch (e) {
            console.log('Recognition restart skipped');
          }
        }, 100);
      }
    };

    synthRef.current = window.speechSynthesis;

    return () => {
      shouldRestartRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Recognition already stopped');
        }
      }
    };
  }, [isSupported]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setLastResult('');
      shouldRestartRef.current = true;
      try {
        recognitionRef.current.start();
        setIsListening(true);
        console.log('🎤 Started listening');
      } catch (e) {
        console.error('Error starting recognition:', e);
      }
    }
  };

  const stopListening = () => {
    shouldRestartRef.current = false;
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        console.log('⏹️ Stopped listening');
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
  };

  const speak = (text: string, callback?: () => void) => {
    if (synthRef.current) {
      // Stop listening immediately when speaking starts
      if (isListening) {
        shouldRestartRef.current = false;
        recognitionRef.current?.stop();
      }

      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log('🔊 Speaking started');
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        console.log('🔇 Speaking ended');
        
        // IMMEDIATE restart - NO DELAY
        shouldRestartRef.current = true;
        if (recognitionRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
              setIsListening(true);
              console.log('🎤 Mic restarted INSTANTLY after speech');
            } catch (e) {
              console.log('Restart handled by onend');
            }
          }, 50); // Minimal 50ms delay just for speech synthesis cleanup
        }
        
        if (callback) callback();
      };

      synthRef.current.speak(utterance);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setLastResult('');
  };

  return {
    isListening,
    isSpeaking,
    transcript,
    lastResult,
    startListening,
    stopListening,
    speak,
    isSupported,
    clearTranscript,
  };
};

// Audio feedback
const playTone = (type: string) => {
  if (typeof window === 'undefined') return;

  const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return;

  try {
    const audioContext = new AudioCtx();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const frequencies: Record<string, number> = {
      start: 800,
      notification: 600,
      success: 1000,
      error: 400,
      click: 500,
    };

    oscillator.frequency.value = frequencies[type] || 600;
    gainNode.gain.value = 0.15;

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch (e) {
    console.error('Audio error:', e);
  }
};

// Enhanced AI Robot with glassmorphism
const AIRobot = ({ status }: { status: 'idle' | 'listening' | 'speaking' }) => {
  const isListening = status === 'listening';
  const isSpeaking = status === 'speaking';

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow */}
      <div
        className={`
          absolute w-80 h-80 rounded-full blur-3xl opacity-50
          transition-all duration-700
          ${
            isListening
              ? 'bg-emerald-400/70 scale-125 animate-pulse'
              : isSpeaking
              ? 'bg-blue-400/70 scale-125'
              : 'bg-purple-400/50 scale-100'
          }
        `}
      />

      {/* Glassmorphism robot card */}
      <div
        className={`
          relative w-72 h-96 rounded-[2.5rem]
          bg-white/10 backdrop-blur-2xl
          border-2 border-white/30
          shadow-[0_8px_32px_0_rgba(138,43,226,0.37)]
          overflow-hidden flex flex-col items-center justify-between p-6
          transition-all duration-500
          ${
            isListening || isSpeaking
              ? 'scale-105 shadow-[0_12px_48px_0_rgba(138,43,226,0.5)]'
              : 'scale-100'
          }
        `}
      >
        {/* Floating gradient orbs inside card */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-400/30 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-400/30 rounded-full blur-2xl animate-float-delayed" />

        {/* Status indicator */}
        <div className="relative z-10 px-6 py-3 rounded-2xl flex items-center gap-3 
                        bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-xl
                        border border-white/30 shadow-lg">
          <span
            className={`
              inline-block w-3 h-3 rounded-full
              ${
                isListening
                  ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-pulse'
                  : isSpeaking
                  ? 'bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse'
                  : 'bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.6)]'
              }
            `}
          />
          <span className="font-bold text-white text-sm drop-shadow-lg">
            {isListening
              ? '🎤 Listening'
              : isSpeaking
              ? '🔊 Speaking'
              : '✨ Ready'}
          </span>
        </div>

        {/* Robot face */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="relative w-48 h-36 rounded-[2rem] 
                          bg-gradient-to-br from-indigo-900/40 to-purple-900/40 
                          backdrop-blur-xl border-2 border-white/20
                          shadow-[inset_0_2px_20px_rgba(255,255,255,0.1)]
                          flex items-center justify-center overflow-hidden">
            
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
            
            {/* Eyes */}
            <div className="flex items-center gap-10 relative z-10">
              {/* Left eye */}
              <div className="relative w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-sm overflow-hidden
                            border border-white/30 shadow-lg">
                <div
                  className={`
                    absolute inset-2 rounded-xl
                    transition-all duration-300
                    ${
                      isListening
                        ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-[0_0_20px_rgba(52,211,153,0.8)] animate-bounce'
                        : isSpeaking
                        ? 'bg-gradient-to-br from-blue-400 to-cyan-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-pulse'
                        : 'bg-gradient-to-br from-purple-400 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.6)]'
                    }
                  `}
                />
                <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full shadow-lg" />
              </div>
              
              {/* Right eye */}
              <div className="relative w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-sm overflow-hidden
                            border border-white/30 shadow-lg">
                <div
                  className={`
                    absolute inset-2 rounded-xl
                    transition-all duration-300
                    ${
                      isListening
                        ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-[0_0_20px_rgba(52,211,153,0.8)] animate-bounce'
                        : isSpeaking
                        ? 'bg-gradient-to-br from-blue-400 to-cyan-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-pulse'
                        : 'bg-gradient-to-br from-purple-400 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.6)]'
                    }
                  `}
                />
                <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full shadow-lg" />
              </div>
            </div>

            {/* Animated waveform mouth */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-end gap-1.5 
                          bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`
                    w-1.5 rounded-full transition-all duration-200
                    ${
                      isSpeaking
                        ? 'bg-gradient-to-t from-blue-400 to-cyan-300 shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-wave h-6'
                        : isListening
                        ? 'h-5 bg-gradient-to-t from-emerald-400 to-green-300 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                        : 'h-2 bg-gradient-to-t from-purple-400 to-pink-300'
                    }
                  `}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Instruction panel */}
        <div className="relative z-10 w-full">
          <div className="w-full rounded-2xl bg-white/10 backdrop-blur-xl 
                          border border-white/30 px-5 py-4 
                          shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-bold text-sm text-white drop-shadow-lg mb-1">
                  {isListening
                    ? 'Say: "Login", "Register" or "Help"'
                    : isSpeaking
                    ? 'Processing your command...'
                    : 'Voice-First Interface'}
                </p>
                <p className="text-xs text-white/80 font-medium">
                  Instant response • Zero delay ⚡
                </p>
              </div>
              <div
                className={`
                  w-12 h-12 rounded-xl flex items-center justify-center
                  border-2 border-white/30 backdrop-blur-sm
                  transition-all duration-300
                  ${
                    isListening
                      ? 'bg-gradient-to-br from-emerald-500/80 to-green-600/80 shadow-[0_0_20px_rgba(52,211,153,0.6)] scale-110'
                      : isSpeaking
                      ? 'bg-gradient-to-br from-blue-500/80 to-cyan-600/80 shadow-[0_0_20px_rgba(59,130,246,0.6)]'
                      : 'bg-white/10 hover:bg-white/20 shadow-lg'
                  }
                `}
              >
                <Mic size={22} className="text-white drop-shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.5); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 20px); }
        }
        .animate-wave {
          animation: wave 0.6s ease-in-out infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
};

const Login = () => {
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [pin, setPin] = useState('');
  const [username, setUsername] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);

  const {
    isListening,
    isSpeaking,
    transcript,
    lastResult,
    startListening,
    speak,
    isSupported,
    clearTranscript,
  } = useVoice();

  // Initial welcome and start listening
  useEffect(() => {
    if (!hasSpokenWelcome && isSupported) {
      const timer = setTimeout(() => {
        speak('Welcome to your AI Teacher and Opportunity Guide. Say Login, Register, or Help.');
        playTone('start');
        setHasSpokenWelcome(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasSpokenWelcome, isSupported, speak]);

  const handleModeChange = (newMode: AuthMode) => {
    playTone('click');
    setMode(newMode);
    setError('');

    if (newMode === 'welcome') {
      setPin('');
      setUsername('');
    }

    const messages: Record<AuthMode, string> = {
      welcome: 'Welcome screen. Say Login, Register, or Help.',
      login: 'Login mode. Say your username first, then say your pin numbers.',
      register: 'Register mode. Say your username, then your pin numbers.',
      help: 'Help mode. Available commands: Login, Register, Go back. Say your username, then numbers for PIN.',
    };
    
    speak(messages[newMode]);
  };

  const handleClearForm = () => {
    setPin('');
    setUsername('');
    setError('');
    speak('Form cleared. Say your username.');
    playTone('notification');
  };

  const handleSubmit = async () => {
    if (!username || pin.length < 4) {
      setError('Please provide username and at least 4-digit pin');
      speak('Error. Provide username and at least 4 digit pin.');
      playTone('error');
      return;
    }

    setIsProcessing(true);
    speak('Processing your request.');

    await new Promise((resolve) => setTimeout(resolve, 1500));

    playTone('success');
    speak('Login successful! Welcome to your dashboard.');

    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', username);
    }

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
    }, 2500);
  };

  // Process voice commands
  useEffect(() => {
    if (!lastResult || lastResult.trim() === '') return;

    const command = lastResult.toLowerCase().trim();
    console.log('🎤 Command:', command, '| Mode:', mode);

    playTone('notification');

    // Navigation commands
    if (command.includes('login') || command.includes('log in') || command.includes('sign in')) {
      handleModeChange('login');
      clearTranscript();
      return;
    }

    if (command.includes('register') || command.includes('sign up') || command.includes('signup') || command.includes('create account')) {
      handleModeChange('register');
      clearTranscript();
      return;
    }

    if (command.includes('help')) {
      handleModeChange('help');
      clearTranscript();
      return;
    }

    if (command.includes('go back') || command.includes('back') || command.includes('cancel') || command.includes('home')) {
      handleModeChange('welcome');
      clearTranscript();
      return;
    }

    // Form commands
    if (mode === 'login' || mode === 'register') {
      
      if (command.includes('clear') || command.includes('clear form') || command.includes('start over') || command.includes('reset')) {
        handleClearForm();
        clearTranscript();
        return;
      }

      if (command.includes('submit') || command.includes('confirm') || command.includes('done') || command.includes('finish')) {
        handleSubmit();
        clearTranscript();
        return;
      }

      // Username detection
      if (!username) {
        const hasNumbers = /\d/.test(command) || 
                          /zero|one|two|three|four|five|six|seven|eight|nine/i.test(command);
        
        if (!hasNumbers && command.length >= 2) {
          const cleanUsername = command.replace(/[^a-zA-Z0-9\s]/g, '').trim();
          if (cleanUsername.length >= 2) {
            setUsername(cleanUsername);
            speak(`Username: ${cleanUsername}. Now say PIN numbers, like one two three four.`);
            clearTranscript();
            return;
          }
        }
      }

      // PIN detection
      const numberWords: Record<string, string> = {
        zero: '0', one: '1', two: '2', three: '3', four: '4',
        five: '5', six: '6', seven: '7', eight: '8', nine: '9',
        oh: '0', to: '2', too: '2', for: '4', fore: '4', ate: '8',
      };

      let processedCommand = command;
      Object.entries(numberWords).forEach(([word, digit]) => {
        processedCommand = processedCommand.replace(new RegExp(`\\b${word}\\b`, 'gi'), digit);
      });

      const numbers = processedCommand.replace(/\D/g, '');

      if (numbers.length > 0) {
        const newPin = pin + numbers;
        const finalPin = newPin.slice(0, 6);
        setPin(finalPin);
        const spokenNumbers = numbers.split('').join(' ');
        speak(`Added ${spokenNumbers}. PIN now has ${finalPin.length} digits.`);
        clearTranscript();
        return;
      }

      if (username) {
        speak(`Username is ${username}. Say numbers for PIN, or say clear to start over.`);
      }
    }

    clearTranscript();
  }, [lastResult, mode, pin, username, clearTranscript]);

  const voiceStatus = isListening ? 'listening' : isSpeaking ? 'speaking' : 'idle';

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Educational Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900" />
        
        <div className="absolute inset-0 opacity-20">
          <BookOpen className="absolute top-20 left-10 w-32 h-32 text-white/40 animate-float" />
          <GraduationCap className="absolute top-40 right-20 w-40 h-40 text-white/30 animate-float-delayed" />
          <Award className="absolute bottom-32 left-32 w-28 h-28 text-white/35 animate-float" />
          <Lightbulb className="absolute bottom-40 right-40 w-36 h-36 text-white/40 animate-float-delayed" />
        </div>

        <div className="absolute inset-0 backdrop-blur-[2px]">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
        </div>
      </div>

      {/* Skip Link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-xl z-50 shadow-lg">
        Skip to main content
      </a>

      {/* Header */}
      <header className="relative z-10 p-8" role="banner">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border-2 border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <h1 className="text-5xl md:text-6xl font-black text-center bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)]">
              AI Teacher & Opportunity Guide
            </h1>
            <p className="text-xl md:text-2xl text-white/90 text-center mt-4 font-semibold drop-shadow-lg">
              🎯 Voice-first learning • Zero delay ⚡
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12" tabIndex={-1} role="main" aria-label="Login and registration">
        {/* AI Robot */}
        <div className="mb-12">
          <AIRobot status={voiceStatus} />
        </div>

        {/* Transcript Display */}
        {transcript && isListening && (
          <div className="mb-8 max-w-lg w-full">
            <div className="bg-white/10 backdrop-blur-2xl border-2 border-emerald-400/60 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(52,211,153,0.37)]">
              <p className="text-sm text-white/80 font-bold mb-3 flex items-center gap-2">
                <Mic className="w-5 h-5 text-emerald-400 animate-pulse" />
                Listening...
              </p>
              <p className="text-2xl text-white font-semibold drop-shadow-lg">"{transcript}"</p>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="mb-4 text-center">
          <p className="text-white/60 text-sm">
            {mode} | {username || 'no user'} | PIN: {pin.length}
          </p>
        </div>

        {/* Welcome Mode */}
        {mode === 'welcome' && (
          <div className="w-full max-w-lg space-y-6 animate-fadeIn">
            <div className="text-center mb-8 bg-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border-2 border-white/20">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full mx-auto mb-6 shadow-[0_0_40px_rgba(52,211,153,0.6)] animate-pulse"></div>
              <p className="text-2xl text-white font-bold drop-shadow-lg">
                🎤 Speak naturally - Instant response!
              </p>
              <p className="text-lg text-white/70 mt-4">
                Say: "Login", "Register", or "Help"
              </p>
            </div>

            <button onClick={() => handleModeChange('login')} className="group w-full flex items-center justify-center gap-4 px-8 py-8 bg-white/10 backdrop-blur-2xl hover:bg-white/20 text-white rounded-3xl text-2xl font-black transition-all duration-300 shadow-[0_8px_32px_0_rgba(59,130,246,0.37)] hover:shadow-[0_12px_48px_0_rgba(59,130,246,0.5)] hover:scale-105 border-2 border-blue-400/50 hover:border-blue-400/80">
              <LogIn size={36} className="group-hover:animate-bounce drop-shadow-lg" />
              Login
            </button>

            <button onClick={() => handleModeChange('register')} className="group w-full flex items-center justify-center gap-4 px-8 py-8 bg-white/10 backdrop-blur-2xl hover:bg-white/20 text-white rounded-3xl text-2xl font-black transition-all duration-300 shadow-[0_8px_32px_0_rgba(52,211,153,0.37)] hover:shadow-[0_12px_48px_0_rgba(52,211,153,0.5)] hover:scale-105 border-2 border-emerald-400/50 hover:border-emerald-400/80">
              <UserPlus size={36} className="group-hover:animate-bounce drop-shadow-lg" />
              Register
            </button>

            <button onClick={() => handleModeChange('help')} className="group w-full flex items-center justify-center gap-4 px-8 py-8 bg-white/10 backdrop-blur-2xl hover:bg-white/20 text-white rounded-3xl text-2xl font-black transition-all duration-300 shadow-[0_8px_32px_0_rgba(168,85,247,0.37)] hover:shadow-[0_12px_48px_0_rgba(168,85,247,0.5)] hover:scale-105 border-2 border-purple-400/50 hover:border-purple-400/80">
              <HelpCircle size={36} className="drop-shadow-lg" />
              Help & Commands
            </button>
          </div>
        )}

        {/* Login/Register Form */}
        {(mode === 'login' || mode === 'register') && (
          <div className="w-full max-w-lg space-y-8 animate-fadeIn">
            <div className="text-center mb-8 bg-white/10 backdrop-blur-2xl rounded-3xl p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border-2 border-white/20">
              <h2 className="text-5xl font-black text-white mb-4 drop-shadow-lg">
                {mode === 'login' ? '👋 Welcome Back' : '🎉 Create Account'}
              </h2>
              <p className="text-2xl text-white/80 font-semibold drop-shadow-lg">Just speak naturally</p>
            </div>

            {error && (
              <div className="bg-red-500/20 backdrop-blur-xl border-2 border-red-400/60 text-white p-8 rounded-3xl text-2xl font-bold shadow-[0_8px_32px_0_rgba(239,68,68,0.37)] animate-pulse" role="alert">
                ❌ {error}
              </div>
            )}

            <div className="space-y-6 bg-white/10 backdrop-blur-2xl rounded-3xl p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border-2 border-white/20">
              <div>
                <label htmlFor="username" className="block text-2xl font-black text-white mb-4 flex items-center gap-3 drop-shadow-lg">
                  Username 
                  {username && <span className="text-emerald-400 text-3xl drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]">✓</span>}
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-8 py-6 bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-3xl text-2xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/50 transition-all duration-300 shadow-lg hover:shadow-xl"
                  placeholder="Say your name"
                  aria-describedby="username-help"
                />
                <p id="username-help" className="text-lg text-white/70 mt-4 font-medium drop-shadow-lg">
                  💬 Say your name clearly
                </p>
              </div>

              <div>
                <label htmlFor="pin" className="block text-2xl font-black text-white mb-4 drop-shadow-lg">
                  Voice PIN ({pin.length}/4 minimum)
                </label>
                <div className="relative">
                  <input
                    id="pin"
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    className="w-full px-8 py-6 bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-3xl text-2xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/50 transition-all duration-300 shadow-lg hover:shadow-xl pr-20"
                    placeholder="Say numbers"
                    aria-describedby="pin-help"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-2xl shadow-lg hover:shadow-xl hover:scale-110 backdrop-blur-sm"
                    aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPin ? <EyeOff size={28} /> : <Eye size={28} />}
                  </button>
                </div>
                <p id="pin-help" className="text-lg text-white/70 mt-4 font-medium drop-shadow-lg">
                  🔢 Say: "one two three four"
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => handleModeChange('welcome')} className="flex-1 px-8 py-6 bg-white/10 backdrop-blur-2xl hover:bg-white/20 text-white rounded-3xl text-xl font-black transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-white/30 hover:border-white/50">
                ← Back
              </button>
              <button onClick={handleClearForm} className="px-8 py-6 bg-orange-500/30 backdrop-blur-2xl hover:bg-orange-500/50 text-white rounded-3xl text-xl font-black transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-orange-400/50 hover:border-orange-400/80">
                🔄 Clear
              </button>
              <button onClick={handleSubmit} disabled={isProcessing} className="flex-1 px-8 py-6 bg-blue-500/40 backdrop-blur-2xl hover:bg-blue-500/60 disabled:bg-gray-500/30 text-white rounded-3xl text-xl font-black transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:scale-100 border-2 border-blue-400/50 hover:border-blue-400/80 disabled:border-gray-400/30">
                {isProcessing ? '⏳ Processing...' : '✓ Submit'}
              </button>
            </div>
          </div>
        )}

        {/* Help Mode */}
        {mode === 'help' && (
          <div className="w-full max-w-2xl space-y-8 animate-fadeIn">
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border-2 border-white/20">
              <h2 className="text-5xl font-black text-white text-center mb-10 drop-shadow-lg">🎯 Voice Commands</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-500/20 backdrop-blur-xl border-l-8 border-blue-400 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <p className="text-3xl font-black text-blue-300 mb-3 drop-shadow-lg">🔵 Login</p>
                  <p className="text-xl text-white/80 font-semibold">Access account</p>
                </div>
                <div className="bg-emerald-500/20 backdrop-blur-xl border-l-8 border-emerald-400 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <p className="text-3xl font-black text-emerald-300 mb-3 drop-shadow-lg">🟢 Register</p>
                  <p className="text-xl text-white/80 font-semibold">Create account</p>
                </div>
                <div className="bg-purple-500/20 backdrop-blur-xl border-l-8 border-purple-400 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <p className="text-3xl font-black text-purple-300 mb-3 drop-shadow-lg">🟣 Your name</p>
                  <p className="text-xl text-white/80 font-semibold">e.g., "Rahul"</p>
                </div>
                <div className="bg-orange-500/20 backdrop-blur-xl border-l-8 border-orange-400 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <p className="text-3xl font-black text-orange-300 mb-3 drop-shadow-lg">🟠 Numbers</p>
                  <p className="text-xl text-white/80 font-semibold">"one two three four"</p>
                </div>
                <div className="bg-pink-500/20 backdrop-blur-xl border-l-8 border-pink-400 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <p className="text-3xl font-black text-pink-300 mb-3 drop-shadow-lg">🎀 Submit</p>
                  <p className="text-xl text-white/80 font-semibold">Complete login</p>
                </div>
                <div className="bg-slate-500/20 backdrop-blur-xl border-l-8 border-slate-400 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <p className="text-3xl font-black text-slate-300 mb-3 drop-shadow-lg">⚫ Go back</p>
                  <p className="text-xl text-white/80 font-semibold">Return to welcome</p>
                </div>
                <div className="bg-red-500/20 backdrop-blur-xl border-l-8 border-red-400 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <p className="text-3xl font-black text-red-300 mb-3 drop-shadow-lg">🔴 Clear</p>
                  <p className="text-xl text-white/80 font-semibold">Reset form</p>
                </div>
              </div>
            </div>
            <button onClick={() => handleModeChange('welcome')} className="w-full px-12 py-8 bg-emerald-500/40 backdrop-blur-2xl hover:bg-emerald-500/60 text-white rounded-3xl text-3xl font-black transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-emerald-400/50 hover:border-emerald-400/80">
              ← Back to Welcome
            </button>
          </div>
        )}

        {!isSupported && (
          <div className="mt-16 p-12 bg-red-500/20 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(239,68,68,0.37)] max-w-2xl border-2 border-red-400/60">
            <p className="text-3xl text-white text-center font-black drop-shadow-lg">⚠️ Voice features not supported</p>
            <p className="text-xl text-white/80 text-center mt-4 font-semibold">Use Chrome, Edge, or Chromium browser.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-8 text-center bg-white/5 backdrop-blur-2xl border-t-2 border-white/20" role="contentinfo">
        <p className="text-xl text-white/90 font-bold drop-shadow-lg">
          ✨ Fully accessible • 🎤 Voice-controlled • ⚡ Zero delay • ❤️ Made for everyone
        </p>
      </footer>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-5deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
    </div>
  );
};

export { Login };