// src/components/GoogleLoginButton.js
import React from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import app from '../firebase';

const GoogleLoginButton = () => {
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth(app);

    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // 🔁 Send token to your backend for verification or user creation
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken })
      });

      const data = await res.json();
      localStorage.setItem('token', data.token); // Save backend-issued token
      window.location.href = '/dashboard';
    } catch (err) {
      alert('Google login failed');
      console.error(err);
    }
  };

  return (
    <button onClick={handleGoogleLogin} className="btn btn-danger mt-3">
      Sign in with Google
    </button>
  );
};

export default GoogleLoginButton;
