import React, { useState } from 'react';
import { Calendar, ShoppingCart, Loader2, Sparkles, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { generateWeeklyPlan } from '../services/geminiService';
import { WeeklyPlan } from '../types';

const MealPlanner: React.FC = () => {
  const [goal, setGoal] = useState('Сбалансированное питание');
  const [preferences, setPreferences] = useState('');
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const result = await generateWeeklyPlan(goal, preferences || 'Нет ограничений');
      setPlan(result);
    } catch (error) {
      console.error(error);
      alert("Ошибка при создании плана. Попробуйте еще раз.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    if (expandedDay === day) setExpandedDay(null);
    else setExpandedDay(day);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-emerald-900/5">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
             <Calendar className="w-7 h-7" />
           </div>
           <div>
             <h2 className="text-3xl font-heading font-bold text-gray-900">
               Планировщик
             </h2>
             <p className="text-gray-500">Создайте идеальное меню на неделю за секунды.</p>
           </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 ml-1">Ваша цель</label>
            <div className="relative">
              <select 
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none font-medium text-gray-700 transition-all"
              >
                <option>Сбалансированное питание</option>
                <option>Похудение (дефицит калорий)</option>
                <option>Набор мышечной массы</option>
                <option>Вегетарианство</option>
                <option>Кето-диета</option>
                <option>Бюджетное питание</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 ml-1">Особенности / Аллергии</label>
            <input 
              type="text"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="Без орехов, не люблю рыбу..."
              className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-gray-700 transition-all"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-colors font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          {loading ? 'ИИ составляет меню...' : 'Сгенерировать План'}
        </button>
      </div>

      {plan && (
        <div className="grid lg:grid-cols-3 gap-8 animate-fade-in-up">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-heading font-bold text-gray-800 ml-2">Расписание на неделю</h3>
            <div className="space-y-3">
              {plan.schedule.map((dayPlan, idx) => (
                <div key={idx} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
                  <button 
                    onClick={() => toggleDay(dayPlan.day)}
                    className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-8 rounded-full ${idx % 2 === 0 ? 'bg-emerald-400' : 'bg-blue-400'}`}></div>
                      <span className="font-bold text-lg text-gray-800">{dayPlan.day}</span>
                    </div>
                    {expandedDay === dayPlan.day ? <ChevronUp className="w-5 h-5 text-gray-400"/> : <ChevronDown className="w-5 h-5 text-gray-400"/>}
                  </button>
                  
                  {(expandedDay === dayPlan.day || window.innerWidth >= 1280) && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="h-px bg-gray-100 w-full mb-4"></div>
                      <div className="space-y-4">
                        {dayPlan.meals.map((meal, mIdx) => (
                          <div key={mIdx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-gray-50/50 border border-gray-50 hover:bg-white hover:shadow-sm transition-all">
                            <div className="flex items-start gap-3">
                               <div className="p-2 bg-white rounded-xl shadow-sm">
                                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{meal.type}</div>
                               </div>
                               <div>
                                  <p className="font-semibold text-gray-800 text-sm sm:text-base">{meal.name}</p>
                               </div>
                            </div>
                            <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-100 self-start sm:self-center whitespace-nowrap">
                              {meal.calories} ккал
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <ShoppingList list={plan.shoppingList} />
          </div>
        </div>
      )}
    </div>
  );
};

const ShoppingList: React.FC<{ list: string[] }> = ({ list }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `Список покупок:\n${list.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-heading font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-emerald-600" />
          Корзина
        </h3>
        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">{list.length} товаров</span>
      </div>
      
      <div className="space-y-2 mb-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {list.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-transparent hover:border-emerald-100 hover:bg-emerald-50/30 transition-colors">
            <div className="w-4 h-4 rounded-full border-2 border-emerald-200 flex-shrink-0"></div>
            <span className="text-sm font-medium">{item}</span>
          </div>
        ))}
      </div>
      
      <button 
        onClick={handleCopy}
        className="w-full py-3 border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-colors text-sm font-bold flex items-center justify-center gap-2"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Скопировано' : 'Копировать список'}
      </button>
    </div>
  );
};

export default MealPlanner;