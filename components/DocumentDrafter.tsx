
import React, { useState } from 'react';
import { FileText, Sparkles, Copy, Check, Scale, ArrowRight, Loader2 } from 'lucide-react';
import { draftDocument } from '../services/geminiService';
import { UserProfile } from '../types';
import ReactMarkdown from 'react-markdown';

interface DocumentDrafterProps {
  userProfile?: UserProfile;
}

const DocumentDrafter: React.FC<DocumentDrafterProps> = ({ userProfile }) => {
  const [docType, setDocType] = useState('Претензия');
  const [details, setDetails] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const triggerHaptic = (style: 'light' | 'medium' | 'success' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      if (style === 'success') window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      else window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const handleGenerate = async () => {
    if (!details.trim()) return;
    setLoading(true);
    setDraft('');
    triggerHaptic('medium');

    try {
      const result = await draftDocument(docType, details, userProfile);
      setDraft(result.content);
      triggerHaptic('success');
    } catch (error) {
      alert('Ошибка при генерации документа');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    triggerHaptic('success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-blue-50">
        <div className="flex items-center gap-4 mb-6">
           <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
             <FileText className="w-7 h-7" />
           </div>
           <div>
             <h2 className="text-3xl font-heading font-bold text-gray-900">
               Конструктор Документов
             </h2>
             <p className="text-gray-500">Опишите ситуацию, и AI составит документ.</p>
           </div>
        </div>

        <div className="space-y-4">
           <div>
             <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Тип Документа</label>
             <select 
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-gray-800 transition-all appearance-none"
             >
               <option>Претензия (Жалоба)</option>
               <option>Договор аренды</option>
               <option>Договор оказания услуг</option>
               <option>Доверенность</option>
               <option>Исковое заявление</option>
               <option>Расписка</option>
               <option>Заявление на отпуск</option>
               <option>Другое</option>
             </select>
           </div>
           
           <div>
             <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Детали и Суть</label>
             <textarea 
               value={details}
               onChange={(e) => setDetails(e.target.value)}
               placeholder="Например: Купил телефон 10.05.2024 в магазине 'Техно', он сломался через неделю. Хочу вернуть деньги. Стоимость 50000р."
               className="w-full h-32 p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-gray-800 resize-none transition-all"
             />
           </div>

           <button
            onClick={handleGenerate}
            disabled={loading || !details.trim()}
            className="w-full bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-colors font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'Юрист составляет...' : 'Сгенерировать Документ'}
          </button>
        </div>
      </div>

      {draft && (
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 animate-slide-up">
           <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-xl font-heading font-bold text-gray-800 flex items-center gap-2">
                 <Scale className="w-5 h-5 text-blue-600"/> Черновик
              </h3>
              <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                {copied ? 'Скопировано' : 'Копировать'}
              </button>
           </div>
           <div className="prose prose-sm md:prose-base max-w-none text-gray-800 font-serif whitespace-pre-wrap leading-relaxed">
             <ReactMarkdown>{draft}</ReactMarkdown>
           </div>
           <div className="mt-8 p-4 bg-yellow-50 text-yellow-800 text-sm rounded-xl border border-yellow-100">
             ⚠️ <b>Важно:</b> Это автоматический черновик. Обязательно проверьте его и заполните все данные в скобках [ ] перед использованием.
           </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDrafter;