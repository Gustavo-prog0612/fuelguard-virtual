import React from 'react';
import { AppLayout } from '@/ui/layout/AppLayout';
import ErrorBoundary from '@/ui/components/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppLayout />
    </ErrorBoundary>
  );
};
