export const TOKEN_EVENT = 'tokenBalanceUpdated';
const STORAGE_KEY = 'nutrigen_token_balance';

export const getTokenBalance = (): number => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? parseInt(stored) : 50; // Default 50 tokens
};

export const updateLocalBalance = (newBalance: number) => {
  localStorage.setItem(STORAGE_KEY, newBalance.toString());
  window.dispatchEvent(new Event(TOKEN_EVENT));
};

export const hasEnoughTokens = (cost: number): boolean => {
  return getTokenBalance() >= cost;
};