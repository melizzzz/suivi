import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import './App.css';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">🔄</div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Login />;
  }

  // Rediriger selon le rôle de l'utilisateur
  if (user.role === 'teacher') {
    return <TeacherDashboard />;
  } else if (user.role === 'parent') {
    return <ParentDashboard />;
  }

  return (
    <div className="error-screen">
      <h2>Erreur</h2>
      <p>Rôle utilisateur non reconnu.</p>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
