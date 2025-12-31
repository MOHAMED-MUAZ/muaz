import { forwardRef, ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface AccessibleCardProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  voiceCommand?: string;
  isSelected?: boolean;
  as?: 'button' | 'div';
  className?: string;
  onClick?: () => void;
  onFocus?: () => void;
}

export const AccessibleCard = forwardRef<HTMLButtonElement | HTMLDivElement, AccessibleCardProps>(
  ({ 
    icon: Icon, 
    title, 
    description, 
    voiceCommand, 
    isSelected,
    as = 'div',
    className,
    onClick,
    onFocus,
  }, ref) => {
    const baseClasses = cn(
      'voice-card group cursor-pointer text-left w-full',
      'flex items-start gap-5',
      isSelected && 'border-primary bg-primary/10 ring-4 ring-primary/30',
      className
    );

    const content = (
      <>
        {Icon && (
          <div 
            className={cn(
              'flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center',
              'bg-primary/20 text-primary transition-all duration-300',
              'group-hover:bg-primary group-hover:text-primary-foreground',
              'group-focus:bg-primary group-focus:text-primary-foreground'
            )}
            aria-hidden="true"
          >
            <Icon size={28} />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="text-accessible-lg font-bold text-foreground mb-1">
            {title}
          </h3>
          <p className="text-accessible-base text-muted-foreground leading-relaxed">
            {description}
          </p>
          {voiceCommand && (
            <p className="mt-3 text-accessible-sm text-accent font-medium">
              Say: "{voiceCommand}"
            </p>
          )}
        </div>

        {/* Screen reader additional context */}
        {voiceCommand && (
          <span className="sr-only">Voice command: {voiceCommand}</span>
        )}
      </>
    );
    
    if (as === 'button') {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          className={baseClasses}
          aria-pressed={isSelected}
          onClick={onClick}
          onFocus={onFocus}
        >
          {content}
        </button>
      );
    }

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={baseClasses}
        tabIndex={0}
        role="button"
        aria-pressed={isSelected}
        onClick={onClick}
        onFocus={onFocus}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        {content}
      </div>
    );
  }
);

AccessibleCard.displayName = 'AccessibleCard';
