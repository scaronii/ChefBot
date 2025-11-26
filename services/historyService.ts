import { FoodAnalysisResult, HistoryItem } from '../types';

const STORAGE_KEY = 'nutrigen_history_v1';

export const getHistory = (): HistoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const saveHistoryItem = (item: FoodAnalysisResult): HistoryItem => {
  const history = getHistory();
  
  const newItem: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    dateStr: new Date().toLocaleDateString('ru-RU')
  };

  const updatedHistory = [newItem, ...history];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  
  window.dispatchEvent(new Event('historyUpdated'));
  return newItem;
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('historyUpdated'));
};

export const getChartData = () => {
  const history = getHistory();
  const last7DaysMap = new Map<string, number>();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    last7DaysMap.set(key, 0);
  }

  history.forEach(item => {
    const d = new Date(item.timestamp);
    const key = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    if (last7DaysMap.has(key)) {
      last7DaysMap.set(key, (last7DaysMap.get(key) || 0) + item.calories);
    }
  });

  return Array.from(last7DaysMap.entries()).map(([date, calories]) => ({
    date,
    calories
  }));
};