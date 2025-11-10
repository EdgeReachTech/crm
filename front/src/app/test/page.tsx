'use client';

import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-8">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">
            Tailwind CSS Test
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            If you can see styled colors, gradients, and proper spacing, Tailwind CSS is working correctly!
          </p>
          
          <div className="space-y-4">
            <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
              Primary Button
            </button>
            
            <button className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
              Secondary Button
            </button>
            
            <div className="bg-accent-50 dark:bg-accent-950 border border-accent-200 dark:border-accent-800 rounded-lg p-4">
              <p className="text-accent-700 dark:text-accent-300 text-sm">
                ✅ Colors are working
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="h-12 bg-success-500 rounded"></div>
              <div className="h-12 bg-warning-500 rounded"></div>
              <div className="h-12 bg-error-500 rounded"></div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <a href="/login" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium">
              ← Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}