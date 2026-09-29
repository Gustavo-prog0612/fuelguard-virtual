import React, { createContext, useContext, useState, useEffect } from 'react';
import { TypographyPreset, TYPOGRAPHY_PRESETS } from './tokens';

export type ThemeMode = 'light' | 'dark';

interface DesignSystemContextValue {
  preset: TypographyPreset;
  setPreset: (preset: TypographyPreset) => void;
  config: typeof TYPOGRAPHY_PRESETS[TypographyPreset];
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const DesignSystemContext = createContext<DesignSystemContextValue | undefined>(undefined);

export const DesignSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preset, setPresetState] = useState<TypographyPreset>('A');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

  const THEME_STORAGE_KEY = 'fuelguard.theme-mode';

  const setPreset = (newPreset: TypographyPreset) => {
    setPresetState(newPreset);
    const config = TYPOGRAPHY_PRESETS[newPreset];
    const root = document.documentElement;
    root.style.setProperty('--font-display', config.displayFont);
    root.style.setProperty('--font-ui', config.uiFont);
    root.style.setProperty('--font-mono', config.monoFont);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Persistência é opcional em ambientes de preview/teste.
    }
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    // Inicializa variáveis CSS e tema
    setPreset('A');
    let storedMode: ThemeMode = 'light';
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') storedMode = stored;
    } catch {
      // Mantém o padrão claro quando storage não estiver disponível.
    }
    setThemeMode(storedMode);
  }, []);

  return (
    <DesignSystemContext.Provider
      value={{
        preset,
        setPreset,
        config: TYPOGRAPHY_PRESETS[preset],
        themeMode,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </DesignSystemContext.Provider>
  );
};

export const useDesignSystem = () => {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystem deve ser usado dentro de um DesignSystemProvider');
  }
  return context;
};
