import React from 'react';
import { X, Zap, Star } from 'lucide-react';
import { updateLocalBalance, getTokenBalance } from '../services/tokenService';

interface TokenShopProps {
  onClose: () => void;
}

const TokenShop: React.FC<TokenShopProps> = ({ onClose }) => {
  const handleBuy = (amount: number, stars: number) => {
    // In a real TMA, this would call Telegram.WebApp.openInvoice
    // Here we simulate a successful purchase
    if (confirm(`Купить ${amount} токенов за ${stars} Stars?`)) {
      const current = getTokenBalance();
      updateLocalBalance(current + amount);
      alert('Успешно! Токены начислены.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-pop-in">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center mb-8">
           <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
             <Zap className="w-10 h-10 text-amber-500 fill-amber-500" />
           </div>
           <h3 className="text-2xl font-heading font-bold text-gray-900">Магазин Энергии</h3>
           <p className="text-gray-500 mt-2">Пополните баланс, чтобы пользоваться AI функциями.</p>
        </div>

        <div className="space-y-4">
          <div onClick={() => handleBuy(100, 50)} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl cursor-pointer hover:bg-white hover:shadow-md transition-all group">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-amber-500 font-bold">100</div>
               <span className="font-bold text-gray-800">Токенов</span>
             </div>
             <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 group-hover:bg-blue-700">
               50 <Star className="w-3 h-3 fill-white" />
             </button>
          </div>

          <div onClick={() => handleBuy(500, 200)} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl cursor-pointer hover:shadow-lg transition-all relative overflow-hidden group">
             <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl">HIT</div>
             <div className="flex items-center gap-3 relative z-10">
               <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-amber-600 font-bold">500</div>
               <span className="font-bold text-gray-900">Токенов</span>
             </div>
             <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 relative z-10 group-hover:bg-blue-700">
               200 <Star className="w-3 h-3 fill-white" />
             </button>
          </div>

          <div onClick={() => handleBuy(2000, 500)} className="flex items-center justify-between p-4 bg-gray-900 text-white rounded-2xl cursor-pointer hover:shadow-xl transition-all group">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">2K</div>
               <span className="font-bold">Pro Pack</span>
             </div>
             <button className="bg-white text-gray-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 group-hover:bg-gray-200">
               500 <Star className="w-3 h-3 fill-gray-900" />
             </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
           Оплата происходит через Telegram Stars.
        </p>
      </div>
    </div>
  );
};

export default TokenShop;