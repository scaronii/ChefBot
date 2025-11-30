import React, { useState, useEffect } from 'react';
import { Camera, ChefHat, Calendar, ArrowLeft, History, User, Search, Scale, Dumbbell, FileText, Activity, Globe, Shirt, X, Grid, MapPin, Zap, Layers, MessageCircle, Sparkles, BrainCircuit } from 'lucide-react';
import PhotoAnalyzer from './components/PhotoAnalyzer';
import RecipeFinder from './components/RecipeFinder';
import MealPlanner from './components/MealPlanner';
import ChatAssistant from './components/ChatAssistant';
import ProgressChart from './components/ProgressChart';
import ProfileSettings from './components/ProfileSettings';
import DocumentDrafter from './components/DocumentDrafter';
import WorkoutPlanner from './components/WorkoutPlanner';
import TripPlanner from './components/TripPlanner';
import CapsuleBuilder from './components/CapsuleBuilder';
import { AppView, AgentMode, UserProfile } from './types';

// Default Profile
const DEFAULT_PROFILE: UserProfile = {
  name: 'Гость',
  streak: 0,
  lastVisit: new Date(0).toISOString(),
  chef: { diet: 'Omnivore', allergies: '', dislikes: '', calorieGoal: 2000 },
  lawyer: { status: 'Individual', industry: '' },
  fitness: { level: 'Beginner', goal: 'Weight Loss', injuries: '' },
  travel: { budget: 'Moderate', interests: '' },
  stylist: { gender: 'Unisex', style: 'Casual' }
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView | 'HOME'>('HOME');
  const [activeAgent, setActiveAgent] = useState<AgentMode>(AgentMode.UNIVERSAL);
  
  const [showAppGrid, setShowAppGrid] = useState(false);
  const [username, setUsername] = useState<string>('Гость');
  const [initialChatMessage, setInitialChatMessage] = useState<string>('');
  
  // Rotating Text State
  const [capabilityIndex, setCapabilityIndex] = useState(0);
  const [isCapabilityVisible, setIsCapabilityVisible] = useState(true);
  
  // Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Define Capabilities per Agent
  const capabilities = {
    [AgentMode.UNIVERSAL]: ["Любой вопрос 🧠", "Генерация идей 💡", "Универсальный помощник 🤖"],
    [AgentMode.CHEF]: ["Посчитать калории 📸", "Составить меню 📅", "Рецепт ужина 🍳"],
    [AgentMode.LAWYER]: ["Проверить договор ⚖️", "Составить претензию 📝", "Вопрос юристу 🎓"],
    [AgentMode.FITNESS]: ["Программа тренировок 💪", "Анализ техники 🏋️", "Совет по питанию 🥗"],
    [AgentMode.TRAVEL]: ["Маршрут поездки ✈️", "Гид по городу 🏛", "Советы туристам 🎒"],
    [AgentMode.STYLIST]: ["Оценка лука 👗", "Капсула гардероба 🎨", "Советы по стилю ✨"]
  };

  // Load Profile & Init Telegram
  useEffect(() => {
    // Load Profile
    const stored = localStorage.getItem('nutrigen_user_profile');
    let loadedProfile = DEFAULT_PROFILE;
    
    if (stored) {
      try {
        loadedProfile = JSON.parse(stored);
      } catch (e) { console.error("Profile parse error", e); }
    }

    // Telegram Init
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (tgUser?.first_name) {
        loadedProfile.name = tgUser.first_name;
        setUsername(tgUser.first_name);
      }
    }

    // Streak Logic
    const today = new Date().toDateString();
    const lastVisitDate = new Date(loadedProfile.lastVisit).toDateString();
    
    if (today !== lastVisitDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (yesterday.toDateString() === lastVisitDate) {
        loadedProfile.streak += 1;
      } else {
        loadedProfile.streak = 1; // Reset or start streak
        // Allow streak to be 1 if it's the first visit ever or lost streak
      }
      if (loadedProfile.lastVisit === new Date(0).toISOString()) loadedProfile.streak = 1; // First launch

      loadedProfile.lastVisit = new Date().toISOString();
      localStorage.setItem('nutrigen_user_profile', JSON.stringify(loadedProfile));
    }

    setUserProfile(loadedProfile);
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

  // Save Profile Handler
  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('nutrigen_user_profile', JSON.stringify(newProfile));
  };

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
      setShowAppGrid(false);
    }
  };

  const getAgentStyle = () => {
    switch (activeAgent) {
      case AgentMode.LAWYER: return { 
        bgGradient: 'radial-gradient(at 0% 0%, #E0F2FE 0, transparent 50%), radial-gradient(at 100% 100%, #DBEAFE 0, transparent 50%)',
        accentColor: 'text-blue-900',
        subColor: 'text-blue-600',
        btnClass: 'text-blue-700'
      };
      case AgentMode.FITNESS: return { 
        bgGradient: 'radial-gradient(at 0% 0%, #FFE4E6 0, transparent 50%), radial-gradient(at 100% 100%, #FECDD3 0, transparent 50%)',
        accentColor: 'text-rose-900',
        subColor: 'text-rose-600',
        btnClass: 'text-rose-700'
      };
      case AgentMode.TRAVEL: return { 
        bgGradient: 'radial-gradient(at 0% 0%, #EDE9FE 0, transparent 50%), radial-gradient(at 100% 100%, #DDD6FE 0, transparent 50%)',
        accentColor: 'text-violet-900',
        subColor: 'text-violet-600',
        btnClass: 'text-violet-700'
      };
      case AgentMode.STYLIST: return { 
        bgGradient: 'radial-gradient(at 0% 0%, #FCE7F3 0, transparent 50%), radial-gradient(at 100% 100%, #FBCFE8 0, transparent 50%)',
        accentColor: 'text-pink-900',
        subColor: 'text-pink-600',
        btnClass: 'text-pink-700'
      };
      case AgentMode.UNIVERSAL: return { 
        bgGradient: 'radial-gradient(at 0% 0%, #E0E7FF 0, transparent 50%), radial-gradient(at 100% 100%, #C7D2FE 0, transparent 50%)',
        accentColor: 'text-indigo-900',
        subColor: 'text-indigo-600',
        btnClass: 'text-indigo-700'
      };
      default: return { 
        bgGradient: 'radial-gradient(at 0% 0%, #D1FAE5 0, transparent 50%), radial-gradient(at 100% 100%, #ECFCCB 0, transparent 50%)',
        accentColor: 'text-[#1a2e35]',
        subColor: 'text-emerald-600',
        btnClass: 'text-emerald-700'
      };
    }
  };

  const style = getAgentStyle();

  const getAgentTitle = () => {
     switch(activeAgent) {
       case AgentMode.UNIVERSAL: return 'Universal GPT';
       case AgentMode.LAWYER: return 'AI Юрист';
       case AgentMode.FITNESS: return 'AI Тренер';
       case AgentMode.TRAVEL: return 'AI Гид';
       case AgentMode.STYLIST: return 'AI Стилист';
       default: return 'AI Шеф';
     }
  }

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

    if (currentView === AppView.PHOTO_ANALYZER) return <div className={commonClasses}><Header title="Сканер" /><PhotoAnalyzer agentMode={activeAgent} userProfile={userProfile} /></div>;
    if (currentView === AppView.RECIPES) return <div className={commonClasses}><Header title="Рецепты" /><RecipeFinder userProfile={userProfile} /></div>;
    if (currentView === AppView.MEAL_PLANNER) return <div className={commonClasses}><Header title="Меню" /><MealPlanner userProfile={userProfile} /></div>;
    if (currentView === AppView.HISTORY) return <div className={commonClasses}><Header title="История" /><ProgressChart /></div>;
    if (currentView === AppView.PROFILE) return <div className={commonClasses}><Header title="Настройки" /><ProfileSettings profile={userProfile} onSave={handleSaveProfile} /></div>;
    if (currentView === AppView.DOCUMENT_DRAFTER) return <div className={commonClasses}><Header title="Документы" /><DocumentDrafter userProfile={userProfile} /></div>;
    if (currentView === AppView.WORKOUT_PLANNER) return <div className={commonClasses}><Header title="Тренировка" /><WorkoutPlanner userProfile={userProfile} /></div>;
    if (currentView === AppView.TRIP_PLANNER) return <div className={commonClasses}><Header title="Маршрут" /><TripPlanner userProfile={userProfile} /></div>;
    if (currentView === AppView.CAPSULE_WARDROBE) return <div className={commonClasses}><Header title="Капсула" /><CapsuleBuilder userProfile={userProfile} /></div>;
    
    if (currentView === AppView.CHAT) {
      return (
        <div className="fixed inset-0 z-50 bg-white animate-slide-up flex flex-col">
             <div className="px-4 py-4 pt-[calc(env(safe-area-inset-top)+10px)] flex items-center justify-between border-b border-gray-100 bg-white">
                <div className="flex items-center">
                    <button onClick={() => setCurrentView('HOME')} className="mr-3 p-2 bg-gray-50 rounded-full">
                       <ArrowLeft className="w-6 h-6 text-gray-800" />
                     </button>
                     <span className="font-heading font-bold text-xl">{getAgentTitle()}</span>
                </div>
             </div>
             <div className="flex-1 bg-gray-50">
               <ChatAssistant initialMessage={initialChatMessage} onClearInitial={() => setInitialChatMessage('')} agentMode={activeAgent} userProfile={userProfile} />
             </div>
          </div>
      );
    }
    return null;
  };

  const getMainActionButton = () => {
    // LAWYER: Chat is main
    if (activeAgent === AgentMode.LAWYER) {
      return (
        <button 
           onClick={() => setCurrentView(AppView.CHAT)} 
           className="w-full py-4 bg-white rounded-2xl shadow-lg shadow-gray-200/50 text-gray-800 font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
         >
            <Search className={`w-6 h-6 ${style.btnClass}`}/>
            Чат с Юристом
         </button>
      )
    }

    // FITNESS: Chat is main
    if (activeAgent === AgentMode.FITNESS) {
      return (
        <button 
           onClick={() => setCurrentView(AppView.CHAT)} 
           className="w-full py-4 bg-white rounded-2xl shadow-lg shadow-gray-200/50 text-gray-800 font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
         >
            <Activity className={`w-6 h-6 ${style.btnClass}`}/>
            Чат с Тренером
         </button>
      )
    }

    // TRAVEL: Chat is main
    if (activeAgent === AgentMode.TRAVEL) {
      return (
        <button 
           onClick={() => setCurrentView(AppView.CHAT)} 
           className="w-full py-4 bg-white rounded-2xl shadow-lg shadow-gray-200/50 text-gray-800 font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
         >
            <Globe className={`w-6 h-6 ${style.btnClass}`}/>
            Чат с Гидом
         </button>
      )
    }

    // STYLIST: Chat is main
    if (activeAgent === AgentMode.STYLIST) {
      return (
        <button 
           onClick={() => setCurrentView(AppView.CHAT)} 
           className="w-full py-4 bg-white rounded-2xl shadow-lg shadow-gray-200/50 text-gray-800 font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
         >
            <Shirt className={`w-6 h-6 ${style.btnClass}`}/>
            Чат со Стилистом
         </button>
      )
    }

    // UNIVERSAL: Chat is main
    if (activeAgent === AgentMode.UNIVERSAL) {
      return (
        <button 
           onClick={() => setCurrentView(AppView.CHAT)} 
           className="w-full py-4 bg-white rounded-2xl shadow-lg shadow-gray-200/50 text-gray-800 font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
         >
            <MessageCircle className={`w-6 h-6 ${style.btnClass}`}/>
            Чат с GPT
         </button>
      )
    }
    
    // CHEF: Chat is main
    return (
       <button 
         onClick={() => setCurrentView(AppView.CHAT)} 
         className="w-full py-4 bg-white rounded-2xl shadow-lg shadow-gray-200/50 text-gray-800 font-bold text-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
       >
          <Search className={`w-6 h-6 ${style.btnClass}`}/>
          Чат с Шефом
       </button>
    )
  }

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
           <div className="flex gap-2">
               <button onClick={() => setCurrentView(AppView.HISTORY)} className="w-12 h-12 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                 <History className="w-5 h-5 text-gray-700" />
               </button>
               <button onClick={() => setShowAppGrid(true)} className="w-12 h-12 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                 <Grid className="w-5 h-5 text-gray-700" />
               </button>
           </div>
           
           <div className="flex gap-2">
               <button onClick={() => setCurrentView(AppView.PROFILE)} className="w-12 h-12 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                 <User className="w-5 h-5 text-gray-700" />
               </button>
           </div>
        </div>

        {/* Hero Greeting */}
        <div className="flex-1 flex flex-col items-center justify-center text-center z-10 -mt-20">
           
           <div className={`mb-4 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-white/50 backdrop-blur-sm ${style.subColor} shadow-sm flex items-center gap-2`}>
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             {activeAgent === AgentMode.UNIVERSAL ? 'AI Ассистент' : 
              activeAgent === AgentMode.LAWYER ? 'Юридический Помощник' : 
              activeAgent === AgentMode.FITNESS ? 'Фитнес Тренер' : 
              activeAgent === AgentMode.TRAVEL ? 'Тревел Гид' :
              activeAgent === AgentMode.STYLIST ? 'Фешн Стилист' : 'Персональный Шеф'}
           </div>

           <h1 className={`text-6xl font-heading font-extrabold ${style.accentColor} tracking-tight leading-[1.1] mb-4 animate-pop-in`}>
             Привет,<br />{username}
           </h1>
           
           {/* Streak Badge */}
           <div className="mb-6 animate-pop-in" style={{ animationDelay: '0.1s' }}>
             <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100/50 rounded-full text-orange-700 text-xs font-bold border border-orange-200/50">
               <Zap className="w-3 h-3 fill-orange-500 text-orange-500"/> {userProfile.streak} дней подряд
             </span>
           </div>

           <div className="h-8 flex items-center justify-center overflow-hidden mb-8">
             <p className={`text-xl ${style.subColor} font-medium transition-all duration-500 ease-in-out transform ${isCapabilityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
               {capabilities[activeAgent][capabilityIndex]}
             </p>
           </div>
           
           {/* Contextual Action Buttons */}
           <div className="grid grid-cols-1 gap-3 w-full max-w-xs animate-pop-in relative z-20" style={{ animationDelay: '0.2s' }}>
             
             {/* Main Primary Action */}
             {getMainActionButton()}

             {/* Secondary Actions */}
             <div className="grid grid-cols-2 gap-3">
                
                {/* CHEF SPECIFIC */}
                {activeAgent === AgentMode.CHEF && (
                   <>
                     <button onClick={() => setCurrentView(AppView.PHOTO_ANALYZER)} className="py-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm font-bold text-sm flex flex-col items-center justify-center gap-1 hover:bg-white transition-colors">
                       <Camera className={`w-5 h-5 ${style.btnClass}`}/>
                       Сканер Еды
                     </button>
                     <button onClick={() => setCurrentView(AppView.RECIPES)} className="py-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm font-bold text-sm flex flex-col items-center justify-center gap-1 hover:bg-white transition-colors">
                       <ChefHat className={`w-5 h-5 ${style.btnClass}`}/>
                       Рецепты
                     </button>
                   </>
                )}

                {/* LAWYER SPECIFIC */}
                {activeAgent === AgentMode.LAWYER && (
                   <>
                     <button onClick={() => setCurrentView(AppView.PHOTO_ANALYZER)} className="py-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm font-bold text-sm flex flex-col items-center justify-center gap-1 hover:bg-white transition-colors">
                       <Camera className={`w-5 h-5 ${style.btnClass}`}/>
                       Сканер Док.
                     </button>
                     <button onClick={() => setCurrentView(AppView.DOCUMENT_DRAFTER)} className="py-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm font-bold text-sm flex flex-col items-center justify-center gap-1 hover:bg-white transition-colors">
                       <FileText className={`w-5 h-5 ${style.btnClass}`}/>
                       Составить
                     </button>
                   </>
                )}

                {/* FITNESS SPECIFIC */}
                {activeAgent === AgentMode.FITNESS && (
                   <>
                     <button onClick={() => setCurrentView(AppView.PHOTO_ANALYZER)} className="py-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm font-bold text-sm flex flex-col items-center justify-center gap-1 hover:bg-white transition-colors">
                       <Camera className={`w-5 h-5 ${style.btnClass}`}/>
                       Сканер
                     </button>
                     <button onClick={() => setCurrentView(AppView.WORKOUT_PLANNER)} className="py-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm font-bold text-sm flex flex-col items-center justify-center gap-1 hover:bg-white transition-colors">
                       <Dumbbell className={`w-5 h-5 ${style.btnClass}`}/>
                       Тренировка
                     </button>
                   </>
                )}

                {/* TRAVEL SPECIFIC */}
                {activeAgent === AgentMode.TRAVEL && (
                   <>
                     <button onClick={() => setCurrentView(AppView.PHOTO_ANALYZER)} className="py-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm font-bold text-sm flex flex-col items-center justify-center gap-1 hover:bg-white transition-colors">
                       <Camera className={`w-5 h-5 ${style.btnClass}`}/>
                       Сканер
                     </button>
                     <button onClick={() => setCurrentView(AppView.TRIP_PLANNER)} className="py-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm font-bold text-sm flex flex-col items-center justify-center gap-1 hover:bg-white transition-colors">
                       <MapPin className={`w-5 h-5 ${style.btnClass}`}/>
                       Маршрут
                     </button>
                   </>
                )}

                {/* STYLIST SPECIFIC */}
                {activeAgent === AgentMode.STYLIST && (
                   <>
                     <button onClick={() => setCurrentView(AppView.PHOTO_ANALYZER)} className="py-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm font-bold text-sm flex flex-col items-center justify-center gap-1 hover:bg-white transition-colors">
                       <Camera className={`w-5 h-5 ${style.btnClass}`}/>
                       Оценить Лук
                     </button>
                     <button onClick={() => setCurrentView(AppView.CAPSULE_WARDROBE)} className="py-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm font-bold text-sm flex flex-col items-center justify-center gap-1 hover:bg-white transition-colors">
                       <Layers className={`w-5 h-5 ${style.btnClass}`}/>
                       Капсула
                     </button>
                   </>
                )}

                {/* UNIVERSAL SPECIFIC */}
                {activeAgent === AgentMode.UNIVERSAL && (
                   <>
                     <button onClick={() => setCurrentView(AppView.PHOTO_ANALYZER)} className="py-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm font-bold text-sm flex flex-col items-center justify-center gap-1 hover:bg-white transition-colors">
                       <Camera className={`w-5 h-5 ${style.btnClass}`}/>
                       Умный Сканер
                     </button>
                     <button onClick={() => setCurrentView(AppView.CHAT)} className="py-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm font-bold text-sm flex flex-col items-center justify-center gap-1 hover:bg-white transition-colors">
                       <BrainCircuit className={`w-5 h-5 ${style.btnClass}`}/>
                       Брейншторм
                     </button>
                   </>
                )}
             </div>

           </div>
        </div>

        {/* BOTTOM FLOATING BAR */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-30">
          <button 
            onClick={() => setShowAppGrid(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform"
          >
            <Grid className="w-5 h-5" />
            <span className="font-bold">Все приложения</span>
          </button>
        </div>

      </div>

      {/* APP GRID OVERLAY */}
      {showAppGrid && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xl flex flex-col justify-end animate-fade-in" onClick={() => setShowAppGrid(false)}>
          <div className="bg-white rounded-t-[2.5rem] p-8 pb-12 animate-slide-up" onClick={(e) => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-heading font-bold text-gray-900">Приложения</h3>
               <button onClick={() => setShowAppGrid(false)} className="p-2 bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500"/></button>
             </div>
             
             <div className="grid grid-cols-3 gap-y-8 gap-x-4">
               {/* Universal GPT */}
               <div onClick={() => switchAgent(AgentMode.UNIVERSAL)} className="flex flex-col items-center gap-2 cursor-pointer group">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${activeAgent === AgentMode.UNIVERSAL ? 'bg-indigo-600 text-white shadow-indigo-500/40' : 'bg-white border border-gray-100 text-indigo-600'}`}>
                   <Sparkles className="w-8 h-8"/>
                 </div>
                 <span className="text-xs font-bold text-gray-600">GPT</span>
               </div>
               
               {/* Chef */}
               <div onClick={() => switchAgent(AgentMode.CHEF)} className="flex flex-col items-center gap-2 cursor-pointer group">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${activeAgent === AgentMode.CHEF ? 'bg-emerald-500 text-white shadow-emerald-500/40' : 'bg-white border border-gray-100 text-emerald-600'}`}>
                   <ChefHat className="w-8 h-8"/>
                 </div>
                 <span className="text-xs font-bold text-gray-600">Шеф</span>
               </div>

               {/* Lawyer */}
               <div onClick={() => switchAgent(AgentMode.LAWYER)} className="flex flex-col items-center gap-2 cursor-pointer group">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${activeAgent === AgentMode.LAWYER ? 'bg-blue-500 text-white shadow-blue-500/40' : 'bg-white border border-gray-100 text-blue-600'}`}>
                   <Scale className="w-8 h-8"/>
                 </div>
                 <span className="text-xs font-bold text-gray-600">Юрист</span>
               </div>

               {/* Fitness */}
               <div onClick={() => switchAgent(AgentMode.FITNESS)} className="flex flex-col items-center gap-2 cursor-pointer group">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${activeAgent === AgentMode.FITNESS ? 'bg-rose-500 text-white shadow-rose-500/40' : 'bg-white border border-gray-100 text-rose-600'}`}>
                   <Activity className="w-8 h-8"/>
                 </div>
                 <span className="text-xs font-bold text-gray-600">Тренер</span>
               </div>

               {/* Travel */}
               <div onClick={() => switchAgent(AgentMode.TRAVEL)} className="flex flex-col items-center gap-2 cursor-pointer group">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${activeAgent === AgentMode.TRAVEL ? 'bg-violet-500 text-white shadow-violet-500/40' : 'bg-white border border-gray-100 text-violet-600'}`}>
                   <Globe className="w-8 h-8"/>
                 </div>
                 <span className="text-xs font-bold text-gray-600">Гид</span>
               </div>

               {/* Stylist */}
               <div onClick={() => switchAgent(AgentMode.STYLIST)} className="flex flex-col items-center gap-2 cursor-pointer group">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${activeAgent === AgentMode.STYLIST ? 'bg-pink-500 text-white shadow-pink-500/40' : 'bg-white border border-gray-100 text-pink-600'}`}>
                   <Shirt className="w-8 h-8"/>
                 </div>
                 <span className="text-xs font-bold text-gray-600">Стилист</span>
               </div>

             </div>
          </div>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
};

export default App;