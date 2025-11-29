
import React, { useState, useEffect } from 'react';
import { Camera, ChefHat, Calendar, ArrowLeft, History, User, Search, Scale, Dumbbell, FileText, Activity } from 'lucide-react';
import PhotoAnalyzer from './components/PhotoAnalyzer';
import RecipeFinder from './components/RecipeFinder';
import MealPlanner from './components/MealPlanner';
import ChatAssistant from './components/ChatAssistant';
import ProgressChart from './components/ProgressChart';
import { AppView, AgentMode } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView | 'HOME'>('HOME');
  const [activeAgent, setActiveAgent] = useState<AgentMode>(AgentMode.CHEF);
  const [username, setUsername] = useState<string>('Гость');
  const [initialChatMessage, setInitialChatMessage] = useState<string>('');
  
  // Rotating Text State
  const [capabilityIndex, setCapabilityIndex] = useState(0);
  const [isCapabilityVisible, setIsCapabilityVisible] = useState(true);

  // Define Capabilities per Agent
  const capabilities = {
    [AgentMode.CHEF]: ["Посчитать калории 📸", "Составить меню 📅", "Рецепт ужина 🍳"],
    [AgentMode.LAWYER]: ["Проверить договор ⚖️", "Составить претензию 📝", "Вопрос юристу 🎓"],
    [AgentMode.FITNESS]: ["Программа тренировок 💪", "Анализ техники 🏋️", "Совет по питанию 🥗"]
  };

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user?.first_name) setUsername(user.first_name);
    }
  }, []);

  // Text Rotation Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setIsCapabilityVisible(false);
      setTimeout(() => {
        setCapabilityIndex((prev) => (prev + 1) % capabilities[activeAgent].length);
        setIsCapabilityVisible(true);
      }, 500);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeAgent]);

  const triggerHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
  };

  const switchAgent = (agent: AgentMode) => {
    if (activeAgent !== agent) {
      triggerHaptic();
      setActiveAgent(agent);
      setCapabilityIndex(0);
    }
  };

  // Get Styling based on Agent
  const getAgentStyle = () => {
    switch (activeAgent) {
      case AgentMode.LAWYER: return { 
        bgGradient: 'radial-gradient(at 0% 0%, #E0F2FE 0, transparent 50%), radial-gradient(at 100% 100%, #DBEAFE 0, transparent 50%)',
        accentColor: 'text-blue-900',
        subColor: 'text-blue-600',
        searchBtn: 'bg-blue-900'
      };
      case AgentMode.FITNESS: return { 
        bgGradient: 'radial-gradient(at 0% 0%, #FFE4E6 0, transparent 50%), radial-gradient(at 100% 100%, #FECDD3 0, transparent 50%)',
        accentColor: 'text-rose-900',
        subColor: 'text-rose-600',
        searchBtn: 'bg-rose-900'
      };
      default: return { 
        bgGradient: 'radial-gradient(at 0% 0%, #D1FAE5 0, transparent 50%), radial-gradient(at 100% 100%, #ECFCCB 0, transparent 50%)',
        accentColor: 'text-[#1a2e35]',
        subColor: 'text-emerald-600',
        searchBtn: 'bg-[#1a1a1a]'
      };
    }
  };

  const style = getAgentStyle();

  const renderContent = () => {
    const commonClasses = "min-h-screen bg-[#F2F6F7] pb-10 pt-24 px-4 animate-slide-up absolute inset-0 z-40 overflow-y-auto";
    const Header = ({ title }: { title: string }) => (
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#F2F6F7]/90 backdrop-blur-xl px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-4 flex items-center shadow-sm transition-all">
         <button onClick={() => setCurrentView('HOME')} className="mr-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm">
           <ArrowLeft className="w-6 h-6 text-gray-800" />
         </button>
         <h2 className="text-3xl font-heading font-bold text-gray-900 leading-none">{title}</h2>
      </div>
    );

    // Contextual Views based on Agent
    if (currentView === AppView.PHOTO_ANALYZER) return <div className={commonClasses}><Header title="Сканер" /><PhotoAnalyzer agentMode={activeAgent} /></div>;
    if (currentView === AppView.RECIPES) return <div className={commonClasses}><Header title="Рецепты" /><RecipeFinder /></div>;
    if (currentView === AppView.MEAL_PLANNER) return <div className={commonClasses}><Header title="Меню" /><MealPlanner /></div>;
    if (currentView === AppView.HISTORY) return <div className={commonClasses}><Header title="История" /><ProgressChart /></div>;
    
    if (currentView === AppView.CHAT) {
      return (
        <div className="fixed inset-0 z-50 bg-white animate-slide-up flex flex-col">
             <div className="px-4 py-4 pt-[calc(env(safe-area-inset-top)+10px)] flex items-center border-b border-gray-100 bg-white">
                <button onClick={() => setCurrentView('HOME')} className="mr-4 p-2 bg-gray-50 rounded-full">
                   <ArrowLeft className="w-6 h-6 text-gray-800" />
                 </button>
                 <span className="font-heading font-bold text-xl">
                   {activeAgent === AgentMode.LAWYER ? 'AI Юрист' : activeAgent === AgentMode.FITNESS ? 'AI Тренер' : 'AI Шеф'}
                 </span>
             </div>
             <div className="flex-1 bg-gray-50">
               <ChatAssistant initialMessage={initialChatMessage} onClearInitial={() => setInitialChatMessage('')} agentMode={activeAgent} />
             </div>
          </div>
      );
    }
    return null;
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden transition-colors duration-700" style={{ background: style.bgGradient }}>
      
      {/* HOME SCREEN CONTAINER */}
      <div 
        className={`
          flex flex-col h-full min-h-screen px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-[env(safe-area-inset-bottom)]
          transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${currentView !== 'HOME' ? 'scale-[0.85] opacity-50 blur-sm pointer-events-none' : 'scale-100 opacity-100 blur-0'}
        `}
      >
        {/* Top Icons */}
        <div className="flex justify-between items-center relative z-20">
           <button onClick={() => setCurrentView(AppView.HISTORY)} className="w-12 h-12 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
             <History className="w-5 h-5 text-gray-700" />
           </button>
           <button className="w-12 h-12 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
             <User className="w-5 h-5 text-gray-700" />
           </button>
        </div>

        {/* Hero Greeting */}
        <div className="flex-1 flex flex-col items-center justify-start pt-8 md:pt-16 text-center z-10">
           <div className={`mb-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/50 backdrop-blur-sm ${style.subColor}`}>
             {activeAgent === AgentMode.LAWYER ? 'Юридический Помощник' : activeAgent === AgentMode.FITNESS ? 'Фитнес Тренер' : 'Персональный Шеф'}
           </div>
           <h1 className={`text-5xl md:text-6xl font-heading font-extrabold ${style.accentColor} tracking-tight leading-[1.1] mb-2 animate-pop-in`}>
             Привет,<br />{username}
           </h1>
           <div className="h-8 flex items-center justify-center overflow-hidden mb-2">
             <p className={`text-xl ${style.subColor} font-medium transition-all duration-500 ease-in-out transform ${isCapabilityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
               {capabilities[activeAgent][capabilityIndex]}
             </p>
           </div>
           
           {/* Contextual Action Buttons */}
           <div className="mt-4 md:mt-8 flex gap-3 animate-pop-in relative z-20" style={{ animationDelay: '0.2s' }}>
             {activeAgent === AgentMode.CHEF && (
               <>
                 <button onClick={() => setCurrentView(AppView.RECIPES)} className="px-5 py-3 bg-white rounded-2xl shadow-sm text-emerald-700 font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"><ChefHat className="w-4 h-4"/> Рецепты</button>
                 <button onClick={() => setCurrentView(AppView.MEAL_PLANNER)} className="px-5 py-3 bg-white rounded-2xl shadow-sm text-blue-700 font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"><Calendar className="w-4 h-4"/> Меню</button>
               </>
             )}
             {activeAgent === AgentMode.LAWYER && (
               <button onClick={() => setCurrentView(AppView.PHOTO_ANALYZER)} className="px-6 py-3 bg-white rounded-2xl shadow-sm text-blue-800 font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"><FileText className="w-4 h-4"/> Сканер Договора</button>
             )}
             {activeAgent === AgentMode.FITNESS && (
               <button onClick={() => setCurrentView(AppView.PHOTO_ANALYZER)} className="px-6 py-3 bg-white rounded-2xl shadow-sm text-rose-700 font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"><Dumbbell className="w-4 h-4"/> Анализ Оборудования</button>
             )}
           </div>
        </div>

        {/* AGENT SELECTOR (FAN) */}
        <div className="relative w-full max-w-xs mx-auto h-[220px] mb-6">
           
           {/* SEARCH/CHAT BUTTON (Floating Above) */}
           <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-40 animate-float">
              <button 
                onClick={() => setCurrentView(AppView.CHAT)}
                className={`w-20 h-20 ${style.searchBtn} rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-[#F2F6F7] active:scale-90 transition-transform duration-300 group`}
              >
                <Search className="w-8 h-8 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
              </button>
           </div>

           {/* --- LEFT CARD (LAWYER) --- */}
           <div 
              onClick={() => switchAgent(AgentMode.LAWYER)}
              className={`absolute bottom-4 left-0 w-[110px] h-[150px] bg-white rounded-[24px] shadow-xl flex flex-col items-center justify-center p-2 cursor-pointer z-10 fan-card hover:z-20 hover:scale-105 ${activeAgent === AgentMode.LAWYER ? 'border-2 border-blue-400 z-30 scale-105' : 'shadow-blue-900/5'}`}
              style={{ transformOrigin: 'bottom right', transform: 'rotate(-15deg) translateY(10px)' }}
           >
              <div style={{ transform: 'rotate(15deg)' }} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Scale className="w-6 h-6" />
                </div>
                <span className="font-heading font-bold text-sm text-gray-600">Юрист</span>
              </div>
           </div>

           {/* --- RIGHT CARD (FITNESS) --- */}
           <div 
              onClick={() => switchAgent(AgentMode.FITNESS)}
              className={`absolute bottom-4 right-0 w-[110px] h-[150px] bg-white rounded-[24px] shadow-xl flex flex-col items-center justify-center p-2 cursor-pointer z-10 fan-card hover:z-20 hover:scale-105 ${activeAgent === AgentMode.FITNESS ? 'border-2 border-rose-400 z-30 scale-105' : 'shadow-rose-900/5'}`}
              style={{ transformOrigin: 'bottom left', transform: 'rotate(15deg) translateY(10px)' }}
           >
               <div style={{ transform: 'rotate(-15deg)' }} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="font-heading font-bold text-sm text-gray-600">Спорт</span>
              </div>
           </div>

           {/* --- CENTER CARD (CHEF) --- */}
           <div 
              onClick={() => switchAgent(AgentMode.CHEF)}
              className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-[120px] h-[160px] bg-white rounded-[28px] shadow-2xl flex flex-col items-center justify-center p-2 cursor-pointer z-20 fan-card hover:scale-105 ${activeAgent === AgentMode.CHEF ? 'border-2 border-emerald-400 z-30 scale-105' : 'shadow-emerald-900/10'}`}
           >
              <div className="flex flex-col items-center gap-4 pt-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                  <ChefHat className="w-7 h-7" />
                </div>
                <span className="font-heading font-bold text-sm text-gray-800">Шеф</span>
              </div>
           </div>

        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default App;
