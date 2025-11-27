
import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle, AlertCircle, Plus, Info, ChefHat, Flame, ArrowRight } from 'lucide-react';
import { analyzeFoodImage } from '../services/geminiService';
import { saveHistoryItem } from '../services/historyService';
import { FoodAnalysisResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B']; // Protein (Green), Carbs (Blue), Fat (Orange)

const PhotoAnalyzer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger Telegram Haptic Feedback
  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      if (style === 'success' || style === 'error') {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(style);
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
      }
    }
  };

  // Compress Image Logic
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
        
        // Show preview immediately
        setImagePreview(base64String);

        // Compress if it's an image
        if (file.type.startsWith('image/')) {
            try {
               base64String = await compressImage(base64String);
            } catch (cErr) {
               console.warn("Compression failed, using original", cErr);
            }
        }
        
        const base64Data = base64String.split(',')[1];
        // Use jpeg mime type if compressed, otherwise original
        const mimeType = 'image/jpeg'; 

        try {
          const analysis = await analyzeFoodImage(base64Data, mimeType);
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
    triggerHaptic('success');
    if (result && !saved) {
      saveHistoryItem(result);
      setSaved(true);
    }
  };

  const chartData = result ? [
    { name: 'Белки', value: result.protein },
    { name: 'Углеводы', value: result.carbs },
    { name: 'Жиры', value: result.fat },
  ] : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-emerald-900/5">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mb-4">
             <Camera className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">
            Сканер Калорий
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Загрузите фото вашего блюда, и умный алгоритм мгновенно определит калорийность и БЖУ.
          </p>
        </div>

        <div 
          onClick={() => {
            triggerHaptic('light');
            fileInputRef.current?.click();
          }}
          className={`
            relative group border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
            ${imagePreview ? 'border-emerald-500/50 bg-emerald-50/10' : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'}
          `}
        >
          {imagePreview ? (
            <div className="relative w-full max-w-sm">
               <img src={imagePreview} alt="Preview" className="w-full rounded-2xl shadow-lg object-contain" />
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                 <p className="text-white font-medium flex items-center gap-2"><Upload className="w-4 h-4"/> Выбрать другое</p>
               </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-8 h-8 text-emerald-500" />
              </div>
              <span className="text-gray-900 font-bold text-lg block mb-1">Загрузить фото</span>
              <p className="text-sm text-gray-400">JPG, PNG до 10MB</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {loading && (
          <div className="mt-8 bg-emerald-50/50 rounded-2xl p-6 flex items-center justify-center gap-4">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            <p className="text-emerald-800 font-medium animate-pulse">ИИ анализирует и переводит на русский...</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {result && !loading && (
          <div className="mt-10 animate-fade-in-up space-y-6">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Info Card */}
              <div className="bg-gray-50 rounded-[2rem] p-6 md:p-8">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <h3 className="text-2xl font-heading font-bold text-gray-900 mb-1">{result.foodName}</h3>
                       <div className="flex items-center gap-2">
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Уверенность AI</span>
                         <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                           result.confidence === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                         }`}>
                           {result.confidence}
                         </span>
                       </div>
                    </div>
                    {!saved ? (
                      <button 
                        onClick={handleSave}
                        className="flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
                      >
                        <Plus className="w-4 h-4" /> Сохранить
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold px-4 py-2 bg-emerald-50 rounded-xl">
                        <CheckCircle className="w-4 h-4" /> Сохранено
                      </span>
                    )}
                 </div>
                 
                 <p className="text-gray-600 mb-6 leading-relaxed bg-white p-4 rounded-xl border border-gray-100 text-sm">
                   {result.description}
                 </p>
                 
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
                       <span className="text-gray-500 font-medium">Энергия</span>
                       <span className="text-2xl font-heading font-bold text-gray-900">{result.calories} <span className="text-base text-gray-400 font-normal">ккал</span></span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <MacroCard label="Белки" value={result.protein} color="text-emerald-600" bg="bg-emerald-50" />
                      <MacroCard label="Углеводы" value={result.carbs} color="text-blue-600" bg="bg-blue-50" />
                      <MacroCard label="Жиры" value={result.fat} color="text-orange-600" bg="bg-orange-50" />
                    </div>
                 </div>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-[2rem] p-6 border border-gray-100 h-full min-h-[300px] flex flex-col justify-center relative overflow-hidden">
                <h4 className="text-center text-gray-500 font-medium mb-4">Баланс БЖУ</h4>
                <div className="flex-1 w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="value"
                        cornerRadius={6}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip 
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                         itemStyle={{ color: '#374151', fontWeight: 600 }}
                      />
                      <Legend verticalAlign="bottom" iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Suggested Recipes Section */}
            {result.suggestedRecipes && result.suggestedRecipes.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ChefHat className="w-6 h-6 text-orange-500" />
                  Варианты приготовления
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {result.suggestedRecipes.map((recipe, idx) => (
                    <div key={idx} className="bg-orange-50/50 p-5 rounded-3xl border border-orange-100 hover:bg-orange-50 transition-colors">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                         <Flame className="w-4 h-4 text-orange-500" />
                         {recipe.name}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        {recipe.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

const MacroCard: React.FC<any> = ({ label, value, color, bg }) => (
  <div className={`p-3 rounded-2xl ${bg} text-center`}>
    <div className={`text-xl font-bold ${color} mb-1`}>{value}г</div>
    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</div>
  </div>
);

export default PhotoAnalyzer;
