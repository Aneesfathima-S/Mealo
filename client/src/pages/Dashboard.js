
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert, Button, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import MealPlanCard from '../components/MealPlanCard';
import Header from '../components/Header';
import NutritionSummary from '../components/NutritionSummary';


const Dashboard = () => {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('day0');

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post('/api/meal/generate', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('📦 Meal Plan response:', res.data);
        setMealPlan(res.data); // ✅ Fix here

      } catch (err) {
        console.error('❌ Error fetching meal plan:', err);
        setError(err.response?.data?.message || 'Failed to fetch meal plan');
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlan();
  }, []);

  const exportCSV = () => {
    if (!mealPlan || !mealPlan.mealPlan?.days) return;

    const rows = [['Day', 'Meal', 'Description', 'Details']];

    mealPlan.mealPlan.days.forEach((day, index) => {
      rows.push([`Day ${index + 1}`, 'Breakfast', day.breakfast.detail, day.breakfast.amount]);
      rows.push([`Day ${index + 1}`, 'Lunch', day.lunch.detail, day.lunch.amount]);
      rows.push([`Day ${index + 1}`, 'Dinner', day.dinner.detail, day.dinner.amount]);
      (day.snacks || []).forEach((snack, i) => {
        rows.push([`Day ${index + 1}`, `Snack ${i + 1}`, snack.detail, snack.amount]);
      });
    });

    const csvContent = rows.map(r => r.map(col => `"${col}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'meal_plan.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const person = mealPlan?.person || {};
  const days = mealPlan?.mealPlan?.days || [];

  return (
    <Container style={{ marginTop: '40px' }}>
      <Header title="Your AI-Powered Meal Plan" />
<Button
  variant="secondary"
  onClick={() => {
    window.open(`/api/meal/grocery-pdf`, '_blank');
  }}
  className="mb-3 ms-2"
>
  Print Grocery List
</Button>





      <Button variant="primary" onClick={exportCSV} className="mb-3 ms-2">
        Export CSV
      </Button>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {days.length > 0 && (
        <>
          <h3 className="mb-3">Daily Meal Plan</h3>

          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
            {days.map((day, index) => (
              <Tab eventKey={`day${index}`} title={`Day ${index + 1}`} key={index}>
<NutritionSummary
  nutrition={{
  caloriesBurned: parseFloat(day.caloriesBurned) || 0,
  caloriesTotal: parseFloat(day.caloriesTotal) || 0,
  caloriesLeft: parseFloat(day.caloriesLeft) || 0,
  fat: parseFloat(day.macros?.fat) || 0,
  protein: parseFloat(day.macros?.protein) || 15,
  carbs: parseFloat(day.macros?.carbs) || 0,
  fiber: parseFloat(day.macros?.fiber) || 0,
}}
/>

                <Row>
                  <Col md={6}>
                    
                    <MealPlanCard
  title="Breakfast"
  content={
    <>
      <strong style={{ color: '#0d6efd' }}>{day.breakfast?.name || 'No Name'}</strong><br />
      <strong>Ingredients:</strong> {day.breakfast?.ingredients?.join(', ') || 'N/A'}<br />
      <strong>Description:</strong> {day.breakfast?.detail || 'No description'}<br />
      <strong>Amount:</strong> {day.breakfast?.amount || 'No details'}
    </>
  }
/>

                  </Col>
                  <Col md={6}>
                    <MealPlanCard
                      title="Lunch"
                      content={<><strong style={{ color: '#0d6efd' }}>{day.lunch?.name || 'No Name'}</strong><br />
      <strong>Ingredients:</strong> {day.lunch?.ingredients?.join(', ') || 'N/A'}<br />
      <strong>Description:</strong> {day.lunch?.detail || 'No description'}<br />
      <strong>Amount:</strong> {day.lunch?.amount || 'No details'}</>
}
                    />
                  </Col>
                  <Col md={6}>
                    <MealPlanCard
                      title="Dinner"
                      content={ <>
      <strong style={{ color: '#0d6efd' }}>{day.dinner?.name || 'No Name'}</strong><br />
      <strong>Ingredients:</strong> {day.dinner?.ingredients?.join(', ') || 'N/A'}<br />
      <strong>Description:</strong> {day.dinner?.detail || 'No description'}<br />
      <strong>Amount:</strong> {day.dinner?.amount || 'No details'}
    </>}
                    />
                  </Col>
{(day.snacks || []).map((snack, i) => (
  <Col md={6} key={i}>
    <MealPlanCard
      title={`Snack ${i + 1}`}
      content={
        <>
          <strong style={{ color: '#0d6efd' }}>{snack.name || 'No Name'}</strong><br />
          <strong>Ingredients:</strong> {snack.ingredients?.join(', ') || 'N/A'}<br />
          <strong>Description:</strong> {snack.detail || 'No description'}<br />
          <strong>Amount:</strong> {snack.amount|| 'No details'}
        </>
      }
    />
  </Col>
))}

                </Row>
              </Tab>
            ))}
          </Tabs>

          <p className="text-muted mt-4" style={{ fontSize: '0.95rem' }}>
            <strong>Note:</strong> This is a sample meal plan and calorie needs may vary depending on individual metabolism and activity levels.
            It's always best to consult a registered dietitian or nutritionist for personalized dietary advice.
          </p>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
