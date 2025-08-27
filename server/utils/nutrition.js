const axios = require('axios');
const Food = require('../models/Food');

const getNutritionFromNinja = async (query) => {
  const apiKey = process.env.NINJA_API_KEY;
  try {
    const response = await axios.get('https://api.api-ninjas.com/v1/nutrition', {
      headers: { 'X-Api-Key': apiKey },
      params: { query }
    });
    return response.data;
  } catch (err) {
    console.error('⚠️ Ninja API error:', err.message);
    return [];
  }
};

const cleanDescription = (description) => {
  return description
    .replace(/\d+[^a-zA-Z]+/g, '')    
    .replace(/(with|and).*/i, '')     
    .replace(/[^a-zA-Z\s]/g, '')      
    .trim()
    .toLowerCase();
};

const calculateDayNutrition = async (meals) => {
  const macros = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0
  };

  for (const meal of meals) {
    try {
      const cleanQuery = cleanDescription(meal.description || meal.name || '');

      let item = null;

 
      const nutrition = await getNutritionFromNinja(cleanQuery);
      if (nutrition.length > 0) {
        item = nutrition[0];
      }

      if (!item) {
        const localFood = await Food.findOne({ name: cleanQuery });
        if (localFood) {
          item = {
            calories: localFood.calories,
            protein_g: localFood.protein,
            fat_total_g: localFood.fat,
            carbohydrates_total_g: localFood.carbs,
            fiber_g: localFood.fiber
          };
        }
      }

      if (!item) {
        console.warn(`❌ No data found for "${cleanQuery}"`);
        continue;
      }


      const quantity = parseFloat(meal.details) || 100; 
      const factor = quantity / 100;

      macros.fat += (item.fat_total_g || 0) * factor;
      macros.protein += (item.protein_g || 0) * factor;
      macros.carbs += (item.carbohydrates_total_g || 0) * factor;
      macros.fiber += (item.fiber_g || 0) * factor;

    } catch (err) {
      console.error(`❌ Error for "${meal.name || meal.description}":`, err.message);
    }
  }


  macros.calories = (macros.fat * 9) + (macros.protein * 4) + (macros.carbs * 4);

  for (const key in macros) {
    macros[key] = Math.round(macros[key] * 10) / 10;
  }

  return macros;
};

module.exports = {
  getNutritionFromNinja,
  calculateDayNutrition
};
