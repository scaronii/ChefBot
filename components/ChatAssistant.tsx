import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { createChatSession } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Привет! Я ваш ИИ-диетолог. Спросите меня о чем угодно: как похудеть, чем полезно авокадо или как рассчитать норму воды.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatSession = useRef<any>(null);

  useEffect(() => {
    if (!chatSession.current) {
      chatSession.current = createChatSession();
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await chatSession.current.sendMessage({ message: userMsg.text });
      const responseText = result.text;
      
      const botMsg: ChatMessage = { 
        role: 'model', 
        text: responseText, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: 'Извините, произошла ошибка. Пожалуйста, попробуйте позже.', 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[700px] flex flex-col bg-white rounded-[2.5rem] shadow-xl shadow-emerald-900/5 border border-gray-100 overflow-hidden animate-fade-in">
      <div className="bg-white/80 backdrop-blur-md p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-200">
             <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-gray-900 leading-none mb-1">AI Нутрициолог</h3>
            <p className="text-xs text-green-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Онлайн
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] lg:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-gray-900' : 'bg-white border border-gray-100'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-purple-500" />}
              </div>
              
              <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-gray-900 text-white rounded-tr-sm' 
                  : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
              }`}>
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 dark:prose-invert">
                   <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                <div className={`text-[10px] mt-2 opacity-60 font-medium ${msg.role === 'user' ? 'text-gray-300' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="flex gap-3 items-center bg-white px-5 py-3 rounded-full border border-gray-100 shadow-sm">
               <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
               <span className="text-xs font-bold text-gray-400 tracking-wide">AI печатает...</span>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 md:p-6 bg-white border-t border-gray-100">
        <div className="flex gap-3 bg-gray-50 p-2 rounded-[1.5rem] border border-gray-100 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Спросите о продуктах, диетах..."
            className="flex-1 bg-transparent p-3 pl-4 outline-none text-gray-800 placeholder-gray-400 font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-gray-900 text-white p-3 rounded-2xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;