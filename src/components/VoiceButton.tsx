import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface VoiceButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  voiceCommand?: string;
  isActive?: boolean;
}

export const VoiceButton = forwardRef<HTMLButtonElement, VoiceButtonProps>(
  ({ 
    children, 
    icon: Icon, 
    variant = 'primary', 
    size = 'md',
    voiceCommand,
    isActive,
    className, 
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center gap-3 font-semibold rounded-2xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none';
    
    const variantClasses = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-button hover:shadow-glow',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-2 border-border hover:border-primary',
      outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground',
      ghost: 'text-foreground hover:bg-secondary hover:text-foreground',
    };

    const sizeClasses = {
      sm: 'px-4 py-3 text-accessible-sm',
      md: 'px-6 py-4 text-accessible-base',
      lg: 'px-8 py-5 text-accessible-lg',
    };

    const iconSizes = {
      sm: 18,
      md: 22,
      lg: 26,
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          isActive && 'ring-4 ring-accent ring-offset-2 ring-offset-background',
          className
        )}
        aria-pressed={isActive}
        {...props}
      >
        {Icon && <Icon size={iconSizes[size]} aria-hidden="true" />}
        <span>{children}</span>
        {voiceCommand && (
          <span className="sr-only">. Voice command: say {voiceCommand}</span>
        )}
      </button>
    );
  }
);

VoiceButton.displayName = 'VoiceButton';
