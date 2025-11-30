

import React, { useState } from 'react';
import { Palette, Download, Loader2, Sparkles, Image as ImageIcon, Wand2 } from 'lucide-react';
import { generateImage } from '../services/geminiService';
import { UserProfile } from '../types';

interface ImageGeneratorProps {
  userProfile?: UserProfile;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ userProfile }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('Cinematic');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const triggerHaptic = (style: 'light' | 'medium' | 'success' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      if (style === 'success') window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      else window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setGeneratedImage(null);
    triggerHaptic('medium');

    try {
      const result = await generateImage(prompt, aspectRatio, style, userProfile);
      setGeneratedImage(`data:image/jpeg;base64,${result.imageBase64}`);
      triggerHaptic('success');
    } catch (error) {
      alert('Ошибка при генерации изображения. Попробуйте другой запрос.');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-art-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerHaptic('success');
  };

  const ratios = [
      { id: '1:1', label: 'Квадрат' },
      { id: '3:4', label: 'Портрет' },
      { id: '16:9', label: 'Пейзаж' }
  ];

  const styles = ['Cinematic', 'Anime', 'Photorealistic', 'Cyberpunk', 'Oil Painting', '3D Render', 'Sketch', 'No Style'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-fuchsia-900/5 border border-fuchsia-50">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-14 h-14 bg-fuchsia-100 text-fuchsia-600 rounded-2xl flex items-center justify-center">
             <Palette className="w-7 h-7" />
           </div>
           <div>
             <h2 className="text-3xl font-heading font-bold text-gray-900">
               AI Художник
             </h2>
             <p className="text-gray-500">Создавайте уникальные изображения по описанию.</p>
           </div>
        </div>

        <div className="space-y-6">
           <div>
             <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Что нарисовать?</label>
             <div className="flex items-start gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-fuchsia-500/20 transition-all">
                <Wand2 className="w-5 h-5 text-fuchsia-400 mt-1"/>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Футуристический город в облаках, неоновая подсветка, стиль киберпанк..."
                  className="bg-transparent outline-none w-full font-medium text-gray-800 resize-none h-24"
                />
             </div>
           </div>
           
           <div className="grid md:grid-cols-2 gap-6">
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Формат</label>
               <div className="flex gap-2">
                 {ratios.map(r => (
                   <button
                     key={r.id}
                     onClick={() => setAspectRatio(r.id)}
                     className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${
                       aspectRatio === r.id 
                       ? 'bg-fuchsia-600 text-white border-fuchsia-600 shadow-lg shadow-fuchsia-200' 
                       : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                     }`}
                   >
                     {r.label}
                   </button>
                 ))}
               </div>
             </div>
             
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Стиль</label>
               <select 
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-fuchsia-500/20 outline-none font-bold text-gray-800 transition-all appearance-none"
               >
                 {styles.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
           </div>

           <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full bg-fuchsia-600 text-white p-4 rounded-2xl hover:bg-fuchsia-700 transition-colors font-bold flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-500/30 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'Художник рисует...' : 'Сгенерировать'}
          </button>
        </div>
      </div>

      {generatedImage && (
        <div className="space-y-6 animate-slide-up">
           <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-fuchsia-50 overflow-hidden relative group">
              <img src={generatedImage} alt="Generated Art" className="w-full rounded-[2rem] shadow-inner" />
              
              <div className="absolute bottom-10 right-10">
                 <button 
                   onClick={downloadImage}
                   className="w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center text-fuchsia-600 hover:scale-110 active:scale-90 transition-transform"
                 >
                   <Download className="w-7 h-7" />
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;