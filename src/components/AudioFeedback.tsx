import { useEffect, useRef } from 'react';

// Audio context for generating feedback tones
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

type ToneType = 'success' | 'error' | 'notification' | 'click' | 'start' | 'end';

const toneConfigs: Record<ToneType, { frequency: number; duration: number; type: OscillatorType }> = {
  success: { frequency: 880, duration: 0.15, type: 'sine' },
  error: { frequency: 220, duration: 0.3, type: 'square' },
  notification: { frequency: 660, duration: 0.1, type: 'sine' },
  click: { frequency: 1000, duration: 0.05, type: 'sine' },
  start: { frequency: 440, duration: 0.1, type: 'sine' },
  end: { frequency: 330, duration: 0.15, type: 'sine' },
};

export const playTone = (type: ToneType) => {
  try {
    const ctx = getAudioContext();
    const config = toneConfigs[type];
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = config.frequency;
    oscillator.type = config.type;
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + config.duration);
  } catch (error) {
    console.log('Audio feedback unavailable');
  }
};

// Hook for audio feedback
export const useAudioFeedback = () => {
  return {
    playSuccess: () => playTone('success'),
    playError: () => playTone('error'),
    playNotification: () => playTone('notification'),
    playClick: () => playTone('click'),
    playStart: () => playTone('start'),
    playEnd: () => playTone('end'),
  };
};

// Component wrapper for focus sounds
interface AudioFeedbackProps {
  children: React.ReactNode;
  playOnFocus?: boolean;
  playOnClick?: boolean;
}

export const AudioFeedback = ({ children, playOnFocus = true, playOnClick = true }: AudioFeedbackProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFocus = () => {
      if (playOnFocus) playTone('notification');
    };

    const handleClick = () => {
      if (playOnClick) playTone('click');
    };

    container.addEventListener('focusin', handleFocus);
    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('focusin', handleFocus);
      container.removeEventListener('click', handleClick);
    };
  }, [playOnFocus, playOnClick]);

  return <div ref={containerRef}>{children}</div>;
};
