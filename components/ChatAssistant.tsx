

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, Sparkles, Scale, Dumbbell, ChefHat, Globe, Shirt, Palette, Paperclip, Mic, X, Image as ImageIcon, FileText } from 'lucide-react';
import { ChatMessage, AgentMode, UserProfile, Attachment } from '../types';
import { sendMessageToChat } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ChatAssistantProps {
  initialMessage?: string;
  onClearInitial?: () => void;
  agentMode: AgentMode;
  userProfile?: UserProfile;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ initialMessage, onClearInitial, agentMode, userProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Attachments State
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Welcome Message based on Agent
  useEffect(() => {
    let welcomeText = '';
    const name = userProfile?.name ? `, ${userProfile.name}` : '';

    switch (agentMode) {
      case AgentMode.LAWYER:
        welcomeText = `Здравствуйте${name}. Я ваш ИИ-Юрист. \n\nЯ могу:\n⚖️ Проверить договор по фото (или PDF)\n📄 Составить претензию\n❓ Ответить на вопросы по законам РФ.`;
        break;
      case AgentMode.FITNESS:
        welcomeText = `Привет${name}! 💪 Я твой Фитнес-Тренер. \n\nДавай сделаем форму мечты:\n🏋️ Программа тренировок\n🥗 Спортивное питание\n🏃 Техника упражнений`;
        break;
      case AgentMode.TRAVEL:
        welcomeText = `Привет${name}! 🌍 Я твой Тревел-Гид. \n\nКуда отправимся?\n🏛 Расскажу историю места\n📍 Подскажу скрытые локации\n✈️ Спланирую маршрут`;
        break;
      case AgentMode.STYLIST:
        welcomeText = `Хей${name}! ✨ Я твой AI Стилист. \n\nДавай разберем гардероб:\n👗 Оценю лук по фото\n🎨 Подберу цвета\n🛍 Посоветую тренды`;
        break;
      case AgentMode.ARTIST:
        welcomeText = `Привет${name}! 🎨 Я твой AI Художник и Креатор. \n\nДавай творить искусство:\n🖼 Создам уникальные изображения\n🖌 Подскажу промпты\n🎭 Обсудим стили`;
        break;
      case AgentMode.UNIVERSAL:
        welcomeText = `Привет${name}! 🤖 Я Универсальный GPT-ассистент.\n\nЯ могу помочь практически с чем угодно:\n🧠 Брейншторм идей\n📝 Написание текстов\n🔍 Поиск информации\n\nПросто спроси или отправь файл!`;
        break;
      default:
        welcomeText = `Привет${name}! Я ваш Шеф-повар. 🍳\n\nМогу:\n🥦 Посчитать калории\n🥘 Придумать рецепт\n🥂 Составить меню для гостей`;
    }
    setMessages([{ role: 'model', text: welcomeText, timestamp: new Date() }]);
  }, [agentMode, userProfile]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Raw = reader.result as string;
        const base64Data = base64Raw.split(',')[1];
        
        setSelectedAttachment({
           type: file.type.startsWith('image/') ? 'image' : 'file',
           mimeType: file.type,
           data: base64Data,
           fileName: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Ваш браузер не поддерживает голосовой ввод.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if ((!textToSend.trim() && !selectedAttachment) || loading) return;

    if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');

    const attachmentToSend = selectedAttachment ? { ...selectedAttachment } : undefined;

    const userMsg: ChatMessage = { 
        role: 'user', 
        text: textToSend, 
        attachment: attachmentToSend,
        timestamp: new Date() 
    };
    
    // Optimistic update
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedAttachment(null);
    setLoading(true);

    const currentHistory = [...messages]; 

    try {
      const result = await sendMessageToChat(userMsg.text, currentHistory, agentMode, userProfile, attachmentToSend);
      
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
    if (agentMode === AgentMode.TRAVEL) return 'violet';
    if (agentMode === AgentMode.STYLIST) return 'pink';
    if (agentMode === AgentMode.ARTIST) return 'fuchsia';
    if (agentMode === AgentMode.UNIVERSAL) return 'indigo';
    return 'emerald';
  };
  const theme = getThemeColor();

  const getIcon = () => {
    if (agentMode === AgentMode.LAWYER) return <Scale className="w-5 h-5"/>;
    if (agentMode === AgentMode.FITNESS) return <Dumbbell className="w-5 h-5"/>;
    if (agentMode === AgentMode.TRAVEL) return <Globe className="w-5 h-5"/>;
    if (agentMode === AgentMode.STYLIST) return <Shirt className="w-5 h-5"/>;
    if (agentMode === AgentMode.ARTIST) return <Palette className="w-5 h-5"/>;
    if (agentMode === AgentMode.UNIVERSAL) return <Sparkles className="w-5 h-5"/>;
    return <ChefHat className="w-5 h-5"/>;
  }

  return (
    <div className={`max-w-4xl mx-auto h-[calc(100vh-140px)] md:h-[700px] flex flex-col bg-white rounded-[2rem] shadow-xl shadow-${theme}-900/5 border border-gray-100 overflow-hidden animate-fade-in`}>
      <div className="bg-white/80 backdrop-blur-md p-4 md:p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-tr from-${theme}-500 to-${theme}-400 rounded-full flex items-center justify-center text-white shadow-lg`}>
             {getIcon()}
          </div>
          <div>
            <h3 className="font-heading font-bold text-gray-900 leading-none mb-1">
              {agentMode === AgentMode.LAWYER ? 'AI Юрист' : agentMode === AgentMode.FITNESS ? 'AI Тренер' : agentMode === AgentMode.TRAVEL ? 'AI Гид' : agentMode === AgentMode.STYLIST ? 'AI Стилист' : agentMode === AgentMode.ARTIST ? 'AI Генерация' : agentMode === AgentMode.UNIVERSAL ? 'Universal GPT' : 'AI Шеф'}
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
            <div className={`flex flex-col gap-2 max-w-[90%] md:max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
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
                    {msg.attachment && (
                        <div className="mb-3">
                            {msg.attachment.type === 'image' ? (
                               <img src={`data:${msg.attachment.mimeType};base64,${msg.attachment.data}`} alt="Attachment" className="max-w-full h-auto rounded-lg border border-white/20" />
                            ) : (
                               <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg border border-white/20 text-white">
                                  <FileText className="w-5 h-5" />
                                  <span className="font-bold truncate max-w-[150px]">{msg.attachment.fileName}</span>
                               </div>
                            )}
                        </div>
                    )}
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 dark:prose-invert">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
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
        
        {/* Attachment Preview */}
        {selectedAttachment && (
            <div className="mb-2 relative inline-flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                {selectedAttachment.type === 'image' ? (
                    <img src={`data:${selectedAttachment.mimeType};base64,${selectedAttachment.data}`} alt="Preview" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-500" />
                    </div>
                )}
                <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">{selectedAttachment.fileName}</span>
                <button 
                    onClick={() => setSelectedAttachment(null)}
                    className="ml-2 bg-gray-900 text-white rounded-full p-1 shadow-md hover:bg-red-500 transition-colors"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        )}

        <div className={`flex gap-2 md:gap-3 bg-gray-50 p-2 rounded-[1.5rem] border border-gray-100 focus-within:ring-2 focus-within:ring-${theme}-500/20 transition-all items-end`}>
          
          <button 
             onClick={() => fileInputRef.current?.click()}
             className="p-3 text-gray-400 hover:text-gray-600 transition-colors rounded-xl hover:bg-gray-200"
             title="Прикрепить файл"
          >
             <Paperclip className="w-5 h-5" />
          </button>
          <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileChange} 
             accept="image/*,application/pdf" 
             className="hidden" 
          />

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            }}
            placeholder={isRecording ? "Говорите..." : "Сообщение..."}
            className="flex-1 bg-transparent p-3 outline-none text-gray-800 placeholder-gray-400 font-medium text-sm md:text-base resize-none max-h-32 min-h-[44px]"
            rows={1}
          />
          
          <button
             onClick={toggleRecording}
             className={`p-3 transition-colors rounded-xl ${isRecording ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
          >
             <Mic className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleSend()}
            disabled={(!input.trim() && !selectedAttachment) || loading}
            className="bg-gray-900 text-white p-3 rounded-2xl hover:bg-black transition-colors disabled:opacity-50 shadow-md mb-0.5"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
