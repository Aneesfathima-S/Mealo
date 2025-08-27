import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import axios from 'axios';

const ProfileForm = () => {
  const [formData, setFormData] = useState({
    name:'',
    age: '',
    gender: '',
    weight: '',
    height: '',
    activityLevel: '',
    goal: '',
    diet: '',
    allergies: '',
    snacksAllowed: false,
    profilePic: '',
    region: ''
  });

  const [originalData, setOriginalData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData(res.data);
        setOriginalData(res.data);
        setPreview(res.data.profilePic);
        setEditMode(false);
      } catch (err) {
        console.log('No profile found');
        setEditMode(true); // go to edit mode if no profile exists
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePic: reader.result });
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Profile updated successfully');
      setOriginalData(formData);
      setEditMode(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setPreview(originalData.profilePic);
    setEditMode(false);
    setMessage('');
  };

  return (
    <Container style={{ maxWidth: '700px', marginTop: '40px' }}>
      <h2>Profile</h2>
      {message && <Alert variant="info">{message}</Alert>}

      {!editMode ? (
        <Card className="p-4">
          {formData.profilePic && (
            <div className="text-center mb-3">
              <img
                src={formData.profilePic}
                alt="Avatar"
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }}
              />
            </div>
          )}
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Age:</strong> {formData.age}</p>
          <p><strong>Gender:</strong> {formData.gender}</p>
          <p><strong>Weight:</strong> {formData.weight} kg</p>
          <p><strong>Height:</strong> {formData.height} cm</p>
          <p><strong>Activity Level:</strong> {formData.activityLevel}</p>
          <p><strong>Goal:</strong> {formData.goal}</p>
          <p><strong>Diet:</strong> {formData.diet}</p>
          <p><strong>Preferred Region:</strong> {formData.region || 'Not specified'}</p>
          <p><strong>Allergies:</strong> {formData.allergies || 'None'}</p>
          <p><strong>Snacks Allowed:</strong> {formData.snacksAllowed ? 'Yes' : 'No'}</p>
          <Button onClick={() => setEditMode(true)}>Edit</Button>
        </Card>
      ) : (
        <Form onSubmit={handleSave}>
          <Form.Group className="mb-3">
            <Form.Label>Profile Picture</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
            {preview && (
              <div style={{ marginTop: '10px' }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                />
              </div>
            )}
          </Form.Group>
          <Row>
    <Col>
      <Form.Group>
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          required
        />
      </Form.Group>
    </Col>
  </Row>
          <Row>
            <Col><Form.Group><Form.Label>Age</Form.Label>
              <Form.Control type="number" name="age" value={formData.age || ''} onChange={handleChange} required />
            </Form.Group></Col>
            <Col><Form.Group><Form.Label>Gender</Form.Label>
              <Form.Select name="gender" value={formData.gender || ''} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group></Col>
          </Row>

          <Row>
            <Col><Form.Group><Form.Label>Weight (kg)</Form.Label>
              <Form.Control type="number" name="weight" value={formData.weight || ''} onChange={handleChange} required />
            </Form.Group></Col>
            <Col><Form.Group><Form.Label>Height (cm)</Form.Label>
              <Form.Control type="number" name="height" value={formData.height || ''} onChange={handleChange} required />
            </Form.Group></Col>
          </Row>

          <Form.Group><Form.Label>Activity Level</Form.Label>
            <Form.Select name="activityLevel" value={formData.activityLevel || ''} onChange={handleChange} required>
              <option value="">Select</option>
              <option value="sedentary">Sedentary</option>
              <option value="light">Lightly Active</option>
              <option value="moderate">Moderately Active</option>
              <option value="active">Very Active</option>
            </Form.Select>
          </Form.Group>

          <Form.Group><Form.Label>Goal</Form.Label>
            <Form.Select name="goal" value={formData.goal || ''} onChange={handleChange} required>
              <option value="">Select</option>
              <option value="lose">Lose Weight</option>
              <option value="maintain">Maintain Weight</option>
              <option value="gain">Gain Weight</option>
            </Form.Select>
          </Form.Group>

          <Form.Group><Form.Label>Diet</Form.Label>
            <Form.Select name="diet" value={formData.diet || ''} onChange={handleChange} required>
              <option value="">Select</option>
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
              <option value="both">Both</option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
  <Form.Label>Preferred Region</Form.Label>
  <Form.Select
    name="region"
    value={formData.region || ''}
    onChange={handleChange}
    required
  >
    <option value="">Select Region</option>
    <option value="Tamil Nadu">Tamil Nadu</option>
    <option value="Kerala">Kerala</option>
    <option value="Rajasthan">Rajasthan</option>
    <option value="Punjab">Punjab</option>
    <option value="Gujarat">Gujarat</option>
    <option value="Maharashtra">Maharashtra</option>
    <option value="West Bengal">West Bengal</option>
    <option value="Other">Other</option>
  </Form.Select>
</Form.Group>

          <Form.Group><Form.Label>Allergies</Form.Label>
            <Form.Control type="text" name="allergies" value={formData.allergies || ''} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Allow limited snacks (e.g. chocolate)"
              name="snacksAllowed"
              checked={formData.snacksAllowed}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="success" type="submit" className="me-2">Save</Button>
          <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
        </Form>
      )}
    </Container>
  );
};

export default ProfileForm;
