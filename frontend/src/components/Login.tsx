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
      <div className="login-content">
        <div className="login-left">
          <div className="login-card">
        <div className="login-header">
          <h1>MELISSA</h1>
          <p>M. Messaoudi vous souhaite la bienvenue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" style={{ textAlign: 'left' }}>Email</label>
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
        
        <div className="login-right">
          <div className="earth-background">
            <div className="stars">
              {Array.from({ length: 50 }, (_, i) => (
                <div
                  key={i}
                  className="star"
                  style={{
                    position: 'absolute',
                    width: `${Math.random() * 3 + 1}px`,
                    height: `${Math.random() * 3 + 1}px`,
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `twinkle ${Math.random() * 3 + 2}s infinite alternate`,
                    opacity: Math.random()
                  }}
                />
              ))}
            </div>
            
            <div className="earth-planet">
              <div className="continent continent-1" />
              <div className="continent continent-2" />
              <div className="continent continent-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
