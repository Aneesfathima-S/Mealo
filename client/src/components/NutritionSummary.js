import React from 'react';
import { Row, Col } from 'react-bootstrap';

// Safely parse values
const safeValue = (val, defaultVal = 0) => {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? defaultVal : parsed;
};

const ProgressCircle = ({ value, label, color, goal = 100 }) => {
  const numericValue = safeValue(value);
  const safeGoal = goal > 0 ? goal : 100;
  const percentage = Math.min((numericValue / safeGoal) * 100, 100);

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <svg width="80" height="80">
        <circle cx="40" cy="40" r={radius} stroke="#eee" strokeWidth="6" fill="none" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="12"
          fill="#333"
        >
          {`${percentage.toFixed(0)}%`}
        </text>
      </svg>
      <div style={{ fontSize: '14px', color: '#555' }}>
        {label} ({numericValue.toFixed(1)}g)
      </div>
    </div>
  );
};

const NutritionSummary = ({ nutrition }) => {
  const {
    caloriesBurned = 0,
    caloriesTotal = 2000,
    fat = 0,
    protein = 0,
    carbs = 0,
    fiber = 0,
  } = nutrition || {};

  const safeBurned = safeValue(caloriesBurned);
  const safeTotal = safeValue(caloriesTotal);
  const caloriesLeft = Math.max(1500 - safeBurned, 0); // ✅ prevent negative

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
      <Row className="text-center mb-4">
        <Col>
          <span role="img" aria-label="fire">🔥</span>{' '}
          <strong>{safeBurned}</strong> cal burned
        </Col>
        <Col>
          <span role="img" aria-label="bowl"></span>{' '}
          <strong style={{ color: '#0d6efd' }}>{1500}</strong> cal total
        </Col>
        <Col>
          <span role="img" aria-label="apple"></span>{' '}
          <strong>{caloriesLeft}</strong> cal left
        </Col>
      </Row>
      <Row>
        <Col md={3}>
          <ProgressCircle value={fat} label="Fat" color="gold" goal={50} />
        </Col>
        <Col md={3}>
          <ProgressCircle value={protein} label="Protein" color="crimson" goal={30} />
        </Col>
        <Col md={3}>
          <ProgressCircle value={carbs} label="Carbs" color="mediumpurple" goal={120} />
        </Col>
        <Col md={3}>
          <ProgressCircle value={fiber} label="Fiber" color="deepskyblue" goal={30} />
        </Col>
      </Row>
    </div>
  );
};

export default NutritionSummary;
