
import React, { useState } from 'react';
import { Dumbbell, Clock, Activity, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { generateWorkoutPlan } from '../services/geminiService';
import { UserProfile, WorkoutPlan } from '../types';

interface WorkoutPlannerProps {
  userProfile?: UserProfile;
}

const WorkoutPlanner: React.FC<WorkoutPlannerProps> = ({ userProfile }) => {
  const [focus, setFocus] = useState('Full Body');
  const [equipment, setEquipment] = useState('Gym');
  const [duration, setDuration] = useState('45 мин');
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const triggerHaptic = (style: 'light' | 'medium' | 'success' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      if (style === 'success') window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      else window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setPlan(null);
    triggerHaptic('medium');

    try {
      const result = await generateWorkoutPlan(focus, equipment, duration, userProfile);
      setPlan(result);
      triggerHaptic('success');
    } catch (error) {
      alert('Ошибка при создании тренировки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-rose-900/5 border border-rose-50">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
             <Dumbbell className="w-7 h-7" />
           </div>
           <div>
             <h2 className="text-3xl font-heading font-bold text-gray-900">
               Конструктор Тренировок
             </h2>
             <p className="text-gray-500">Создай идеальную программу на сегодня.</p>
           </div>
        </div>

        <div className="space-y-4">
           <div>
             <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Цель / Группа мышц</label>
             <select 
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-rose-500/20 outline-none font-bold text-gray-800 transition-all appearance-none"
             >
               <option value="Full Body">Все тело (Full Body)</option>
               <option value="Legs & Glutes">Ноги и Ягодицы</option>
               <option value="Chest & Triceps">Грудь и Трицепс</option>
               <option value="Back & Biceps">Спина и Бицепс</option>
               <option value="Cardio & Core">Кардио и Пресс</option>
               <option value="Stretching">Растяжка</option>
             </select>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Оборудование</label>
               <select 
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-rose-500/20 outline-none font-bold text-gray-800 transition-all appearance-none"
               >
                 <option value="Gym">Тренажерный зал</option>
                 <option value="Dumbbells">Только гантели</option>
                 <option value="Home (No Equipment)">Дома (Без инвентаря)</option>
                 <option value="Street Workout">Воркаут (Турники)</option>
               </select>
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Время</label>
               <select 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-rose-500/20 outline-none font-bold text-gray-800 transition-all appearance-none"
               >
                 <option>15 мин</option>
                 <option>30 мин</option>
                 <option>45 мин</option>
                 <option>60 мин</option>
                 <option>90 мин</option>
               </select>
             </div>
           </div>

           <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-rose-600 text-white p-4 rounded-2xl hover:bg-rose-700 transition-colors font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'Тренер составляет...' : 'Создать Программу'}
          </button>
        </div>
      </div>

      {plan && (
        <div className="space-y-6 animate-slide-up">
           <div className="flex justify-between items-center px-4">
              <h3 className="text-xl font-heading font-bold text-gray-800">{plan.title}</h3>
              <span className="text-xs font-bold bg-rose-100 text-rose-700 px-3 py-1 rounded-full">{plan.difficulty}</span>
           </div>
           
           <div className="space-y-3">
             {plan.exercises.map((ex, i) => (
               <div key={i} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 font-bold text-sm">
                          {i + 1}
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg">{ex.name}</h4>
                     </div>
                     <div className="text-right">
                        <div className="text-lg font-bold text-rose-600">{ex.sets} x {ex.reps}</div>
                        <div className="text-xs text-gray-400 font-medium">отдых {ex.rest}</div>
                     </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-600 italic border-l-2 border-rose-200">
                    💡 {ex.notes}
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutPlanner;
