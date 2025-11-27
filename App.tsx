
import React, { useState, useEffect } from 'react';
import { Camera, ChefHat, Calendar, ArrowLeft, History, User, Search } from 'lucide-react';
import PhotoAnalyzer from './components/PhotoAnalyzer';
import RecipeFinder from './components/RecipeFinder';
import MealPlanner from './components/MealPlanner';
import ChatAssistant from './components/ChatAssistant';
import ProgressChart from './components/ProgressChart';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView | 'HOME'>('HOME');
  const [username, setUsername] = useState<string>('Гость');
  const [initialChatMessage, setInitialChatMessage] = useState<string>('');
  
  // Capability Rotation State
  const [capabilityIndex, setCapabilityIndex] = useState(0);
  const [isCapabilityVisible, setIsCapabilityVisible] = useState(true);

  const capabilities = [
    "Посчитать калории по фото 📸",
    "Составить меню на неделю 📅",
    "Придумать рецепт ужина 🍳",
    "Организовать стол для гостей 🥂",
    "Найти замену продуктам 🥑"
  ];

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user?.first_name) {
        setUsername(user.first_name);
      }
    }
  }, []);

  // Effect for rotating text
  useEffect(() => {
    const interval = setInterval(() => {
      setIsCapabilityVisible(false); // Start fade out
      setTimeout(() => {
        setCapabilityIndex((prev) => (prev + 1) % capabilities.length);
        setIsCapabilityVisible(true); // Start fade in
      }, 500); // Wait for fade out to finish (matches CSS duration)
    }, 3500); // Change every 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  const triggerHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
  };

  const handleNavigate = (view: AppView) => {
    triggerHaptic();
    setCurrentView(view);
  };

  const renderContent = () => {
    const commonClasses = "min-h-screen bg-[#F2F6F7] pb-10 pt-24 px-4 animate-slide-up absolute inset-0 z-40 overflow-y-auto";
    const Header = ({ title }: { title: string }) => (
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#F2F6F7]/90 backdrop-blur-xl px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-4 flex items-center shadow-sm transition-all">
         <button 
           onClick={() => setCurrentView('HOME')}
           className="mr-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm"
         >
           <ArrowLeft className="w-6 h-6 text-gray-800" />
         </button>
         <h2 className="text-3xl font-heading font-bold text-gray-900 leading-none">{title}</h2>
      </div>
    );

    switch (currentView) {
      case AppView.PHOTO_ANALYZER:
        return (
          <div className={commonClasses}>
            <Header title="Сканер" />
            <PhotoAnalyzer />
          </div>
        );
      case AppView.RECIPES:
        return (
          <div className={commonClasses}>
            <Header title="Рецепты" />
            <RecipeFinder />
          </div>
        );
      case AppView.MEAL_PLANNER:
        return (
          <div className={commonClasses}>
             <Header title="Меню" />
            <MealPlanner />
          </div>
        );
      case AppView.CHAT:
        return (
          <div className="fixed inset-0 z-50 bg-white animate-slide-up flex flex-col">
             <div className="px-4 py-4 pt-[calc(env(safe-area-inset-top)+10px)] flex items-center border-b border-gray-100 bg-white">
                <button 
                   onClick={() => setCurrentView('HOME')}
                   className="mr-4 p-2 bg-gray-50 rounded-full"
                 >
                   <ArrowLeft className="w-6 h-6 text-gray-800" />
                 </button>
                 <span className="font-heading font-bold text-xl">AI Шеф</span>
             </div>
             <div className="flex-1 bg-gray-50">
               <ChatAssistant 
                  initialMessage={initialChatMessage} 
                  onClearInitial={() => setInitialChatMessage('')} 
                />
             </div>
          </div>
        );
      case AppView.HISTORY: 
         return (
            <div className={commonClasses}>
               <Header title="История" />
               <ProgressChart />
            </div>
         );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent">
      
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
           <button 
             onClick={() => handleNavigate(AppView.HISTORY)}
             className="w-12 h-12 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg shadow-gray-200/20 active:scale-95 transition-transform"
           >
             <History className="w-5 h-5 text-gray-700" />
           </button>
           <button className="w-12 h-12 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg shadow-gray-200/20 active:scale-95 transition-transform">
             <User className="w-5 h-5 text-gray-700" />
           </button>
        </div>

        {/* Hero Greeting */}
        <div className="flex-1 flex flex-col items-center justify-start pt-24 text-center z-10">
           <h1 className="text-5xl md:text-6xl font-heading font-extrabold text-[#1a2e35] tracking-tight leading-[1.1] mb-4 animate-pop-in">
             Привет,<br />{username}
           </h1>
           
           <div className="h-8 flex items-center justify-center overflow-hidden">
             <p 
               className={`
                 text-xl text-gray-500 font-medium transition-all duration-500 ease-in-out transform
                 ${isCapabilityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
               `}
             >
               {capabilities[capabilityIndex]}
             </p>
           </div>
        </div>

        {/* FAN NAVIGATION CONTAINER */}
        <div className="relative w-full max-w-xs mx-auto h-[260px] mb-8">
           
           {/* SEARCH BUTTON (Floating Above) */}
           <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-40 animate-float">
              <button 
                onClick={() => handleNavigate(AppView.CHAT)}
                className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white shadow-2xl shadow-gray-900/20 border-4 border-[#eef2f3] active:scale-90 transition-transform duration-300 group"
              >
                <Search className="w-8 h-8 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
              </button>
           </div>

           {/* --- LEFT CARD (Recipes) --- */}
           <div 
              onClick={() => handleNavigate(AppView.RECIPES)}
              className="absolute bottom-4 left-0 w-[110px] h-[150px] bg-white rounded-[24px] shadow-xl shadow-purple-900/5 flex flex-col items-center justify-center p-2 cursor-pointer z-10 fan-card hover:z-20 hover:scale-105"
              style={{ transformOrigin: 'bottom right', transform: 'rotate(-15deg) translateY(10px)' }}
           >
              {/* Counter-Rotate Content */}
              <div style={{ transform: 'rotate(15deg)' }} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                  <ChefHat className="w-6 h-6" />
                </div>
                <span className="font-heading font-bold text-sm text-gray-600">Рецепты</span>
              </div>
           </div>

           {/* --- RIGHT CARD (Menu) --- */}
           <div 
              onClick={() => handleNavigate(AppView.MEAL_PLANNER)}
              className="absolute bottom-4 right-0 w-[110px] h-[150px] bg-white rounded-[24px] shadow-xl shadow-blue-900/5 flex flex-col items-center justify-center p-2 cursor-pointer z-10 fan-card hover:z-20 hover:scale-105"
              style={{ transformOrigin: 'bottom left', transform: 'rotate(15deg) translateY(10px)' }}
           >
               {/* Counter-Rotate Content */}
               <div style={{ transform: 'rotate(-15deg)' }} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="font-heading font-bold text-sm text-gray-600">Меню</span>
              </div>
           </div>

           {/* --- CENTER CARD (Scan) --- */}
           <div 
              onClick={() => handleNavigate(AppView.PHOTO_ANALYZER)}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[120px] h-[160px] bg-white rounded-[28px] shadow-2xl shadow-emerald-900/10 flex flex-col items-center justify-center p-2 cursor-pointer z-30 fan-card hover:scale-105"
           >
              <div className="flex flex-col items-center gap-4 pt-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                  <Camera className="w-7 h-7" />
                </div>
                <span className="font-heading font-bold text-sm text-gray-800">Сканер</span>
              </div>
           </div>

        </div>
      </div>

      {/* OVERLAY VIEWS */}
      {renderContent()}

    </div>
  );
};

export default App;
