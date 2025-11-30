
import React, { useState } from 'react';
import { Globe, MapPin, Calendar, Wallet, Loader2, Sparkles, Sun, Moon, Coffee } from 'lucide-react';
import { planTrip } from '../services/geminiService';
import { UserProfile, TripPlan } from '../types';

interface TripPlannerProps {
  userProfile?: UserProfile;
}

const TripPlanner: React.FC<TripPlannerProps> = ({ userProfile }) => {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('3');
  const [budget, setBudget] = useState('Средний');
  const [style, setStyle] = useState('Культура и История');
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const triggerHaptic = (style: 'light' | 'medium' | 'success' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      if (style === 'success') window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      else window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const handleGenerate = async () => {
    if (!destination.trim()) return;
    setLoading(true);
    setPlan(null);
    triggerHaptic('medium');

    try {
      const result = await planTrip(destination, parseInt(days), budget, style, userProfile);
      setPlan(result);
      triggerHaptic('success');
    } catch (error) {
      alert('Ошибка при создании маршрута');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-violet-900/5 border border-violet-50">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-14 h-14 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center">
             <Globe className="w-7 h-7" />
           </div>
           <div>
             <h2 className="text-3xl font-heading font-bold text-gray-900">
               Конструктор Путешествия
             </h2>
             <p className="text-gray-500">Спланируй идеальную поездку за минуту.</p>
           </div>
        </div>

        <div className="space-y-4">
           <div>
             <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Куда едем?</label>
             <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
                <MapPin className="w-5 h-5 text-violet-400"/>
                <input 
                  type="text" 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Париж, Сочи, Токио..."
                  className="bg-transparent outline-none w-full font-bold text-gray-800"
                />
             </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Длительность</label>
               <select 
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-violet-500/20 outline-none font-bold text-gray-800 transition-all appearance-none"
               >
                 <option value="1">1 день</option>
                 <option value="2">2 дня</option>
                 <option value="3">3 дня</option>
                 <option value="5">5 дней</option>
                 <option value="7">Неделя</option>
               </select>
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Бюджет</label>
               <select 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-violet-500/20 outline-none font-bold text-gray-800 transition-all appearance-none"
               >
                 <option>Эконом</option>
                 <option>Средний</option>
                 <option>Премиум</option>
               </select>
             </div>
           </div>

            <div>
             <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Стиль поездки</label>
             <select 
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-violet-500/20 outline-none font-bold text-gray-800 transition-all appearance-none"
             >
               <option>Культура и История</option>
               <option>Релакс и SPA</option>
               <option>Гастро-тур</option>
               <option>Активный отдых / Походы</option>
               <option>Шопинг и Развлечения</option>
             </select>
           </div>

           <button
            onClick={handleGenerate}
            disabled={loading || !destination.trim()}
            className="w-full bg-violet-600 text-white p-4 rounded-2xl hover:bg-violet-700 transition-colors font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'Гид планирует...' : 'Составить Маршрут'}
          </button>
        </div>
      </div>

      {plan && (
        <div className="space-y-6 animate-slide-up">
           <div className="flex justify-between items-center px-2">
              <h3 className="text-xl font-heading font-bold text-gray-800">{plan.destination}</h3>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
                 <Wallet className="w-3 h-3"/> ~ {plan.totalCostEstimate}
              </span>
           </div>
           
           <div className="space-y-4">
             {plan.itinerary.map((day, i) => (
               <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-violet-50">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold">
                        {day.day}
                     </div>
                     <div>
                       <h4 className="font-bold text-gray-900">День {day.day}</h4>
                       <p className="text-xs text-violet-500 font-bold uppercase tracking-wider">{day.theme}</p>
                     </div>
                  </div>

                  <div className="space-y-4 relative border-l-2 border-dashed border-violet-100 ml-5 pl-6 py-2">
                     {day.activities.map((act, actIdx) => (
                        <div key={actIdx} className="relative">
                           <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-violet-300 ring-4 ring-white"></div>
                           <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-1">
                              {act.time === 'Morning' && <Coffee className="w-3 h-3 text-orange-400"/>}
                              {act.time === 'Afternoon' && <Sun className="w-3 h-3 text-yellow-500"/>}
                              {act.time === 'Evening' && <Moon className="w-3 h-3 text-indigo-400"/>}
                              {act.time === 'Morning' ? 'Утро' : act.time === 'Afternoon' ? 'День' : 'Вечер'}
                           </div>
                           <h5 className="font-bold text-gray-800">{act.activity}</h5>
                           <p className="text-sm text-gray-500 mt-1">{act.description}</p>
                        </div>
                     ))}
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default TripPlanner;