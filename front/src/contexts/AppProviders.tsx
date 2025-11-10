'use client';

import React from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { LeadProvider } from './LeadContext';
import { ContactProvider } from './ContactContext';
import { OpportunityProvider } from './OpportunityContext';
import { AccountProvider } from './AccountContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Combined provider that wraps all application contexts
 * This ensures proper ordering and prevents provider hell in the main layout
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AccountProvider>
          <ContactProvider>
            <LeadProvider>
              <OpportunityProvider>
                {children}
              </OpportunityProvider>
            </LeadProvider>
          </ContactProvider>
        </AccountProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}