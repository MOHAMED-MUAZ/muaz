import { Mic, Volume2, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceIndicatorProps {
  status: 'idle' | 'listening' | 'speaking';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VoiceIndicator = ({ status, size = 'md', className }: VoiceIndicatorProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 20,
    md: 32,
    lg: 48,
  };

  const statusColors = {
    idle: 'bg-voice-idle',
    listening: 'bg-voice-listening',
    speaking: 'bg-voice-speaking',
  };

  const statusLabels = {
    idle: 'Voice assistant is ready',
    listening: 'Listening to your voice',
    speaking: 'Speaking response',
  };

  const Icon = status === 'listening' ? Mic : status === 'speaking' ? Volume2 : MicOff;

  return (
    <div 
      className={cn('relative flex items-center justify-center', className)}
      role="status"
      aria-live="polite"
      aria-label={statusLabels[status]}
    >
      {/* Outer ring animation */}
      {status !== 'idle' && (
        <>
          <div 
            className={cn(
              'absolute rounded-full animate-voice-ring',
              sizeClasses[size],
              statusColors[status],
              'opacity-30'
            )}
          />
          <div 
            className={cn(
              'absolute rounded-full animate-voice-ring',
              sizeClasses[size],
              statusColors[status],
              'opacity-20'
            )}
            style={{ animationDelay: '0.5s' }}
          />
        </>
      )}

      {/* Main indicator */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full transition-all duration-300',
          sizeClasses[size],
          statusColors[status],
          status !== 'idle' && 'animate-voice-pulse shadow-glow'
        )}
      >
        <Icon 
          size={iconSizes[size]} 
          className="text-foreground"
          aria-hidden="true"
        />
      </div>

      {/* Screen reader text */}
      <span className="sr-only">{statusLabels[status]}</span>
    </div>
  );
};
