import React, { useState } from 'react';
import { Shirt, Sparkles, Loader2, Palette, Layers } from 'lucide-react';
import { generateCapsuleWardrobe } from '../services/geminiService';
import { UserProfile, CapsuleWardrobe } from '../types';

interface CapsuleBuilderProps {
  userProfile?: UserProfile;
}

const CapsuleBuilder: React.FC<CapsuleBuilderProps> = ({ userProfile }) => {
  const [season, setSeason] = useState('Лето');
  const [occasion, setOccasion] = useState('Повседневный (Casual)');
  const [style, setStyle] = useState('Минимализм');
  const [capsule, setCapsule] = useState<CapsuleWardrobe | null>(null);
  const [loading, setLoading] = useState(false);

  const triggerHaptic = (style: 'light' | 'medium' | 'success' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      if (style === 'success') window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      else window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setCapsule(null);
    triggerHaptic('medium');

    try {
      const result = await generateCapsuleWardrobe(season, occasion, style, userProfile);
      setCapsule(result);
      triggerHaptic('success');
    } catch (error) {
      alert('Ошибка при создании капсулы');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-pink-900/5 border border-pink-50">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center">
             <Shirt className="w-7 h-7" />
           </div>
           <div>
             <h2 className="text-3xl font-heading font-bold text-gray-900">
               Капсула Стиля
             </h2>
             <p className="text-gray-500">Подберу 10-15 вещей, которые идеально сочетаются.</p>
           </div>
        </div>

        <div className="space-y-4">
           
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Сезон</label>
               <select 
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-pink-500/20 outline-none font-bold text-gray-800 transition-all appearance-none"
               >
                 <option>Лето</option>
                 <option>Осень</option>
                 <option>Зима</option>
                 <option>Весна</option>
                 <option>В отпуск</option>
               </select>
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Событие</label>
               <select 
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-pink-500/20 outline-none font-bold text-gray-800 transition-all appearance-none"
               >
                 <option>Повседневный (Casual)</option>
                 <option>Офис / Работа</option>
                 <option>Свидание / Вечер</option>
                 <option>Спорт-шик</option>
                 <option>Пляжный отдых</option>
               </select>
             </div>
           </div>

            <div>
             <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Стиль / Вайб</label>
             <select 
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-pink-500/20 outline-none font-bold text-gray-800 transition-all appearance-none"
             >
               <option>Минимализм (Old Money)</option>
               <option>Гранж / Рок</option>
               <option>Романтика / Бохо</option>
               <option>Классика</option>
               <option>Трендовый (Y2K и т.д.)</option>
             </select>
           </div>

           <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-pink-600 text-white p-4 rounded-2xl hover:bg-pink-700 transition-colors font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'Стилист подбирает...' : 'Создать Капсулу'}
          </button>
        </div>
      </div>

      {capsule && (
        <div className="space-y-8 animate-slide-up">
           
           {/* Header */}
           <div className="flex justify-between items-center px-2">
              <h3 className="text-xl font-heading font-bold text-gray-800">{capsule.title}</h3>
              <div className="flex -space-x-2">
                 {capsule.colorPalette.map((c, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }}></div>
                 ))}
              </div>
           </div>

           {/* Items Grid */}
           <div className="grid md:grid-cols-2 gap-4">
              {capsule.items.map((item, idx) => (
                 <div key={idx} className="bg-white p-5 rounded-[2rem] shadow-sm border border-pink-50 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-bold bg-gray-50 text-gray-500 px-2 py-1 rounded-lg uppercase tracking-wider">{item.category}</span>
                       <div className="w-4 h-4 rounded-full border border-gray-100" style={{ backgroundColor: item.color }}></div>
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                 </div>
              ))}
           </div>

           {/* Tips */}
           <div className="bg-gradient-to-br from-pink-50 to-white p-6 rounded-[2rem] border border-pink-100">
              <h4 className="font-bold text-pink-900 mb-4 flex items-center gap-2">
                 <Layers className="w-5 h-5"/> Секреты стиля
              </h4>
              <ul className="space-y-3">
                 {capsule.stylingTips.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-gray-700 text-sm">
                       <span className="text-pink-400 font-bold">•</span>
                       {tip}
                    </li>
                 ))}
              </ul>
           </div>

        </div>
      )}
    </div>
  );
};

export default CapsuleBuilder;