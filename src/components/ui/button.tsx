'use client';
import * as React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline';
};

export function Button({ variant = 'default', className = '', ...props }: Props) {
  const base =
    'inline-flex items-center justify-center text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none';
  const styles =
    variant === 'outline'
      ? 'border border-gray-300 text-black hover:border-black bg-white'
      : 'bg-black text-white hover:bg-gray-800';
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
