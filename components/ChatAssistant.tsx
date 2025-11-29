
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, Sparkles, Scale, Dumbbell, ChefHat } from 'lucide-react';
import { ChatMessage, AgentMode } from '../types';
import { sendMessageToChat } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ChatAssistantProps {
  initialMessage?: string;
  onClearInitial?: () => void;
  agentMode: AgentMode;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ initialMessage, onClearInitial, agentMode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Initialize Welcome Message based on Agent
  useEffect(() => {
    let welcomeText = '';
    switch (agentMode) {
      case AgentMode.LAWYER:
        welcomeText = 'Здравствуйте. Я ваш ИИ-Юрист. \n\nЯ могу:\n⚖️ Проверить договор по фото\n📄 Составить претензию\n❓ Ответить на вопросы по законам РФ.\n\nЧем могу быть полезен?';
        break;
      case AgentMode.FITNESS:
        welcomeText = 'Привет, атлет! 💪 Я твой Фитнес-Тренер. \n\nДавай сделаем форму мечты:\n🏋️ Программа тренировок\n🥗 Спортивное питание\n🏃 Техника упражнений\n\nГотов работать?';
        break;
      default:
        welcomeText = 'Привет! Я ваш Шеф-повар. 🍳\n\nМогу:\n🥦 Посчитать калории\n🥘 Придумать рецепт\n🥂 Составить меню для гостей\n\nЧто готовим?';
    }
    setMessages([{ role: 'model', text: welcomeText, timestamp: new Date() }]);
  }, [agentMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialMessage && !initializedRef.current) {
      initializedRef.current = true;
      handleSend(initialMessage);
      if (onClearInitial) onClearInitial();
    }
  }, [initialMessage]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || loading) return;

    if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');

    const userMsg: ChatMessage = { role: 'user', text: textToSend, timestamp: new Date() };
    const currentHistory = [...messages]; 
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await sendMessageToChat(userMsg.text, currentHistory, agentMode);
      if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      
      const botMsg: ChatMessage = { 
        role: 'model', 
        text: result.text, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Ошибка соединения. Попробуйте еще раз.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const getThemeColor = () => {
    if (agentMode === AgentMode.LAWYER) return 'blue';
    if (agentMode === AgentMode.FITNESS) return 'red';
    return 'emerald';
  };
  const theme = getThemeColor();

  return (
    <div className={`max-w-4xl mx-auto h-[calc(100vh-140px)] md:h-[700px] flex flex-col bg-white rounded-[2rem] shadow-xl shadow-${theme}-900/5 border border-gray-100 overflow-hidden animate-fade-in`}>
      <div className="bg-white/80 backdrop-blur-md p-4 md:p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-tr from-${theme}-500 to-${theme}-400 rounded-full flex items-center justify-center text-white shadow-lg`}>
             {agentMode === AgentMode.LAWYER ? <Scale className="w-5 h-5"/> : agentMode === AgentMode.FITNESS ? <Dumbbell className="w-5 h-5"/> : <ChefHat className="w-5 h-5"/>}
          </div>
          <div>
            <h3 className="font-heading font-bold text-gray-900 leading-none mb-1">
              {agentMode === AgentMode.LAWYER ? 'AI Юрист' : agentMode === AgentMode.FITNESS ? 'AI Тренер' : 'AI Шеф'}
            </h3>
            <p className="text-xs text-green-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Онлайн
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[90%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-gray-900' : 'bg-white border border-gray-100'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className={`w-4 h-4 text-${theme}-500`} />}
              </div>
              
              <div className={`p-3 md:p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-gray-900 text-white rounded-tr-sm' 
                  : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
              }`}>
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 dark:prose-invert">
                   <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="flex gap-3 items-center bg-white px-5 py-3 rounded-full border border-gray-100 shadow-sm">
               <Loader2 className={`w-4 h-4 animate-spin text-${theme}-500`} />
               <span className="text-xs font-bold text-gray-400 tracking-wide">Печатает...</span>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 md:p-6 bg-white border-t border-gray-100">
        <div className={`flex gap-2 md:gap-3 bg-gray-50 p-2 rounded-[1.5rem] border border-gray-100 focus-within:ring-2 focus-within:ring-${theme}-500/20 transition-all`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Введите сообщение..."
            className="flex-1 bg-transparent p-2 md:p-3 pl-2 outline-none text-gray-800 placeholder-gray-400 font-medium text-sm md:text-base"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="bg-gray-900 text-white p-3 rounded-2xl hover:bg-black transition-colors disabled:opacity-50 shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
