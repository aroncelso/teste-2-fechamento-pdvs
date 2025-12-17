import { ClosingRecord, AppSettings } from "../types";

const STORAGE_KEY = 'pdv_master_history';
const SETTINGS_KEY = 'pdv_master_settings';

export const getHistory = (): ClosingRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse history", e);
    return [];
  }
};

export const saveRecord = (record: ClosingRecord): ClosingRecord[] => {
  const history = getHistory();
  const updated = [record, ...history];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const clearHistory = (): ClosingRecord[] => {
  if (window.confirm("Tem certeza que deseja apagar todo o histórico de fechamentos?")) {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
  return getHistory();
};

export const getSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : { sheetUrl: '' };
  } catch (e) {
    return { sheetUrl: '' };
  }
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};