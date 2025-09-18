import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(email, password);
    
    if (!success) {
      setError('Email ou mot de passe incorrect');
    }
    
    setLoading(false);
  };

  const handleDemoLogin = async (role: 'teacher' | 'parent') => {
    setLoading(true);
    setError('');

    // Connexions de démonstration
    const demoCredentials = {
      teacher: { email: 'professeur@example.com', password: 'password123' },
      parent: { email: 'parent@example.com', password: 'password123' }
    };

    const credentials = demoCredentials[role];
    const success = await login(credentials.email, credentials.password);
    
    if (!success) {
      setError('Compte de démonstration non disponible');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>📚 Suivi des Élèves</h1>
          <p>Connectez-vous à votre espace</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="demo-section">
          <h3>Comptes de démonstration</h3>
          <div className="demo-buttons">
            <button 
              className="demo-btn teacher"
              onClick={() => handleDemoLogin('teacher')}
              disabled={loading}
            >
              👨‍🏫 Professeur
            </button>
            <button 
              className="demo-btn parent"
              onClick={() => handleDemoLogin('parent')}
              disabled={loading}
            >
              👨‍👩‍👧‍👦 Parent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
