import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

// --- НАСТРОЙКИ ---

// Инициализация Gemini
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });
const MODEL_FAST = 'gemini-2.5-flash';
const MODEL_IMAGE = 'gemini-2.5-flash-image'; // Используем актуальную модель

// Инициализация Supabase (Admin доступ для списания баланса)
// Если ключи не заданы, Supabase просто не будет работать, но AI продолжит отвечать (бесплатно)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// Стоимость действий в токенах
const ACTION_COSTS = {
  'analyze': 5,        // Анализ
  'generate_image': 15, // Генерация картинок
  'chat': 1,            // Чат
  'recipes': 5,
  'plan': 10,
  'draft': 10,
  'workout_plan': 5,
  'trip_plan': 5,
  'capsule_wardrobe': 5
};

// Хелпер форматирования профиля
const formatProfile = (profile, agentMode) => {
  if (!profile) return "";
  let info = `\n[USER CONTEXT: Name=${profile.name}`;
  if (agentMode === 'CHEF') {
    info += `, Diet=${profile.chef.diet}, Allergies=${profile.chef.allergies}, CalorieGoal=${profile.chef.calorieGoal}`;
  } else if (agentMode === 'LAWYER') {
    info += `, Legal Status=${profile.lawyer.status}, Industry=${profile.lawyer.industry}`;
  } else if (agentMode === 'FITNESS') {
    info += `, Level=${profile.fitness.level}, Goal=${profile.fitness.goal}, Injuries=${profile.fitness.injuries}`;
  } else if (agentMode === 'TRAVEL') {
    info += `, Budget=${profile.travel.budget}, Interests=${profile.travel.interests}`;
  } else if (agentMode === 'STYLIST') {
    info += `, Gender=${profile.stylist.gender}, Style=${profile.stylist.style}`;
  } else if (agentMode === 'ARTIST') {
    info += `, PreferredStyle=${profile.artist.preferredStyle}`;
  }
  info += "]";
  return info;
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { return res.status(405).json({ error: 'Method Not Allowed' }); }
  if (!apiKey) { return res.status(500).json({ error: 'Server configuration error: API Key missing' }); }

  try {
    const { action, payload } = req.body;
    const { userProfile } = payload;
    
    // --- 1. ПРОВЕРКА БАЛАНСА ---
    // Получаем Telegram ID из профиля. Фронтенд должен его присылать.
    const telegramId = userProfile?.telegramId;
    const cost = ACTION_COSTS[action] || 1;
    let currentUserBalance = null;

    if (supabase && telegramId) {
      // 1.1 Ищем пользователя
      let { data: user, error } = await supabase
        .from('users')
        .select('balance')
        .eq('telegram_id', telegramId)
        .single();

      // 1.2 Создаем, если нет
      if (!user && !error) {
        const { data: newUser } = await supabase
          .from('users')
          .insert([{ 
             telegram_id: telegramId, 
             first_name: userProfile.name || 'User',
             balance: 50 // Приветственный бонус
          }])
          .select()
          .single();
        user = newUser;
      }

      // 1.3 Проверяем средства
      if (user) {
         currentUserBalance = user.balance;
         if (user.balance < cost) {
           return res.status(402).json({ 
             error: 'INSUFFICIENT_FUNDS', 
             message: `Недостаточно токенов. Стоимость: ${cost}, Баланс: ${user.balance}`,
             required: cost,
             balance: user.balance
           });
         }
      }
    }

    // --- 2. ВЫПОЛНЕНИЕ ЛОГИКИ AI ---
    let aiResponse = null;

    // 1. UNIVERSAL ANALYZE
    if (action === 'analyze') {
      const { image, mimeType, agentMode } = payload;
      let prompt = '';
      let schema = {};
      const context = formatProfile(userProfile, agentMode);

      if (agentMode === 'LAWYER') {
        prompt = `Analyze this document image as a Senior Legal Consultant specializing in Russian Law. ${context} 1. Identify document type. 2. Summarize intent. 3. Assess Risk Level (Low/Medium/High). 4. Key points. 5. Specific RISKS. 6. Recommendations. 7. Missing clauses. 8. Next steps. Return in Russian.`;
        schema = {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['DOCUMENT'] },
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            risks: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendation: { type: Type.STRING },
            missingClauses: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionableSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["type", "title", "summary", "riskLevel", "risks", "recommendation"]
        };
      } else if (agentMode === 'FITNESS') {
        prompt = `Analyze this gym equipment as a Pro Trainer. ${context} 1. Identify. 2. Target muscles. 3. 2-3 exercises. Return in Russian.`;
        schema = {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['EQUIPMENT'] },
            equipmentName: { type: Type.STRING },
            description: { type: Type.STRING },
            targetMuscles: { type: Type.ARRAY, items: { type: Type.STRING } },
            exercises: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, tips: { type: Type.STRING } } } }
          },
          required: ["type", "equipmentName", "targetMuscles", "exercises"]
        };
      } else if (agentMode === 'TRAVEL') {
        prompt = `Analyze this landmark/location as a Travel Guide. ${context} 1. Identify. 2. Location. 3. History fact. 4. 3 Tips. Return in Russian.`;
        schema = {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['LANDMARK'] },
            landmarkName: { type: Type.STRING },
            location: { type: Type.STRING },
            history: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["type", "landmarkName", "location", "tips"]
        };
      } else if (agentMode === 'STYLIST') {
        prompt = `Analyze this outfit as a Fashion Stylist. ${context} 1. Style name. 2. Occasion. 3. Color palette. 4. Advice. Return in Russian.`;
        schema = {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['FASHION'] },
            styleName: { type: Type.STRING },
            occasion: { type: Type.STRING },
            colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
            advice: { type: Type.STRING }
          },
          required: ["type", "styleName", "occasion", "colorPalette", "advice"]
        };
      } else if (agentMode === 'UNIVERSAL') {
        prompt = `Analyze this image. ${context} 1. Describe. 2. 5 tags. Return in Russian.`;
        schema = {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['GENERAL'] },
            description: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["type", "description", "tags"]
        };
      } else {
        // CHEF
        prompt = `Analyze food image. ${context} 1. Identify. 2. Calories/macros. 3. Desc. 4. Variations. Russian.`;
        schema = {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['FOOD'] },
            foodName: { type: Type.STRING },
            description: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
            confidence: { type: Type.STRING },
            suggestedRecipes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } }
          },
          required: ["type", "foodName", "calories", "protein", "carbs", "fat"]
        };
      }

      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: { parts: [{ inlineData: { data: image, mimeType } }, { text: prompt }] },
        config: { responseMimeType: "application/json", responseSchema: schema }
      });
      aiResponse = JSON.parse(response.text);
    }

    // 2. RECIPES
    if (action === 'recipes') {
      const { ingredients, excludedRecipes } = payload;
      const context = formatProfile(userProfile, 'CHEF');
      const prompt = `Suggested recipes (Russian) for ingredients: ${ingredients}. ${context} Exclude: ${excludedRecipes?.join(', ')}. JSON Array.`;
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, time: { type: Type.STRING }, calories: { type: Type.NUMBER }, difficulty: { type: Type.STRING }, ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }, instructions: { type: Type.ARRAY, items: { type: Type.STRING } } } } } }
      });
      aiResponse = JSON.parse(response.text);
    }

    // 3. MEAL PLAN
    if (action === 'plan') {
      const { goal, preferences } = payload;
      const context = formatProfile(userProfile, 'CHEF');
      const prompt = `7-day meal plan (Russian). Goal: ${goal}. Prefs: ${preferences}. ${context}`;
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { schedule: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.STRING }, meals: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: Type.STRING, name: Type.STRING, calories: Type.NUMBER } } } } } }, shoppingList: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
      });
      aiResponse = JSON.parse(response.text);
    }

    // 4. DRAFT DOCUMENT
    if (action === 'draft') {
      const { docType, details } = payload;
      const context = formatProfile(userProfile, 'LAWYER');
      const prompt = `Task: Draft a legal document (Russian). Type: ${docType}. Details: ${details}. ${context}. Format with placeholders.`;
      const response = await ai.models.generateContent({ model: MODEL_FAST, contents: prompt });
      aiResponse = { content: response.text };
    }

    // 5. WORKOUT PLAN
    if (action === 'workout_plan') {
      const { focus, equipment, duration } = payload;
      const context = formatProfile(userProfile, 'FITNESS');
      const prompt = `Workout session (Russian). Focus: ${focus}. Duration: ${duration}. Equip: ${equipment}. ${context}`;
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, duration: { type: Type.STRING }, difficulty: { type: Type.STRING }, exercises: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sets: { type: Type.NUMBER }, reps: { type: Type.STRING }, rest: { type: Type.STRING }, notes: { type: Type.STRING } } } } } } }
      });
      aiResponse = JSON.parse(response.text);
    }

    // 6. TRIP PLAN
    if (action === 'trip_plan') {
      const { destination, days, budget, style } = payload;
      const context = formatProfile(userProfile, 'TRAVEL');
      const prompt = `Trip plan (Russian) for ${destination}, ${days} days. Budget: ${budget}, Style: ${style}. ${context}`;
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { destination: { type: Type.STRING }, totalCostEstimate: { type: Type.STRING }, itinerary: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.NUMBER }, theme: { type: Type.STRING }, activities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, activity: { type: Type.STRING }, description: { type: Type.STRING } } } } } } } } } }
      });
      aiResponse = JSON.parse(response.text);
    }

    // 7. CAPSULE WARDROBE
    if (action === 'capsule_wardrobe') {
      const { season, occasion, style } = payload;
      const context = formatProfile(userProfile, 'STYLIST');
      const prompt = `Capsule Wardrobe (Russian). Season: ${season}, Occasion: ${occasion}, Style: ${style}. ${context}`;
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } }, items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, name: { type: Type.STRING }, color: { type: Type.STRING }, description: { type: Type.STRING } } } }, stylingTips: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
      });
      aiResponse = JSON.parse(response.text);
    }

    // 8. GENERATE IMAGE
    if (action === 'generate_image') {
       const { prompt, aspectRatio, style } = payload;
       const context = formatProfile(userProfile, 'ARTIST');
       const fullPrompt = `Create a high quality image. Description: ${prompt}. Style: ${style}. ${context}`;
       
       const response = await ai.models.generateContent({
          model: MODEL_IMAGE,
          contents: { parts: [{ text: fullPrompt }] },
          config: { imageConfig: { aspectRatio: aspectRatio, imageSize: "1024x1024" } } // Adjusted for new SDK
       });

       let imageBase64 = null;
       // Try to find image in response parts
       const parts = response.candidates?.[0]?.content?.parts;
       if (parts) {
         for (const part of parts) {
            if (part.inlineData) {
               imageBase64 = part.inlineData.data;
               break;
            }
         }
       }
       
       if (!imageBase64) throw new Error("No image generated.");
       aiResponse = { imageBase64 };
    }

    // 9. CHAT
    if (action === 'chat') {
      const { message, history, agentMode, attachment } = payload;
      const context = formatProfile(userProfile, agentMode);
      
      const formattedHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      let systemInstruction = `Role: ${agentMode}. Context: ${context}. Language: Russian.`;
      if (agentMode === 'LAWYER') systemInstruction += " Consult strictly on RF laws.";
      
      const chat = ai.chats.create({
        model: MODEL_FAST,
        history: formattedHistory,
        config: { systemInstruction }
      });

      let messageContent = { message: message };
      if (attachment && attachment.data) {
        messageContent = {
           parts: [
              { inlineData: { mimeType: attachment.mimeType, data: attachment.data } },
              { text: message || "Analyze this." }
           ]
        };
      }

      const result = await chat.sendMessage(messageContent);
      aiResponse = { text: result.text };
    }

    if (!aiResponse) {
       return res.status(400).json({ error: 'Unknown action' });
    }

    // --- 3. СПИСАНИЕ СРЕДСТВ (ТОЛЬКО ЕСЛИ УСПЕШНО) ---
    if (supabase && telegramId) {
      const { error: rpcError } = await supabase.rpc('deduct_balance', { 
        tg_id: telegramId, 
        amount: cost 
      });
      
      if (rpcError) {
         console.error("Balance deduction error:", rpcError);
         // Ошибку списания пользователю не показываем, но логируем. Услуга оказана.
      } else {
         // Получаем обновленный баланс для UI
         const { data: updatedUser } = await supabase.from('users').select('balance').eq('telegram_id', telegramId).single();
         if (updatedUser) {
            aiResponse.userBalance = updatedUser.balance;
         }
      }
    }

    return res.status(200).json(aiResponse);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}