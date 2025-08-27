const { GoogleGenerativeAI } = require('@google/generative-ai');
const Profile = require('../models/Profile');
const generateGroceryList = require('../utils/generateGroceryList');
const PDFDocument = require('pdfkit');
const { getNutritionFromNinja, calculateDayNutrition } = require('../utils/nutrition');
const Food = require('../models/Food');
const jwt = require('jsonwebtoken');


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function fetchGeminiContentWithRetry(prompt, retries = 3, delay = 3000) {
  const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return await result.response.text();
    } catch (err) {
      if (err.message.includes('503') || err.message.includes('overloaded')) {
        console.warn(`⚠️ Gemini overloaded. Retrying (${i + 1}/${retries})...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error('Gemini API is overloaded after multiple attempts.');
}

exports.generateMealPlan = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const prompt = `
Generate a 7-day ${profile.diet} Indian meal plan for a ${profile.age}-year-old ${profile.gender} from ${profile.region}. 
They weigh ${profile.weight}kg, are ${profile.height}cm tall, activity level is ${profile.activityLevel}, goal is ${profile.goal}, allergies: ${profile.allergies || 'None'}.
Fruits and nuts allowed. Snacks allowed: ${profile.snacksAllowed}.

Return JSON with a "days" array. Each day must have:
{
  "breakfast": { "name": "...", "ingredients": [...], "detail": "...", "amount": "150g" },
  "lunch": { "name": "...", "ingredients": [...], "detail": "...", "amount": "250g" },
  "dinner": { "name": "...", "ingredients": [...], "detail": "...", "amount": "200g" },
  "snacks": [{ "name": "...", "ingredients": [...], "detail": "...", "amount": "100g" }]
}
Only return valid JSON.`;

    const rawText = await fetchGeminiContentWithRetry(prompt);
    console.log('📦 Gemini response:', rawText);

    let parsedPlan;
    try {
      parsedPlan = JSON.parse(rawText);
    } catch {
      const start = rawText.indexOf('{');
      const end = rawText.lastIndexOf('}');
      try {
        parsedPlan = JSON.parse(rawText.slice(start, end + 1));
      } catch {
        return res.status(500).json({ message: 'Invalid Gemini response format' });
      }
    }

    if (Array.isArray(parsedPlan.days)) {
      for (const day of parsedPlan.days) {
        const meals = [day.breakfast, day.lunch, day.dinner, ...(day.snacks || [])];
        const macros = await calculateDayNutrition(meals);
        day.macros = macros;
        day.caloriesBurned = 232;
        day.caloriesTotal = macros.calories;
        day.caloriesLeft = Math.max((profile.calorieTarget || 1500) - macros.calories, 0);
      }
    }

    res.status(200).json({
      person: {
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        goal: profile.goal,
        diet: profile.diet,
        region: profile.region,
        activityLevel: profile.activityLevel,
      },
      mealPlan: parsedPlan
    });

  } catch (err) {
    console.error('❌ Gemini API error:', err.message || err);
    res.status(500).json({ message: 'Failed to generate meal plan' });
  }
};

exports.testGemini = async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });
    const result = await model.generateContent("Say a healthy eating quote.");
    const text = await result.response.text();
    res.status(200).json({ message: text });
  } catch (err) {
    res.status(500).json({ message: 'Gemini test failed' });
  }
};
exports.getGroceryListPdf = async (req, res) => {
  try {
    console.log('📦 Generating grocery list PDF (no token)');

    const profile = await Profile.findOne({});
    if (!profile || !profile.mealPlan || !Array.isArray(profile.mealPlan.days)) {
      return res.status(404).json({ message: 'Valid meal plan not found' });
    }

    const groceryList = generateGroceryList(profile.mealPlan);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="grocery-list.pdf"');
    doc.pipe(res);

    doc.fontSize(20).text('🛒 Grocery List', { underline: true, align: 'center' });
    doc.moveDown();

    if (groceryList.length === 0) {
      doc.fontSize(12).text('No grocery items found.');
    } else {
      groceryList.forEach((item, index) => {
        doc.fontSize(12).text(`${index + 1}. ${item.ingredient}${item.total ? ` (${item.total} ${item.unit || ''})` : ''}`);
      });
    }

    doc.end();
  } catch (err) {
    console.error('❌ PDF Error:', err);
    res.status(500).json({ message: 'Failed to generate grocery list' });
  }
};

exports.getNutritionSummary = async (req, res) => {
  const { meals } = req.body;

  try {
    let total = { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };

    for (const meal of meals) {
      const food = await Food.findOne({ name: meal.name.toLowerCase() });
      if (food) {
        const factor = meal.quantity / 100;
        total.calories += food.calories * factor;
        total.protein += food.protein * factor;
        total.fat += food.fat * factor;
        total.carbs += food.carbs * factor;
        total.fiber += food.fiber * factor;
      }
    }

    res.json({ total });
  } catch (err) {
    res.status(500).json({ error: 'Nutrition calculation failed' });
  }
};
