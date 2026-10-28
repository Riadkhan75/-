import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { SystemSettings, DEFAULT_SYSTEM_SETTINGS } from '../types';
import { getSystemSettings } from '../services/firestoreService';

interface SettingsContextType {
  settings: SystemSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SYSTEM_SETTINGS,
  loading: false,
  refreshSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const data = await getSystemSettings();
      setSettings(data);
    } catch (err) {
      console.warn('Error fetching system settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial direct fetch
    fetchSettings();

    // 2. Real-time Firestore snapshot listener
    let unsubscribe: (() => void) | undefined;
    try {
      const docRef = doc(db, 'system_settings', 'general');
      unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setSettings({
              ...DEFAULT_SYSTEM_SETTINGS,
              ...data,
            } as SystemSettings);
          }
        },
        (error) => {
          console.warn('Realtime settings snapshot notice:', error);
        }
      );
    } catch (err) {
      console.warn('Could not attach snapshot listener to settings:', err);
    }

    // 3. Instant local event listener (fires immediately on admin save)
    const handleLocalUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<Partial<SystemSettings>>;
      if (customEvent.detail) {
        setSettings((prev) => ({
          ...prev,
          ...customEvent.detail,
        }));
      }
    };

    window.addEventListener('manobotar_settings_updated', handleLocalUpdate);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('manobotar_settings_updated', handleLocalUpdate);
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
