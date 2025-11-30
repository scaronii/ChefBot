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

export const updateHistoryItem = (id: string, updates: Partial<HistoryItem>) => {
  const history = getHistory();
  const updatedHistory = history.map(item => 
    item.id === id ? { ...item, ...updates } : item
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  window.dispatchEvent(new Event('historyUpdated'));
};

export const deleteHistoryItem = (id: string) => {
  const history = getHistory();
  const updatedHistory = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  window.dispatchEvent(new Event('historyUpdated'));
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('historyUpdated'));
};

export const getChartData = () => {
  const history = getHistory();
  
  // Find the earliest date in history or default to 7 days ago
  let startDate = new Date();
  startDate.setDate(startDate.getDate() - 6); // Default to last 7 days

  if (history.length > 0) {
    const timestamps = history.map(h => h.timestamp);
    const firstEntry = new Date(Math.min(...timestamps));
    // If first entry is within the last 7 days, stick to 7 days window for consistency
    // If the user wants to see "Start from first date", we usually still normalize to a specific range (e.g. week) 
    // for the bar chart to look good. We will generate the last 7 days but map data correctly.
  }

  const last7DaysMap = new Map<string, number>();
  
  // Generate last 7 days keys
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    last7DaysMap.set(key, 0);
  }

  // Populate data
  history.forEach(item => {
    const d = new Date(item.timestamp);
    const key = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    
    // Only add if it falls within our view window (last 7 days for the chart)
    if (last7DaysMap.has(key)) {
      last7DaysMap.set(key, (last7DaysMap.get(key) || 0) + item.calories);
    }
  });

  return Array.from(last7DaysMap.entries()).map(([date, calories]) => ({
    date,
    calories
  }));
};