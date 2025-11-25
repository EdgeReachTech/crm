'use client';
import React from 'react';
import Header from '../dashboard/components/header';

export default function LeadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header/>
      {children}
    </div>
  );
}
