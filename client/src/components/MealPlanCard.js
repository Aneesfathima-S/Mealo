// --- client/src/components/MealPlanCard.js ---
import React from 'react';
import { Card } from 'react-bootstrap';

const MealPlanCard = ({ title, content }) => {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>{content}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default MealPlanCard;
