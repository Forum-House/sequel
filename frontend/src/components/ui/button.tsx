import { cn } from '@/lib/utils';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition-all duration-200 border-2 border-black';

    const variants = {
      primary:
        'bg-white text-black hover:bg-black hover:text-white',
      secondary:
        'bg-white text-black hover:bg-gray-100',
      dark: 
        'bg-black text-white hover:bg-white hover:text-black',
      ghost:
        'border-transparent bg-transparent hover:bg-gray-100 shadow-none hover:shadow-none',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm shadow-[2px_2px_0px_0px_#000000]',
      md: 'px-6 py-3 text-base shadow-[4px_4px_0px_0px_#000000]',
      lg: 'px-8 py-4 text-lg shadow-[6px_6px_0px_0px_#000000]',
    };

    const shadowClass = variant === 'ghost' ? 'shadow-none' : sizes[size];

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], shadowClass, className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
