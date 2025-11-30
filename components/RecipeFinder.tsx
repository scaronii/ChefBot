
import React, { useState } from 'react';
import { ChefHat, Search, Clock, Flame, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { suggestRecipes } from '../services/geminiService';
import { Recipe, UserProfile } from '../types';

interface RecipeFinderProps {
  userProfile?: UserProfile;
}

const RecipeFinder: React.FC<RecipeFinderProps> = ({ userProfile }) => {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper for Haptics
  const triggerHaptic = (style: 'light' | 'medium' | 'success' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      if (style === 'success') window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      else window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const handleSearch = async () => {
    if (!ingredients.trim()) return;
    triggerHaptic('medium');
    setLoading(true);
    setRecipes([]);
    try {
      const results = await suggestRecipes(ingredients, [], userProfile);
      setRecipes(results);
      triggerHaptic('success');
    } catch (error) {
      console.error(error);
      alert("Не удалось получить рецепты. Проверьте API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-emerald-900/5 border border-emerald-50">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
           <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0">
             <ChefHat className="w-8 h-8" />
           </div>
           <div>
             <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">
               Умный Шеф-Повар
             </h2>
             <p className="text-gray-500">
               Не знаете, что приготовить? Просто напишите, какие продукты у вас есть, и ИИ предложит лучшие варианты.
             </p>
           </div>
        </div>

        <div className="bg-gray-50 p-2 rounded-[1.5rem] flex flex-col md:flex-row gap-2 border border-gray-100 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Например: куриное филе, полбанки сметаны, рис, лук..."
            className="flex-1 bg-transparent p-4 outline-none resize-none h-24 md:h-auto text-gray-800 placeholder-gray-400 font-medium"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !ingredients.trim()}
            className="bg-gray-900 text-white px-8 py-4 rounded-2xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 md:w-auto font-bold shadow-lg shadow-gray-200"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'Думаю...' : 'Придумать'}
          </button>
        </div>
      </div>

      {recipes.length > 0 && (
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {recipes.map((recipe, idx) => (
            <RecipeCard key={idx} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};

const RecipeCard: React.FC<{recipe: Recipe}> = ({ recipe }) => {
  const triggerHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 border border-gray-100 flex flex-col group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-heading font-bold text-xl text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors">
          {recipe.name}
        </h3>
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
          recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
          recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {recipe.difficulty === 'Easy' ? 'Легко' : recipe.difficulty === 'Medium' ? 'Средне' : 'Сложно'}
        </span>
      </div>
      
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
          <Clock className="w-3.5 h-3.5" /> {recipe.time}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg">
          <Flame className="w-3.5 h-3.5" /> {recipe.calories} ккал
        </div>
      </div>

      <div className="space-y-4 mb-6 flex-1">
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ингредиенты</h4>
          <div className="flex flex-wrap gap-2">
             {recipe.ingredients.slice(0, 4).map((ing, i) => (
               <span key={i} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100">
                 {ing}
               </span>
             ))}
             {recipe.ingredients.length > 4 && (
               <span className="text-xs bg-gray-50 text-gray-400 px-2 py-1 rounded-md border border-gray-100">
                 +{recipe.ingredients.length - 4}
               </span>
             )}
          </div>
        </div>
      </div>

      <button 
        className="w-full mt-auto py-3 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-600 hover:text-white transition-all text-sm font-bold flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-emerald-500/20"
        onClick={() => {
          triggerHaptic();
          alert(`Рецепт: ${recipe.name}\n\n${recipe.instructions.join('\n')}`);
        }}
      >
        Читать рецепт <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
};

export default RecipeFinder;
