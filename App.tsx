import React, { useState } from 'react';
import { Camera, ChefHat, Calendar, MessageCircle, LayoutDashboard, UtensilsCrossed, Menu, X, ArrowRight } from 'lucide-react';
import PhotoAnalyzer from './components/PhotoAnalyzer';
import RecipeFinder from './components/RecipeFinder';
import MealPlanner from './components/MealPlanner';
import ChatAssistant from './components/ChatAssistant';
import ProgressChart from './components/ProgressChart';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (currentView) {
      case AppView.PHOTO_ANALYZER:
        return <PhotoAnalyzer />;
      case AppView.RECIPES:
        return <RecipeFinder />;
      case AppView.MEAL_PLANNER:
        return <MealPlanner />;
      case AppView.CHAT:
        return <ChatAssistant />;
      case AppView.DASHBOARD:
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile Header */}
      <div className="md:hidden bg-white/80 backdrop-blur-xl sticky top-0 z-40 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
         <div className="flex items-center gap-2" onClick={() => setCurrentView(AppView.DASHBOARD)}>
            <AppLogoSmall />
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
           {isMobileMenuOpen ? <X /> : <Menu />}
         </button>
      </div>

      {/* Mobile Fullscreen Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-white pt-20 px-6 space-y-4 md:hidden animate-fade-in">
           <NavButton active={currentView === AppView.DASHBOARD} onClick={() => { setCurrentView(AppView.DASHBOARD); closeMobileMenu(); }} icon={<LayoutDashboard />} label="Главная" />
           <NavButton active={currentView === AppView.PHOTO_ANALYZER} onClick={() => { setCurrentView(AppView.PHOTO_ANALYZER); closeMobileMenu(); }} icon={<Camera />} label="Сканер Еды" />
           <NavButton active={currentView === AppView.RECIPES} onClick={() => { setCurrentView(AppView.RECIPES); closeMobileMenu(); }} icon={<ChefHat />} label="Шеф-Повар" />
           <NavButton active={currentView === AppView.MEAL_PLANNER} onClick={() => { setCurrentView(AppView.MEAL_PLANNER); closeMobileMenu(); }} icon={<Calendar />} label="План Питания" />
           <NavButton active={currentView === AppView.CHAT} onClick={() => { setCurrentView(AppView.CHAT); closeMobileMenu(); }} icon={<MessageCircle />} label="Чат с Нутрициологом" />
        </div>
      )}

      {/* Sidebar Desktop */}
      <nav className="hidden md:flex flex-col w-72 fixed left-0 top-0 bottom-0 bg-white border-r border-gray-100 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 pb-4">
           <AppLogoLarge />
        </div>
        
        <div className="flex-1 px-4 py-6 space-y-1.5">
          <NavButton 
            active={currentView === AppView.DASHBOARD} 
            onClick={() => setCurrentView(AppView.DASHBOARD)} 
            icon={<LayoutDashboard />} 
            label="Главная" 
          />
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Функции</div>
          <NavButton 
            active={currentView === AppView.PHOTO_ANALYZER} 
            onClick={() => setCurrentView(AppView.PHOTO_ANALYZER)} 
            icon={<Camera />} 
            label="Сканер Еды" 
          />
          <NavButton 
            active={currentView === AppView.RECIPES} 
            onClick={() => setCurrentView(AppView.RECIPES)} 
            icon={<ChefHat />} 
            label="Шеф-Повар" 
          />
          <NavButton 
            active={currentView === AppView.MEAL_PLANNER} 
            onClick={() => setCurrentView(AppView.MEAL_PLANNER)} 
            icon={<Calendar />} 
            label="План Питания" 
          />
          <NavButton 
            active={currentView === AppView.CHAT} 
            onClick={() => setCurrentView(AppView.CHAT)} 
            icon={<MessageCircle />} 
            label="AI Чат" 
          />
        </div>
        
        <div className="p-6">
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
            <h4 className="font-heading font-bold text-emerald-900 mb-1">Нужна помощь?</h4>
            <p className="text-xs text-emerald-700 mb-3">Спросите AI диетолога о чем угодно.</p>
            <button 
              onClick={() => setCurrentView(AppView.CHAT)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg transition-colors"
            >
              Начать чат
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:pl-72 min-h-screen transition-all duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const Dashboard: React.FC<{ onViewChange: (view: AppView) => void }> = ({ onViewChange }) => (
  <div className="space-y-8 animate-fade-in pb-10">
    {/* Hero Section */}
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-gray-200 relative overflow-hidden group">
      <div className="relative z-10 max-w-2xl">
        <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-4 text-emerald-300">
          ✨ Твой персональный помощник
        </span>
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight">
          Привет! <br/>Что приготовим сегодня?
        </h1>
        <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-lg">
          Загрузите фото продуктов или готового блюда, и я помогу рассчитать калории или придумать рецепт.
        </p>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => onViewChange(AppView.PHOTO_ANALYZER)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-bold transition-all transform hover:-translate-y-1 shadow-lg shadow-emerald-500/20"
          >
            <Camera className="w-5 h-5" />
            Сканировать еду
          </button>
          <button 
            onClick={() => onViewChange(AppView.RECIPES)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-8 py-4 rounded-2xl font-bold transition-all border border-white/10"
          >
            <ChefHat className="w-5 h-5" />
            Найти рецепт
          </button>
        </div>
      </div>
      
      {/* Abstract Background Decoration */}
      <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 group-hover:bg-emerald-500/30 transition-all duration-1000"></div>
      <div className="absolute right-20 bottom-0 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[80px] translate-y-1/3 group-hover:bg-blue-500/30 transition-all duration-1000"></div>
      
      {/* Floating 3D-like Icon */}
      <div className="absolute -right-6 md:right-10 top-1/2 -translate-y-1/2 opacity-20 md:opacity-100 transform rotate-12 transition-transform duration-700 group-hover:rotate-6 group-hover:scale-110">
        <UtensilsCrossed size={320} className="text-white/5" />
      </div>
    </div>

    {/* Stats & Charts Area */}
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-3">
        <ProgressChart />
      </div>
    </div>

    {/* Features Grid (Bento Box Style) */}
    <div>
      <h2 className="text-2xl font-heading font-bold text-gray-800 mb-6 flex items-center gap-2">
        Быстрый доступ
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        <BentoCard 
          title="Умный Повар" 
          desc="Рецепты из того, что есть в холодильнике." 
          icon={<ChefHat className="w-8 h-8 text-white" />}
          onClick={() => onViewChange(AppView.RECIPES)}
          bgClass="bg-gradient-to-br from-orange-400 to-red-500"
          delay="0"
        />
        <BentoCard 
          title="План Питания" 
          desc="Меню и список покупок на неделю." 
          icon={<Calendar className="w-8 h-8 text-white" />}
          onClick={() => onViewChange(AppView.MEAL_PLANNER)}
          bgClass="bg-gradient-to-br from-blue-400 to-indigo-500"
          delay="100"
        />
        <BentoCard 
          title="AI Нутрициолог" 
          desc="Задайте любой вопрос о здоровье." 
          icon={<MessageCircle className="w-8 h-8 text-white" />}
          onClick={() => onViewChange(AppView.CHAT)}
          bgClass="bg-gradient-to-br from-purple-400 to-pink-500"
          delay="200"
        />
      </div>
    </div>
  </div>
);

const BentoCard: React.FC<any> = ({ title, desc, icon, onClick, bgClass, delay }) => (
  <div 
    onClick={onClick}
    className="group relative overflow-hidden rounded-[2rem] h-64 cursor-pointer hover:shadow-xl hover:shadow-gray-200 transition-all duration-300 transform hover:-translate-y-1"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`absolute inset-0 ${bgClass} opacity-90 transition-opacity`}></div>
    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
    
    <div className="relative h-full p-8 flex flex-col justify-between z-10 text-white">
      <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-heading font-bold mb-2">{title}</h3>
        <p className="text-white/80 font-medium leading-snug">{desc}</p>
      </div>
      
      <div className="absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
         <div className="bg-white text-gray-900 rounded-full p-3 shadow-lg">
            <ArrowRight className="w-5 h-5" />
         </div>
      </div>
    </div>
  </div>
);

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl transition-all duration-200 group ${
      active 
        ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm shadow-emerald-100' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
    }`}
  >
    <div className={`transition-colors ${active ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 22, strokeWidth: active ? 2.5 : 2 })}
    </div>
    {label}
  </button>
);

const AppLogoLarge: React.FC = () => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 text-white">
       <ChefHat size={24} strokeWidth={2.5} />
    </div>
    <div>
      <h1 className="font-heading font-extrabold text-xl text-gray-900 leading-none">Шеф</h1>
      <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">в кармане</span>
    </div>
  </div>
);

const AppLogoSmall: React.FC = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
       <ChefHat size={18} />
    </div>
    <span className="font-heading font-bold text-gray-900">Шеф</span>
  </div>
);

export default App;