function generateGroceryList(mealPlan) {
  const ingredientMap = {};

  mealPlan.days.forEach(day => {
    const meals = [day.breakfast, day.lunch, day.dinner, ...(day.snacks || [])];
    meals.forEach(meal => {
      if (meal?.ingredients && Array.isArray(meal.ingredients)) {
        meal.ingredients.forEach(ingredient => {
          const key = ingredient.toLowerCase();
          ingredientMap[key] = (ingredientMap[key] || 0) + 1;
        });
      }
    });
  });

  return Object.entries(ingredientMap).map(([ingredient, count]) => ({
    ingredient,
    total: count,
    unit: ''
  }));
}

module.exports = generateGroceryList;
