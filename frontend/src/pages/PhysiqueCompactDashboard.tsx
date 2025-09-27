import React, { useState, useEffect } from 'react';
import '../styles/physique-compact.css';

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  level: string;
  hourlyRate: number;
  group?: string;
}

interface Session {
  id: number;
  studentId: number;
  studentName: string;
  date: string;
  duration: number;
  status: 'completed' | 'scheduled' | 'cancelled';
  amount: number;
  notes?: string;
  isGroup?: boolean;
  groupName?: string;
}

interface Payment {
  id: number;
  studentId: number;
  studentName: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  sessionIds: number[];
}

const PhysiqueCompactDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsRes, sessionsRes, paymentsRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/sessions'),
        fetch('/api/payments')
      ]);

      const studentsData = await studentsRes.json();
      const sessionsData = await sessionsRes.json();
      const paymentsData = await paymentsRes.json();

      setStudents(studentsData);
      setSessions(sessionsData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Statistiques calculées
  const stats = {
    totalStudents: students.length,
    activeGroups: new Set(students.filter(s => s.group).map(s => s.group)).size,
    weekSessions: sessions.filter(s => {
      const sessionDate = new Date(s.date);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      return sessionDate >= weekStart;
    }).length,
    monthRevenue: sessions
      .filter(s => {
        const sessionDate = new Date(s.date);
        const now = new Date();
        return sessionDate.getMonth() === now.getMonth() && 
               sessionDate.getFullYear() === now.getFullYear() &&
               s.status === 'completed';
      })
      .reduce((sum, s) => sum + s.amount, 0)
  };

  const recentSessions = sessions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const upcomingSessions = sessions
    .filter(s => new Date(s.date) > new Date() && s.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const pendingPayments = payments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .slice(0, 5);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            {/* Statistiques */}
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">👥</span>
                <div className="stat-value">{stats.totalStudents}</div>
                <div className="stat-label">Élèves</div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🔬</span>
                <div className="stat-value">{stats.activeGroups}</div>
                <div className="stat-label">Groupes</div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">📅</span>
                <div className="stat-value">{stats.weekSessions}</div>
                <div className="stat-label">Cette semaine</div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">💰</span>
                <div className="stat-value">{stats.monthRevenue}€</div>
                <div className="stat-label">Ce mois</div>
              </div>
            </div>

            {/* Vue d'ensemble compacte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prochaines séances */}
              <div className="compact-card">
                <div className="card-header">
                  <div className="card-title">
                    <span>⏰</span>
                    Prochaines séances
                  </div>
                </div>
                <div className="card-body">
                  {upcomingSessions.length > 0 ? (
                    <ul className="compact-list">
                      {upcomingSessions.map(session => (
                        <li key={session.id} className="list-item">
                          <div className="list-icon">
                            {session.isGroup ? '👥' : '👤'}
                          </div>
                          <div className="list-content">
                            <div className="list-title">
                              {session.isGroup ? session.groupName : session.studentName}
                            </div>
                            <div className="list-subtitle">
                              {new Date(session.date).toLocaleDateString('fr-FR', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <div className="list-meta">
                            {session.duration}h
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-sm" style={{color: 'var(--text-muted)', padding: 'var(--space-4)'}}>
                      Aucune séance prévue
                    </div>
                  )}
                </div>
              </div>

              {/* Paiements en attente */}
              <div className="compact-card">
                <div className="card-header">
                  <div className="card-title">
                    <span>💳</span>
                    Paiements en attente
                  </div>
                </div>
                <div className="card-body">
                  {pendingPayments.length > 0 ? (
                    <ul className="compact-list">
                      {pendingPayments.map(payment => (
                        <li key={payment.id} className="list-item">
                          <div className="list-icon" style={{
                            background: payment.status === 'overdue' ? '#fef2f2' : '#fff7ed',
                            color: payment.status === 'overdue' ? '#dc2626' : '#ea580c'
                          }}>
                            {payment.status === 'overdue' ? '⚠️' : '⏳'}
                          </div>
                          <div className="list-content">
                            <div className="list-title">{payment.studentName}</div>
                            <div className="list-subtitle">
                              {new Date(payment.date).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                          <div className="list-meta">
                            {payment.amount}€
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-sm" style={{color: 'var(--text-muted)', padding: 'var(--space-4)'}}>
                      Tous les paiements sont à jour ✅
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="compact-card">
              <div className="card-header">
                <div className="card-title">
                  <span>⚡</span>
                  Actions rapides
                </div>
              </div>
              <div className="card-body">
                <div className="flex gap-2" style={{flexWrap: 'wrap'}}>
                  <button className="btn btn-primary">
                    <span>➕</span>
                    Nouvelle séance
                  </button>
                  <button className="btn">
                    <span>👤</span>
                    Ajouter élève
                  </button>
                  <button className="btn">
                    <span>👥</span>
                    Créer groupe
                  </button>
                  <button className="btn">
                    <span>💰</span>
                    Enregistrer paiement
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'students':
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Mes élèves</h2>
              <button className="btn btn-primary btn-small">
                <span>➕</span>
                Ajouter
              </button>
            </div>
            
            <div className="compact-card">
              <div className="card-body">
                {students.length > 0 ? (
                  <ul className="compact-list">
                    {students.map(student => (
                      <li key={student.id} className="list-item">
                        <div className="list-icon">
                          {student.group ? '👥' : '👤'}
                        </div>
                        <div className="list-content">
                          <div className="list-title">{student.name}</div>
                          <div className="list-subtitle">
                            {student.level} • {student.hourlyRate}€/h
                            {student.group && ` • Groupe: ${student.group}`}
                          </div>
                        </div>
                        <div className="list-meta">
                          <button className="btn btn-small">Voir</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-sm" style={{color: 'var(--text-muted)', padding: 'var(--space-8)'}}>
                    Aucun élève enregistré
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Planning</h2>
              <button className="btn btn-primary btn-small">
                <span>➕</span>
                Séance
              </button>
            </div>
            
            <div className="compact-card">
              <div className="card-body">
                <div className="text-center text-sm" style={{color: 'var(--text-muted)', padding: 'var(--space-8)'}}>
                  Calendrier en cours de développement...
                  <br />
                  <span className="text-xs">Utilisez l'onglet Dashboard pour voir les prochaines séances</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'payments':
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Paiements</h2>
              <button className="btn btn-primary btn-small">
                <span>➕</span>
                Paiement
              </button>
            </div>
            
            <div className="compact-card">
              <div className="card-body">
                {payments.length > 0 ? (
                  <ul className="compact-list">
                    {payments.slice(0, 10).map(payment => (
                      <li key={payment.id} className="list-item">
                        <div className="list-icon" style={{
                          background: payment.status === 'paid' ? '#f0fdf4' : 
                                     payment.status === 'overdue' ? '#fef2f2' : '#fff7ed',
                          color: payment.status === 'paid' ? '#16a34a' : 
                                 payment.status === 'overdue' ? '#dc2626' : '#ea580c'
                        }}>
                          {payment.status === 'paid' ? '✅' : 
                           payment.status === 'overdue' ? '⚠️' : '⏳'}
                        </div>
                        <div className="list-content">
                          <div className="list-title">{payment.studentName}</div>
                          <div className="list-subtitle">
                            {new Date(payment.date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div className="list-meta">
                          {payment.amount}€
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-sm" style={{color: 'var(--text-muted)', padding: 'var(--space-8)'}}>
                    Aucun paiement enregistré
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="compact-app">
        <div className="compact-header">
          <div className="header-content">
            <div className="text-center">Chargement...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="compact-app">
      {/* Header compact */}
      <header className="compact-header">
        <div className="header-content">
          <div className="header-left">
            <div>
              <div className="header-title">⚛️ Physique</div>
              <div className="header-subtitle">Suivi des cours</div>
            </div>
          </div>
          <div className="header-right">
            <button className="btn btn-small">
              <span>👤</span>
              Profil
            </button>
          </div>
        </div>
      </header>

      {/* Navigation horizontale */}
      <nav className="compact-nav">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span>📊</span>
            Tableau de bord
          </button>
          <button 
            className={`nav-tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <span>👥</span>
            Élèves
          </button>
          <button 
            className={`nav-tab ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <span>📅</span>
            Planning
          </button>
          <button 
            className={`nav-tab ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <span>💰</span>
            Paiements
          </button>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="compact-content">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default PhysiqueCompactDashboard;
