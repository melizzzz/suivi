import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentsService, sessionsService, paymentsService } from '../services/api';
import './TeacherDashboard.css';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subjects: string[];
  hourlyRate: number;
  active: boolean;
}

interface Session {
  id: string;
  studentId: string;
  date: string;
  duration: number;
  subject: string;
  price: number;
  notes: string;
  status: string;
  student?: {
    firstName: string;
    lastName: string;
  };
}

interface Payment {
  id: string;
  studentId: string;
  amount: number;
  status: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  student?: {
    firstName: string;
    lastName: string;
  };
}

const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);

  // États pour les formulaires
  const [newStudent, setNewStudent] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    subjects: '', hourlyRate: ''
  });
  const [newSession, setNewSession] = useState({
    studentId: '', date: '', duration: '', subject: '', price: '', notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, sessionsRes, paymentsRes] = await Promise.all([
        studentsService.getAll(),
        sessionsService.getAll(),
        paymentsService.getAll()
      ]);

      if (studentsRes.success) setStudents(studentsRes.students);
      if (sessionsRes.success) setSessions(sessionsRes.sessions);
      if (paymentsRes.success) setPayments(paymentsRes.payments);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const studentData = {
        ...newStudent,
        subjects: ['Physique'], // Matière fixe
        hourlyRate: parseFloat(newStudent.hourlyRate)
      };
      
      const response = await studentsService.create(studentData);
      if (response.success) {
        setStudents([...students, response.student]);
        setNewStudent({ firstName: '', lastName: '', email: '', phone: '', subjects: '', hourlyRate: '' });
        setShowAddStudent(false);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'élève:', error);
    }
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sessionData = {
        ...newSession,
        subject: 'Physique', // Matière fixe
        duration: parseInt(newSession.duration),
        price: parseFloat(newSession.price)
      };
      
      const response = await sessionsService.create(sessionData);
      if (response.success) {
        setSessions([...sessions, response.session]);
        setNewSession({ studentId: '', date: '', duration: '', subject: '', price: '', notes: '' });
        setShowAddSession(false);
        // Recharger les données pour mettre à jour les paiements
        loadData();
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la séance:', error);
    }
  };

  const markPaymentAsPaid = async (paymentId: string) => {
    try {
      const response = await paymentsService.markAsPaid(paymentId, 'Espèces');
      if (response.success) {
        setPayments(payments.map(p => 
          p.id === paymentId ? { ...p, status: 'paid', paidDate: new Date().toISOString() } : p
        ));
      }
    } catch (error) {
      console.error('Erreur lors du marquage du paiement:', error);
    }
  };

  // Calculs pour la vue d'ensemble
  const totalStudents = students.filter(s => s.active).length;
  const totalSessions = sessions.length;
  const totalRevenue = sessions.reduce((sum, session) => sum + session.price, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  if (loading) {
    return <div className="loading">🔄 Chargement...</div>;
  }

  return (
    <div className="teacher-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>📚 Dashboard Professeur</h1>
          <p>Bienvenue {user?.name}</p>
        </div>
        <button onClick={logout} className="logout-btn">
          🚪 Déconnexion
        </button>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'overview' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('overview')}
        >
          📊 Vue d'ensemble
        </button>
        <button 
          className={activeTab === 'students' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('students')}
        >
          👥 Élèves ({totalStudents})
        </button>
        <button 
          className={activeTab === 'sessions' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('sessions')}
        >
          📅 Séances ({totalSessions})
        </button>
        <button 
          className={activeTab === 'payments' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('payments')}
        >
          💰 Paiements ({pendingPayments})
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>👥 Élèves actifs</h3>
                <div className="stat-number">{totalStudents}</div>
              </div>
              <div className="stat-card">
                <h3>📅 Séances données</h3>
                <div className="stat-number">{totalSessions}</div>
              </div>
              <div className="stat-card">
                <h3>💰 Revenus totaux</h3>
                <div className="stat-number">{totalRevenue}€</div>
              </div>
              <div className="stat-card">
                <h3>⏳ Paiements en attente</h3>
                <div className="stat-number">{pendingPayments}</div>
              </div>
            </div>

            <div className="recent-activity">
              <h2>📈 Activité récente</h2>
              <div className="activity-list">
                {sessions.slice(-5).reverse().map(session => (
                  <div key={session.id} className="activity-item">
                    <span>📚 Séance de {session.subject} avec {session.student?.firstName} {session.student?.lastName}</span>
                    <span className="activity-date">{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="students-tab">
            <div className="tab-header">
              <h2>👥 Gestion des Élèves</h2>
              <button 
                className="add-btn"
                onClick={() => setShowAddStudent(true)}
              >
                ➕ Ajouter un élève
              </button>
            </div>

            {showAddStudent && (
              <div className="modal-overlay">
                <div className="modal">
                  <h3>Ajouter un nouvel élève</h3>
                  <form onSubmit={handleAddStudent}>
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Prénom"
                        value={newStudent.firstName}
                        onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Nom"
                        value={newStudent.lastName}
                        onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                        required
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                    />
                    <input
                      type="tel"
                      placeholder="Téléphone"
                      value={newStudent.phone}
                      onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="Matières enseignées"
                      value="Physique"
                      disabled
                      style={{ backgroundColor: '#f5f5f5', color: '#666' }}
                    />
                    <input
                      type="number"
                      placeholder="Tarif horaire (€)"
                      value={newStudent.hourlyRate}
                      onChange={(e) => setNewStudent({...newStudent, hourlyRate: e.target.value})}
                      required
                    />
                    <div className="modal-buttons">
                      <button type="button" onClick={() => setShowAddStudent(false)}>Annuler</button>
                      <button type="submit">Ajouter</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="students-grid">
              {students.map(student => (
                <div key={student.id} className="student-card">
                  <h3>{student.firstName} {student.lastName}</h3>
                  <p>📧 {student.email}</p>
                  <p>📱 {student.phone}</p>
                  <p>📚 Physique</p>
                  <p>💰 {student.hourlyRate}€/h</p>
                  <div className={`status ${student.active ? 'active' : 'inactive'}`}>
                    {student.active ? '✅ Actif' : '❌ Inactif'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="sessions-tab">
            <div className="tab-header">
              <h2>📅 Gestion des Séances</h2>
              <button 
                className="add-btn"
                onClick={() => setShowAddSession(true)}
              >
                ➕ Nouvelle séance
              </button>
            </div>

            {showAddSession && (
              <div className="modal-overlay">
                <div className="modal">
                  <h3>Enregistrer une nouvelle séance</h3>
                  <form onSubmit={handleAddSession}>
                    <select
                      value={newSession.studentId}
                      onChange={(e) => setNewSession({...newSession, studentId: e.target.value})}
                      required
                    >
                      <option value="">Choisir un élève</option>
                      {students.filter(s => s.active).map(student => (
                        <option key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </option>
                      ))}
                    </select>
                    <input
                      type="datetime-local"
                      value={newSession.date}
                      onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Durée (minutes)"
                      value={newSession.duration}
                      onChange={(e) => setNewSession({...newSession, duration: e.target.value})}
                      required
                    />
                    <div className="subject-display">
                      <label>Matière: <strong>Physique</strong></label>
                    </div>
                    <input
                      type="number"
                      placeholder="Prix (€)"
                      step="0.01"
                      value={newSession.price}
                      onChange={(e) => setNewSession({...newSession, price: e.target.value})}
                      required
                    />
                    <textarea
                      placeholder="Notes (optionnel)"
                      value={newSession.notes}
                      onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                    />
                    <div className="modal-buttons">
                      <button type="button" onClick={() => setShowAddSession(false)}>Annuler</button>
                      <button type="submit">Enregistrer</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="sessions-list">
              {sessions.map(session => (
                <div key={session.id} className="session-card">
                  <div className="session-header">
                    <h3>{session.student?.firstName} {session.student?.lastName}</h3>
                    <span className="session-date">
                      {new Date(session.date).toLocaleDateString()} à {new Date(session.date).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="session-details">
                    <p>📚 {session.subject} • ⏱️ {session.duration}min • 💰 {session.price}€</p>
                    {session.notes && <p>📝 {session.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="payments-tab">
            <h2>💰 Gestion des Paiements</h2>
            
            <div className="payments-list">
              {payments.map(payment => (
                <div key={payment.id} className={`payment-card ${payment.status}`}>
                  <div className="payment-header">
                    <h3>{payment.student?.firstName} {payment.student?.lastName}</h3>
                    <span className={`payment-status ${payment.status}`}>
                      {payment.status === 'paid' ? '✅ Payé' : '⏳ En attente'}
                    </span>
                  </div>
                  <div className="payment-details">
                    <p>💰 Montant: {payment.amount}€</p>
                    <p>📅 Échéance: {new Date(payment.dueDate).toLocaleDateString()}</p>
                    {payment.paidDate && (
                      <p>✅ Payé le: {new Date(payment.paidDate).toLocaleDateString()}</p>
                    )}
                    {payment.status === 'pending' && (
                      <button 
                        className="mark-paid-btn"
                        onClick={() => markPaymentAsPaid(payment.id)}
                      >
                        Marquer comme payé
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
