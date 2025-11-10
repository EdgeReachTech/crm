import React, { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'elevation-1' | 'elevation-2' | 'elevation-3';
  border?: boolean;
  hover?: boolean;
}

export function Card({ 
  children, 
  className, 
  padding = 'md',
  shadow = 'md',
  border = false,
  hover = false 
}: CardProps) {
  const baseStyles = 'bg-white dark:bg-neutral-800 rounded-xl transition-all duration-200';
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    'elevation-1': 'shadow-elevation-1',
    'elevation-2': 'shadow-elevation-2',
    'elevation-3': 'shadow-elevation-3',
  };

  return (
    <div
      className={clsx(
        baseStyles,
        paddings[padding],
        shadows[shadow],
        border && 'border border-neutral-200 dark:border-neutral-700',
        hover && 'hover:shadow-lg hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={clsx('mb-4', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CardTitle({ children, className, size = 'md' }: CardTitleProps) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <h3 className={clsx(
      'font-semibold text-neutral-900 dark:text-neutral-100',
      sizes[size],
      className
    )}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={clsx(
      'text-sm text-neutral-600 dark:text-neutral-400 mt-1',
      className
    )}>
      {children}
    </p>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={clsx('flex-1', className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={clsx(
      'mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700',
      className
    )}>
      {children}
    </div>
  );
}