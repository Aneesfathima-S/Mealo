const express = require('express');
const router = express.Router();
const {
  generateMealPlan,
  testGemini,
  getGroceryListPdf
} = require('../controllers/mealController');
const verifyToken = require('../middleware/verifyToken');

router.post('/generate', verifyToken, generateMealPlan);
router.get('/test', testGemini);

// ⛔️ No verifyToken middleware here anymore
router.get('/grocery-pdf', getGroceryListPdf);

module.exports = router;
