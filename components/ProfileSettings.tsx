
import React, { useState } from 'react';
import { UserProfile, AgentMode } from '../types';
import { ChefHat, Scale, Activity, Globe, Shirt, Save, Check } from 'lucide-react';

interface ProfileSettingsProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onSave }) => {
  const [activeTab, setActiveTab] = useState<AgentMode>(AgentMode.CHEF);
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(localProfile);
    setSaved(true);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    setTimeout(() => setSaved(false), 2000);
  };

  const updateChef = (field: keyof typeof localProfile.chef, value: any) => {
    setLocalProfile({ ...localProfile, chef: { ...localProfile.chef, [field]: value } });
  };
  const updateLawyer = (field: keyof typeof localProfile.lawyer, value: any) => {
    setLocalProfile({ ...localProfile, lawyer: { ...localProfile.lawyer, [field]: value } });
  };
  const updateFitness = (field: keyof typeof localProfile.fitness, value: any) => {
    setLocalProfile({ ...localProfile, fitness: { ...localProfile.fitness, [field]: value } });
  };
  const updateTravel = (field: keyof typeof localProfile.travel, value: any) => {
    setLocalProfile({ ...localProfile, travel: { ...localProfile.travel, [field]: value } });
  };
  const updateStylist = (field: keyof typeof localProfile.stylist, value: any) => {
    setLocalProfile({ ...localProfile, stylist: { ...localProfile.stylist, [field]: value } });
  };

  const tabs = [
    { id: AgentMode.CHEF, icon: ChefHat, label: 'Шеф' },
    { id: AgentMode.LAWYER, icon: Scale, label: 'Юрист' },
    { id: AgentMode.FITNESS, icon: Activity, label: 'Спорт' },
    { id: AgentMode.TRAVEL, icon: Globe, label: 'Гид' },
    { id: AgentMode.STYLIST, icon: Shirt, label: 'Стиль' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-20">
      
      {/* Name Input */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <label className="block text-sm font-bold text-gray-500 uppercase mb-2 ml-1">Ваше имя</label>
        <input 
          type="text" 
          value={localProfile.name}
          onChange={(e) => setLocalProfile({...localProfile, name: e.target.value})}
          className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-lg"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-gray-900 text-white shadow-lg' 
                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 animate-fade-in">
        
        {activeTab === AgentMode.CHEF && (
          <div className="space-y-4">
            <h3 className="text-xl font-heading font-bold text-gray-900 mb-4">Настройки Диетолога</h3>
            
            <div>
              <label className="label-text">Тип питания</label>
              <select 
                value={localProfile.chef.diet}
                onChange={(e) => updateChef('diet', e.target.value)}
                className="input-field"
              >
                <option value="Omnivore">Всеядный</option>
                <option value="Vegetarian">Вегетарианец</option>
                <option value="Vegan">Веган</option>
                <option value="Keto">Кето</option>
                <option value="Paleo">Палео</option>
              </select>
            </div>

            <div>
              <label className="label-text">Аллергии</label>
              <input 
                type="text" 
                value={localProfile.chef.allergies}
                onChange={(e) => updateChef('allergies', e.target.value)}
                placeholder="Орехи, молоко, мед..."
                className="input-field"
              />
            </div>

            <div>
               <label className="label-text">Цель калорий</label>
               <input 
                type="number" 
                value={localProfile.chef.calorieGoal}
                onChange={(e) => updateChef('calorieGoal', parseInt(e.target.value))}
                className="input-field"
              />
            </div>
          </div>
        )}

        {activeTab === AgentMode.LAWYER && (
          <div className="space-y-4">
            <h3 className="text-xl font-heading font-bold text-gray-900 mb-4">Настройки Юриста</h3>
             <div>
              <label className="label-text">Ваш статус</label>
              <select 
                value={localProfile.lawyer.status}
                onChange={(e) => updateLawyer('status', e.target.value)}
                className="input-field"
              >
                <option value="Individual">Физическое лицо</option>
                <option value="Entrepreneur">ИП</option>
                <option value="Company">Компания (ООО/АО)</option>
              </select>
            </div>
            <div>
              <label className="label-text">Сфера деятельности</label>
              <input 
                type="text"
                value={localProfile.lawyer.industry}
                onChange={(e) => updateLawyer('industry', e.target.value)}
                placeholder="IT, Торговля, Строительство..."
                className="input-field"
              />
            </div>
          </div>
        )}

        {activeTab === AgentMode.FITNESS && (
          <div className="space-y-4">
            <h3 className="text-xl font-heading font-bold text-gray-900 mb-4">Настройки Тренера</h3>
             <div>
              <label className="label-text">Уровень подготовки</label>
              <select 
                value={localProfile.fitness.level}
                onChange={(e) => updateFitness('level', e.target.value)}
                className="input-field"
              >
                <option value="Beginner">Новичок</option>
                <option value="Intermediate">Средний</option>
                <option value="Advanced">Профи</option>
              </select>
            </div>
             <div>
              <label className="label-text">Цель</label>
              <select 
                value={localProfile.fitness.goal}
                onChange={(e) => updateFitness('goal', e.target.value)}
                className="input-field"
              >
                <option value="Weight Loss">Похудение</option>
                <option value="Muscle Gain">Набор массы</option>
                <option value="Endurance">Выносливость</option>
              </select>
            </div>
            <div>
              <label className="label-text">Травмы / Ограничения</label>
               <input 
                type="text"
                value={localProfile.fitness.injuries}
                onChange={(e) => updateFitness('injuries', e.target.value)}
                placeholder="Болит колено, грыжа..."
                className="input-field"
              />
            </div>
          </div>
        )}

        {activeTab === AgentMode.TRAVEL && (
          <div className="space-y-4">
            <h3 className="text-xl font-heading font-bold text-gray-900 mb-4">Настройки Гида</h3>
             <div>
              <label className="label-text">Бюджет поездок</label>
              <select 
                value={localProfile.travel.budget}
                onChange={(e) => updateTravel('budget', e.target.value)}
                className="input-field"
              >
                <option value="Budget">Эконом</option>
                <option value="Moderate">Средний</option>
                <option value="Luxury">Люкс</option>
              </select>
            </div>
            <div>
              <label className="label-text">Интересы</label>
               <input 
                type="text"
                value={localProfile.travel.interests}
                onChange={(e) => updateTravel('interests', e.target.value)}
                placeholder="Музеи, Еда, Природа, Экстрим..."
                className="input-field"
              />
            </div>
          </div>
        )}

        {activeTab === AgentMode.STYLIST && (
           <div className="space-y-4">
            <h3 className="text-xl font-heading font-bold text-gray-900 mb-4">Настройки Стилиста</h3>
             <div>
              <label className="label-text">Пол</label>
              <select 
                value={localProfile.stylist.gender}
                onChange={(e) => updateStylist('gender', e.target.value)}
                className="input-field"
              >
                <option value="Female">Женский</option>
                <option value="Male">Мужской</option>
                <option value="Unisex">Унисекс</option>
              </select>
            </div>
             <div>
              <label className="label-text">Предпочитаемый стиль</label>
              <select 
                value={localProfile.stylist.style}
                onChange={(e) => updateStylist('style', e.target.value)}
                className="input-field"
              >
                <option value="Casual">Casual (Повседневный)</option>
                <option value="Formal">Деловой</option>
                <option value="Streetwear">Стритвир</option>
                <option value="Boho">Бохо</option>
              </select>
            </div>
          </div>
        )}

      </div>

      <button 
        onClick={handleSave}
        className="fixed bottom-8 left-4 right-4 bg-gray-900 text-white p-4 rounded-2xl shadow-xl hover:bg-black transition-all font-bold flex items-center justify-center gap-2 z-50 active:scale-95"
      >
        {saved ? <Check className="w-5 h-5"/> : <Save className="w-5 h-5" />}
        {saved ? 'Сохранено!' : 'Сохранить изменения'}
      </button>

      <style>{`
        .label-text { display: block; font-size: 0.75rem; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 0.5rem; margin-left: 0.25rem; }
        .input-field { width: 100%; padding: 1rem; border-radius: 1rem; background-color: #f9fafb; border: 1px solid #f3f4f6; outline: none; font-weight: 500; transition: all; }
        .input-field:focus { background-color: white; border-color: #e5e7eb; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1); }
      `}</style>
    </div>
  );
};

export default ProfileSettings;
