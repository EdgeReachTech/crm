import React, { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react';
import { clsx } from 'clsx';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled';
  autoComplete?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      size = 'md',
      variant = 'default',
      className,
      disabled,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    
    const baseStyles = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      default: clsx(
        'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800',
        'text-neutral-900 dark:text-neutral-100',
        'placeholder:text-neutral-500 dark:placeholder:text-neutral-400',
        'focus:border-primary-500 focus:ring-primary-500',
        error && 'border-error-500 focus:border-error-500 focus:ring-error-500'
      ),
      filled: clsx(
        'border-transparent bg-neutral-100 dark:bg-neutral-700',
        'text-neutral-900 dark:text-neutral-100',
        'placeholder:text-neutral-500 dark:placeholder:text-neutral-400',
        'focus:bg-white dark:focus:bg-neutral-800 focus:border-primary-500 focus:ring-primary-500',
        error && 'bg-error-50 dark:bg-error-950 border-error-500 focus:border-error-500 focus:ring-error-500'
      ),
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-5 w-5',
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              'block text-sm font-medium mb-2',
              'text-neutral-700 dark:text-neutral-300',
              error && 'text-error-700 dark:text-error-400'
            )}
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className={clsx(
                iconSizes[size],
                'text-neutral-400 dark:text-neutral-500',
                error && 'text-error-500'
              )}>
                {leftIcon}
              </span>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              baseStyles,
              variants[variant],
              sizes[size],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            disabled={disabled}
            required={required}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className={clsx(
                iconSizes[size],
                'text-neutral-400 dark:text-neutral-500',
                error && 'text-error-500'
              )}>
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        
        {(error || helper) && (
          <p className={clsx(
            'mt-2 text-xs',
            error ? 'text-error-600 dark:text-error-400' : 'text-neutral-500 dark:text-neutral-400'
          )}>
            {error || helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';