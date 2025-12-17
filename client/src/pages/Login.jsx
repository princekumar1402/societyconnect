import React, { useState } from 'react';
import api from '../api';

const Login = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  // State for Registration (must include 'name' to match new DB)
  const [registerForm, setRegisterForm] = useState({
    name: '', // <-- IMPORTANT: Added name field
    email: '',
    password: ''
  });

  // State for Login
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // API call to the backend register route
      const res = await api.post('/api/register', registerForm);
      
      // If successful, log them in immediately (optional: you could navigate to login page instead)
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
      }
    } catch (err) {
      alert("Registration failed. Email might be in use or data missing.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // API call to the backend login route
      const res = await api.post('/api/login', loginForm);
      
      // If successful, save token and set user state
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
      }
    } catch (err) {
      alert("Login failed. Check your email and password.");
    }
  };

  return (
    <div className="auth-page">
    <div className="auth-container">
      <h2>{isLogin ? 'Welcome Back' : 'Join City Connect'}</h2>
      
      {isLogin ? (
        // LOGIN FORM
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={loginForm.email}
            onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={loginForm.password}
            onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
            required
          />
          <button type="submit" className="btn-primary">Login</button>
        </form>
      ) : (
        // REGISTER FORM
        <form onSubmit={handleRegister}>
          <input 
            type="text" 
            placeholder="Your Name (e.g., Prince)" // <-- New Name Field
            value={registerForm.name}
            onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
            required
          />
          <input 
            type="email" 
            placeholder="Email Address" 
            value={registerForm.email}
            onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={registerForm.password}
            onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
            required
          />
          <button type="submit" className="btn-primary">Register</button>
        </form>
      )}

      <div style={{ marginTop: '20px', color: '#94a3b8', fontSize: '0.9rem' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <a href="#" onClick={() => setIsLogin(!isLogin)} style={{ color: '#6366f1', textDecoration: 'none' }}>
          {isLogin ? 'Register' : 'Login'}
        </a>
      </div>
    </div>
    </div>
  );
};

export default Login;