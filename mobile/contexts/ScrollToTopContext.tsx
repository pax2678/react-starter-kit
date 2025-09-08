import React, { createContext, useContext, useRef } from 'react';

interface ScrollToTopContextType {
  homeScrollRef: React.MutableRefObject<(() => void) | null>;
}

const ScrollToTopContext = createContext<ScrollToTopContextType | null>(null);

export function ScrollToTopProvider({ children }: { children: React.ReactNode }) {
  const homeScrollRef = useRef<(() => void) | null>(null);

  return (
    <ScrollToTopContext.Provider value={{ homeScrollRef }}>
      {children}
    </ScrollToTopContext.Provider>
  );
}

export function useScrollToTop() {
  const context = useContext(ScrollToTopContext);
  if (!context) {
    throw new Error('useScrollToTop must be used within a ScrollToTopProvider');
  }
  return context;
}