
import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle, AlertCircle, Plus, Share2, Scale, Dumbbell, MapPin, Palette, AlertTriangle, ShieldCheck, Shirt, Globe } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';
import { saveHistoryItem } from '../services/historyService';
import { AgentMode, UniversalAnalysisResult, FoodAnalysisResult, DocumentAnalysisResult, EquipmentAnalysisResult, LandmarkAnalysisResult, FashionAnalysisResult, UserProfile } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ScannerProps {
  agentMode: AgentMode;
  userProfile?: UserProfile;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B'];

const PhotoAnalyzer: React.FC<ScannerProps> = ({ agentMode, userProfile }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UniversalAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerHaptic = (style: 'light' | 'medium' | 'success' | 'error' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      if (style === 'success' || style === 'error') window.Telegram.WebApp.HapticFeedback.notificationOccurred(style);
      else window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const compressImage = (base64Str: string, maxWidth = 1024, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic('medium');
    setError(null);
    setResult(null);
    setSaved(false);
    setLoading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        let base64String = reader.result as string;
        setImagePreview(base64String);

        if (file.type.startsWith('image/')) {
            try { base64String = await compressImage(base64String); } catch (e) {}
        }
        
        const base64Data = base64String.split(',')[1];
        try {
          const analysis = await analyzeImage(base64Data, 'image/jpeg', agentMode, userProfile);
          setResult(analysis);
          triggerHaptic('success');
        } catch (err: any) {
          setError(err.message || "Не удалось проанализировать изображение.");
          triggerHaptic('error');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Ошибка чтения файла");
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (result && result.type === 'FOOD' && !saved) {
      triggerHaptic('success');
      saveHistoryItem(result as FoodAnalysisResult);
      setSaved(true);
    }
  };

  const getTheme = () => {
    switch (agentMode) {
      case AgentMode.LAWYER: return { color: 'blue', icon: Scale, title: 'Сканер Договоров', desc: 'Загрузите документ для анализа рисков.' };
      case AgentMode.FITNESS: return { color: 'red', icon: Dumbbell, title: 'Анализ Оборудования', desc: 'Сфоткай тренажер - узнай упражнения.' };
      case AgentMode.TRAVEL: return { color: 'violet', icon: Globe, title: 'Умный Гид', desc: 'Сфоткай достопримечательность - узнай историю.' };
      case AgentMode.STYLIST: return { color: 'pink', icon: Shirt, title: 'AI Стилист', desc: 'Загрузи лук - получи советы по стилю.' };
      default: return { color: 'emerald', icon: Camera, title: 'Сканер Калорий', desc: 'Загрузите фото еды для подсчета КБЖУ.' };
    }
  };

  const theme = getTheme();
  const ThemeIcon = theme.icon;

  const renderResult = () => {
    if (!result) return null;

    // --- TRAVEL RESULT ---
    if (result.type === 'LANDMARK') {
      const place = result as LandmarkAnalysisResult;
      return (
        <div className="mt-8 space-y-6">
           <div className="bg-white p-6 rounded-[2rem] border border-violet-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                 <h3 className="text-2xl font-heading font-bold text-gray-900">{place.landmarkName}</h3>
                 <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold flex items-center gap-1">
                   <MapPin className="w-3 h-3"/> {place.location}
                 </span>
              </div>
              <p className="text-gray-700 mb-6 italic border-l-4 border-violet-300 pl-4">{place.history}</p>
              
              <h4 className="font-bold text-violet-900 mb-3">Советы туристам:</h4>
              <ul className="space-y-2">
                {place.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 bg-violet-50 p-3 rounded-xl text-sm">
                    <span className="text-xl">💡</span> {tip}
                  </li>
                ))}
              </ul>
           </div>
        </div>
      );
    }

    // --- STYLIST RESULT ---
    if (result.type === 'FASHION') {
      const style = result as FashionAnalysisResult;
      return (
        <div className="mt-8 space-y-6">
           <div className="bg-white p-6 rounded-[2rem] border border-pink-100 shadow-sm">
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">{style.styleName}</h3>
              <p className="text-pink-600 font-bold text-sm mb-4 uppercase tracking-wide">{style.occasion}</p>
              
              <div className="mb-6">
                 <h4 className="text-xs text-gray-400 font-bold uppercase mb-2">Палитра цветов</h4>
                 <div className="flex gap-2">
                   {style.colorPalette.map((color, i) => (
                     <div key={i} className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full shadow-inner border border-gray-100" style={{ backgroundColor: color }}></div>
                        <span className="text-[10px] text-gray-400">{color}</span>
                     </div>
                   ))}
                 </div>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-white p-5 rounded-2xl border border-pink-100">
                <h4 className="font-bold text-pink-900 mb-2 flex items-center gap-2"><Palette className="w-4 h-4"/> Совет стилиста</h4>
                <p className="text-gray-700 text-sm">{style.advice}</p>
              </div>
           </div>
        </div>
      );
    }

    // --- LAWYER RESULT ---
    if (result.type === 'DOCUMENT') {
      const doc = result as DocumentAnalysisResult;
      return (
        <div className="mt-8 space-y-6">
           <div className={`p-6 rounded-[2rem] border ${doc.riskLevel === 'High' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex items-start justify-between mb-4">
                 <h3 className="text-2xl font-heading font-bold text-gray-900">{doc.title}</h3>
                 <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${
                    doc.riskLevel === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                 }`}>
                    {doc.riskLevel === 'High' ? <AlertTriangle className="w-4 h-4"/> : <ShieldCheck className="w-4 h-4"/>}
                    Риск: {doc.riskLevel === 'High' ? 'Выс' : 'Низ'}
                 </span>
              </div>
              <p className="text-gray-700 mb-4">{doc.summary}</p>
              {doc.risks.length > 0 && (
                <div className="bg-white p-4 rounded-xl border-l-4 border-red-400">
                  <h4 className="font-bold text-red-700 mb-2">Риски:</h4>
                  <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                    {doc.risks.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
           </div>
        </div>
      );
    }

    // --- FITNESS RESULT ---
    if (result.type === 'EQUIPMENT') {
      const equip = result as EquipmentAnalysisResult;
      return (
        <div className="mt-8 space-y-6">
           <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">{equip.equipmentName}</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {equip.targetMuscles.map((m, i) => <span key={i} className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm font-bold">{m}</span>)}
              </div>
              <div className="space-y-3">
                {equip.exercises.map((ex, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-xl">
                    <div className="font-bold text-gray-900">{ex.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{ex.tips}</div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      );
    }

    // --- CHEF RESULT ---
    const food = result as FoodAnalysisResult;
    const chartData = [
      { name: 'Белки', value: food.protein },
      { name: 'Углеводы', value: food.carbs },
      { name: 'Жиры', value: food.fat },
    ];

    return (
        <div className="mt-10 animate-fade-in-up space-y-6">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="bg-gray-50 rounded-[2rem] p-6">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <h3 className="text-2xl font-heading font-bold text-gray-900 mb-1">{food.foodName}</h3>
                       <div className="flex items-center gap-2">
                         <span className="text-xs font-bold text-gray-400 uppercase">AI Confidence</span>
                         <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-green-100 text-green-700">{food.confidence}</span>
                       </div>
                    </div>
                    {!saved ? (
                        <button onClick={handleSave} className="flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl">
                          <Plus className="w-4 h-4" /> Сохранить
                        </button>
                      ) : (
                        <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold px-4 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                          <CheckCircle className="w-4 h-4" /> Сохранено
                        </span>
                    )}
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
                       <span className="text-gray-500 font-medium">Энергия</span>
                       <span className="text-2xl font-heading font-bold text-gray-900">{food.calories} <span className="text-base text-gray-400 font-normal">ккал</span></span>
                    </div>
                 </div>
              </div>
              <div className="bg-white rounded-[2rem] p-6 border border-gray-100 h-full min-h-[300px] flex flex-col justify-center">
                <div className="flex-1 w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" cornerRadius={6}>
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />)}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
        </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className={`bg-white p-8 rounded-[2.5rem] shadow-xl shadow-${theme.color}-900/5`}>
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-${theme.color}-100 text-${theme.color}-600 rounded-2xl mb-4`}>
             <ThemeIcon className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">{theme.title}</h2>
          <p className="text-gray-500 max-w-md mx-auto">{theme.desc}</p>
        </div>

        <div onClick={() => { triggerHaptic('light'); fileInputRef.current?.click(); }} className={`relative group border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${imagePreview ? `border-${theme.color}-500/50 bg-${theme.color}-50/10` : `border-gray-200 hover:border-${theme.color}-400 hover:bg-gray-50`}`}>
          {imagePreview ? (
            <div className="relative w-full max-w-sm">
               <img src={imagePreview} alt="Preview" className="w-full rounded-2xl shadow-lg object-contain" />
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                 <p className="text-white font-medium flex items-center gap-2"><Upload className="w-4 h-4"/> Выбрать другое</p>
               </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className={`w-20 h-20 bg-${theme.color}-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <Upload className={`w-8 h-8 text-${theme.color}-500`} />
              </div>
              <span className="text-gray-900 font-bold text-lg block mb-1">Загрузить фото</span>
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>

        {loading && (
          <div className={`mt-8 bg-${theme.color}-50/50 rounded-2xl p-6 flex items-center justify-center gap-4`}>
            <Loader2 className={`w-6 h-6 text-${theme.color}-600 animate-spin`} />
            <p className={`text-${theme.color}-800 font-medium animate-pulse`}>AI Агент анализирует...</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
          </div>
        )}

        {renderResult()}
      </div>
    </div>
  );
};

export default PhotoAnalyzer;
