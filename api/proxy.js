
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini on the server side
const apiKey = process.env.VITE_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });
const MODEL_FAST = 'gemini-2.5-flash';

// Helper to format profile into a string for the prompt
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
  }
  info += "]";
  return info;
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API Key missing' });
  }

  try {
    const { action, payload } = req.body;
    const { userProfile } = payload; // Extract user profile

    // 1. UNIVERSAL ANALYZE
    if (action === 'analyze') {
      const { image, mimeType, agentMode } = payload;
      let prompt = '';
      let schema = {};
      const context = formatProfile(userProfile, agentMode);

      if (agentMode === 'LAWYER') {
        prompt = `
          Analyze this document image as a Senior Legal Consultant specializing in Russian Law (GK RF, ZOZPP, TK RF).
          ${context}
          1. Identify the specific type of document (e.g., Lease Agreement, Employment Contract).
          2. Summarize the core intent of the document.
          3. Assess Risk Level (Low/Medium/High) based on hidden clauses or unfavorable terms.
          4. List key points.
          5. Identify specific RISKS (e.g., "Clause 5.1 allows unilateral termination").
          6. Provide professional recommendations.
          7. Identify MISSING clauses that should standardly be there for protection.
          8. Provide actionable next steps.
          Return in Russian.
        `;
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
          required: ["type", "title", "summary", "riskLevel", "keyPoints", "risks", "recommendation"]
        };
      } else if (agentMode === 'FITNESS') {
        prompt = `
          Analyze this gym equipment as a Pro Trainer.
          ${context}
          1. Identify equipment.
          2. Target muscles.
          3. Suggest 2-3 exercises.
          Return in Russian.
        `;
        schema = {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['EQUIPMENT'] },
            equipmentName: { type: Type.STRING },
            description: { type: Type.STRING },
            targetMuscles: { type: Type.ARRAY, items: { type: Type.STRING } },
            exercises: {
              type: Type.ARRAY,
              items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, tips: { type: Type.STRING } } }
            }
          },
          required: ["type", "equipmentName", "description", "targetMuscles", "exercises"]
        };
      } else if (agentMode === 'TRAVEL') {
        prompt = `
          Analyze this landmark or location as a Travel Guide.
          ${context}
          1. Identify the place/landmark.
          2. Provide location (City, Country).
          3. Tell a brief interesting history fact.
          4. Give 3 practical tips for visiting.
          Return in Russian.
        `;
        schema = {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['LANDMARK'] },
            landmarkName: { type: Type.STRING },
            location: { type: Type.STRING },
            history: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["type", "landmarkName", "location", "history", "tips"]
        };
      } else if (agentMode === 'STYLIST') {
        prompt = `
          Analyze this outfit or clothing item as a Fashion Stylist.
          ${context}
          1. Name the style (e.g., Casual, Boho).
          2. Best occasion to wear it.
          3. Extract main color palette (hex codes or names).
          4. Give advice on what to pair it with.
          Return in Russian.
        `;
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
      } else {
        // DEFAULT: CHEF
        prompt = `
          Analyze this food image. 
          ${context}
          1. Identify dish.
          2. Estimate calories/macros.
          3. Description.
          4. Suggest 2 variations.
          Output in Russian.
        `;
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
            suggestedRecipes: {
              type: Type.ARRAY,
              items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } }
            }
          },
          required: ["type", "foodName", "calories", "protein", "carbs", "fat", "description", "suggestedRecipes"]
        };
      }

      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: { parts: [{ inlineData: { data: image, mimeType } }, { text: prompt }] },
        config: { responseMimeType: "application/json", responseSchema: schema }
      });

      return res.status(200).json(JSON.parse(response.text));
    }

    // 2. RECIPES
    if (action === 'recipes') {
      const { ingredients, excludedRecipes } = payload;
      const context = formatProfile(userProfile, 'CHEF');
      const prompt = `Suggested recipes (Russian) for ingredients: ${ingredients}. ${context} Exclude: ${excludedRecipes?.join(', ')}. Allow 1-2 missing items.`;
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                time: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                difficulty: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "time", "ingredients", "instructions", "calories", "difficulty"]
            }
          }
        }
      });
      return res.status(200).json(JSON.parse(response.text));
    }

    // 3. MEAL PLAN
    if (action === 'plan') {
      const { goal, preferences } = payload;
      const context = formatProfile(userProfile, 'CHEF');
      const prompt = `7-day meal plan (Russian). Goal: ${goal}. Prefs: ${preferences}. ${context}`;
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              schedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING },
                    meals: {
                      type: Type.ARRAY,
                      items: { type: Type.OBJECT, properties: { type: Type.STRING, name: Type.STRING, calories: Type.NUMBER } }
                    }
                  }
                }
              },
              shoppingList: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
      return res.status(200).json(JSON.parse(response.text));
    }

    // 4. DRAFT DOCUMENT
    if (action === 'draft') {
      const { docType, details } = payload;
      const context = formatProfile(userProfile, 'LAWYER');
      const prompt = `
        You are an expert Russian Lawyer.
        Task: Draft a legal document.
        Type: ${docType}
        Context/Details: ${details}
        User Profile: ${context}
        
        Requirements:
        1. Write in formal legal Russian.
        2. Reference current Russian laws (GK RF, etc) where applicable.
        3. Use placeholders like [ФИО], [ДАТА], [СУММА] where the user needs to fill data.
        4. Structure clearly with header and signature block.
      `;
      
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
      });

      return res.status(200).json({ content: response.text });
    }

    // 5. WORKOUT PLAN
    if (action === 'workout_plan') {
      const { focus, equipment, duration } = payload;
      const context = formatProfile(userProfile, 'FITNESS');
      const prompt = `
        Create a single workout session (Russian).
        Focus: ${focus}.
        Duration: ${duration}.
        Equipment Available: ${equipment}.
        User Context: ${context}
        
        Return a list of exercises with sets, reps, and brief form tips.
      `;
      
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              duration: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    sets: { type: Type.NUMBER },
                    reps: { type: Type.STRING },
                    rest: { type: Type.STRING },
                    notes: { type: Type.STRING }
                  },
                  required: ["name", "sets", "reps", "notes"]
                }
              }
            },
            required: ["title", "duration", "difficulty", "exercises"]
          }
        }
      });
      return res.status(200).json(JSON.parse(response.text));
    }

    // 6. TRIP PLAN (New)
    if (action === 'trip_plan') {
      const { destination, days, budget, style } = payload;
      const context = formatProfile(userProfile, 'TRAVEL');
      const prompt = `
        Create a ${days}-day travel itinerary for ${destination} (Russian).
        Budget: ${budget}. Style: ${style}.
        Context: ${context}.
        
        Format: Day by day breakdown (Morning, Afternoon, Evening).
        Include a total cost estimate.
      `;
      
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              destination: { type: Type.STRING },
              totalCostEstimate: { type: Type.STRING },
              itinerary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.NUMBER },
                    theme: { type: Type.STRING },
                    activities: {
                      type: Type.ARRAY,
                      items: {
                         type: Type.OBJECT,
                         properties: {
                           time: { type: Type.STRING },
                           activity: { type: Type.STRING },
                           description: { type: Type.STRING }
                         }
                      }
                    }
                  }
                }
              }
            },
            required: ["destination", "totalCostEstimate", "itinerary"]
          }
        }
      });
      return res.status(200).json(JSON.parse(response.text));
    }

    // 7. CAPSULE WARDROBE (New)
    if (action === 'capsule_wardrobe') {
      const { season, occasion, style } = payload;
      const context = formatProfile(userProfile, 'STYLIST');
      const prompt = `
        Create a Capsule Wardrobe (Russian) for:
        Season: ${season}. Occasion: ${occasion}. Style: ${style}.
        User Profile: ${context}.
        
        Output:
        1. Title for the collection.
        2. Color Palette (5 hex codes).
        3. Items list (Tops, Bottoms, Shoes, Outerwear, Accessories).
        4. 3 Styling tips on how to mix them.
      `;

      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    name: { type: Type.STRING },
                    color: { type: Type.STRING },
                    description: { type: Type.STRING }
                  }
                }
              },
              stylingTips: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "colorPalette", "items", "stylingTips"]
          }
        }
      });
      return res.status(200).json(JSON.parse(response.text));
    }

    // 8. CHAT
    if (action === 'chat') {
      const { message, history, agentMode } = payload;
      const context = formatProfile(userProfile, agentMode);
      
      const formattedHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      let systemInstruction = "";
      if (agentMode === 'LAWYER') systemInstruction = `Ты профессиональный Юрист РФ. Консультируй строго и профессионально. Ссылайся на законы РФ. ${context}`;
      else if (agentMode === 'FITNESS') systemInstruction = `Ты Фитнес-тренер. Мотивируй, будь энергичным, используй эмодзи. ${context}`;
      else if (agentMode === 'TRAVEL') systemInstruction = `Ты Тревел-гид. Рассказывай интересно о местах, истории и давай советы туристам. Используй 🌍✈️. ${context}`;
      else if (agentMode === 'STYLIST') systemInstruction = `Ты Фешн-стилист. Советуй тренды, сочетания цветов и образы. Будь модным и тактичным. 👗✨ ${context}`;
      else systemInstruction = `Ты Шеф-повар и Диетолог. Помогай с рецептами и меню. ${context}`;

      const chat = ai.chats.create({
        model: MODEL_FAST,
        history: formattedHistory,
        config: { systemInstruction }
      });

      const result = await chat.sendMessage({ message: message });
      return res.status(200).json({ text: result.text });
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
