import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentsService, sessionsService, paymentsService } from '../services/api';
import './ParentDashboard.css';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subjects: string[];
  hourlyRate: number;
}

interface Session {
  id: string;
  date: string;
  duration: number;
  subject: string;
  price: number;
  notes: string;
  status: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
}

const ParentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les élèves associés au parent
      const studentsRes = await studentsService.getAll();
      if (studentsRes.success) {
        setStudents(studentsRes.students);
        if (studentsRes.students.length > 0) {
          setSelectedStudent(studentsRes.students[0]);
          await loadStudentData(studentsRes.students[0].id);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentData = async (studentId: string) => {
    try {
      const [sessionsRes, paymentsRes] = await Promise.all([
        sessionsService.getByStudent(studentId),
        paymentsService.getByStudent(studentId)
      ]);

      if (sessionsRes.success) setSessions(sessionsRes.sessions);
      if (paymentsRes.success) setPayments(paymentsRes.payments);
    } catch (error) {
      console.error('Erreur lors du chargement des données de l\'élève:', error);
    }
  };

  const handleStudentChange = (student: Student) => {
    setSelectedStudent(student);
    loadStudentData(student.id);
  };

  if (loading) {
    return <div className="loading">🔄 Chargement...</div>;
  }

  if (students.length === 0) {
    return (
      <div className="parent-dashboard">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>👨‍👩‍👧‍👦 Espace Parents</h1>
            <p>Bienvenue {user?.name}</p>
          </div>
          <button onClick={logout} className="logout-btn">
            🚪 Déconnexion
          </button>
        </header>
        <div className="no-students">
          <h2>Aucun élève associé</h2>
          <p>Contactez votre professeur pour associer votre enfant à votre compte.</p>
        </div>
      </div>
    );
  }

  const totalSessions = sessions.length;
  const totalSpent = sessions.reduce((sum, session) => sum + session.price, 0);
  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="parent-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>👨‍👩‍👧‍👦 Espace Parents</h1>
          <p>Bienvenue {user?.name}</p>
        </div>
        <button onClick={logout} className="logout-btn">
          🚪 Déconnexion
        </button>
      </header>

      {students.length > 1 && (
        <div className="student-selector">
          <h3>Sélectionner un enfant :</h3>
          <div className="student-buttons">
            {students.map(student => (
              <button
                key={student.id}
                className={selectedStudent?.id === student.id ? 'student-btn active' : 'student-btn'}
                onClick={() => handleStudentChange(student)}
              >
                {student.firstName} {student.lastName}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedStudent && (
        <main className="dashboard-content">
          <div className="student-info">
            <div className="student-card">
              <h2>👤 {selectedStudent.firstName} {selectedStudent.lastName}</h2>
              <div className="student-details">
                <p>📧 {selectedStudent.email}</p>
                <p>📚 Matière: Physique</p>
                <p>💰 Tarif: {selectedStudent.hourlyRate}€/heure</p>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-card">
                <h3>📅 Séances suivies</h3>
                <div className="stat-number">{totalSessions}</div>
              </div>
              <div className="stat-card">
                <h3>💰 Total dépensé</h3>
                <div className="stat-number">{totalSpent}€</div>
              </div>
              <div className="stat-card">
                <h3>⏳ Montant dû</h3>
                <div className="stat-number">{pendingAmount}€</div>
              </div>
            </div>
          </div>

          <div className="dashboard-sections">
            <section className="sessions-section">
              <h3>📚 Historique des séances</h3>
              {sessions.length === 0 ? (
                <p className="empty-state">Aucune séance enregistrée pour le moment.</p>
              ) : (
                <div className="sessions-list">
                  {sessions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(session => (
                    <div key={session.id} className="session-card">
                      <div className="session-header">
                        <div className="session-subject">{session.subject}</div>
                        <div className="session-date">
                          {new Date(session.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="session-details">
                        <span className="session-duration">⏱️ {session.duration} minutes</span>
                        <span className="session-price">💰 {session.price}€</span>
                        <span className={`session-status ${session.status}`}>
                          {session.status === 'completed' ? '✅ Terminée' : '📅 Prévue'}
                        </span>
                      </div>
                      {session.notes && (
                        <div className="session-notes">
                          <strong>📝 Notes du professeur:</strong>
                          <p>{session.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="payments-section">
              <h3>💳 Paiements et factures</h3>
              {payments.length === 0 ? (
                <p className="empty-state">Aucune facture pour le moment.</p>
              ) : (
                <div className="payments-list">
                  {payments
                    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                    .map(payment => (
                    <div key={payment.id} className={`payment-card ${payment.status}`}>
                      <div className="payment-header">
                        <div className="payment-amount">💰 {payment.amount}€</div>
                        <div className={`payment-status ${payment.status}`}>
                          {payment.status === 'paid' ? '✅ Payé' : '⏳ En attente'}
                        </div>
                      </div>
                      <div className="payment-details">
                        <p>📅 Échéance: {new Date(payment.dueDate).toLocaleDateString('fr-FR')}</p>
                        {payment.paidDate && (
                          <p>✅ Payé le: {new Date(payment.paidDate).toLocaleDateString('fr-FR')}</p>
                        )}
                        {payment.paymentMethod && (
                          <p>💳 Mode: {payment.paymentMethod}</p>
                        )}
                      </div>
                      {payment.status === 'pending' && (
                        <div className="payment-actions">
                          <p className="payment-reminder">
                            💡 Contactez votre professeur pour effectuer le paiement
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      )}
    </div>
  );
};

export default ParentDashboard;
