import React, { useState, useEffect } from 'react';
import { studentsService, sessionsService, paymentsService, classesService } from '../services/api';
import SessionCalendar from '../components/SessionCalendar';
import UserMenu from '../components/UserMenu';
import StudentsManagement from '../components/StudentsManagement';
import ClassesManagement from '../components/ClassesManagement';
import SessionsManagement from '../components/SessionsManagement';
import CalendarManagement from '../components/CalendarManagement';
import PaymentsManagement from '../components/PaymentsManagement';
import './TeacherDashboard.css';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sessionRate: number;
  active: boolean;
}

interface Session {
  id: string;
  studentId?: string;
  classId?: string;
  date: string;
  duration: number;
  subject: string;
  price: number;
  notes: string;
  status: string;
  type: 'individual' | 'class';
  student?: {
    firstName: string;
    lastName: string;
  };
  class?: {
    id: string;
    name: string;
    students: Array<{
      firstName: string;
      lastName: string;
    }>;
  };
}

interface Class {
  id: string;
  name: string;
  studentIds: string[];
  hourlyRate: number;
  description: string;
  active: boolean;
  students?: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
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
  // const { user, logout } = useAuth(); // Maintenant géré par UserMenu
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'sessions' | 'classes' | 'calendar' | 'payments'>('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsRes, sessionsRes, paymentsRes, classesRes] = await Promise.all([
        studentsService.getAll(),
        sessionsService.getAll(),
        paymentsService.getAll(),
        classesService.getAll()
      ]);

      if (studentsRes.success) setStudents(studentsRes.students);
      if (sessionsRes.success) setSessions(sessionsRes.sessions);
      if (paymentsRes.success) setPayments(paymentsRes.payments);
      if (classesRes.success) setClasses(classesRes.classes);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
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
        <nav className="header-nav">
          <button
            className={`nav-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Vue d'ensemble
          </button>
          <button
            className={`nav-button ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Élèves
          </button>
          <button
            className={`nav-button ${activeTab === 'classes' ? 'active' : ''}`}
            onClick={() => setActiveTab('classes')}
          >
            Groupes d'élèves
          </button>
          <button
            className={`nav-button ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            Séances
          </button>
          <button
            className={`nav-button ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            Calendrier
          </button>
          <button
            className={`nav-button ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            Paiements
          </button>
        </nav>
        <UserMenu />
      </header>

      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Élèves actifs</h3>
                <div className="stat-number">{totalStudents}</div>
              </div>
              <div className="stat-card">
                <h3>Séances données</h3>
                <div className="stat-number">{totalSessions}</div>
              </div>
              <div className="stat-card">
                <h3>Revenus totaux</h3>
                <div className="stat-number">{totalRevenue}€</div>
              </div>
              <div className="stat-card">
                <h3>Paiements en attente</h3>
                <div className="stat-number">{pendingPayments}</div>
              </div>
            </div>

            <div className="recent-activity">
              <h2>Activité récente</h2>
              <div className="activity-list">
                {sessions.slice(-5).reverse().map(session => (
                  <div key={session.id} className="activity-item">
                    <span>Séance de {session.subject} avec {session.student?.firstName} {session.student?.lastName}</span>
                    <span className="activity-date">{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <StudentsManagement students={students} setStudents={setStudents} />
        )}

        {activeTab === 'sessions' && (
          <SessionsManagement 
            sessions={sessions} 
            setSessions={setSessions} 
            students={students} 
            classes={classes} 
          />
        )}

        {activeTab === 'classes' && (
          <ClassesManagement 
            classes={classes} 
            setClasses={setClasses} 
            students={students} 
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarManagement 
            sessions={sessions} 
            students={students} 
            classes={classes} 
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsManagement 
            sessions={sessions} 
            students={students} 
          />
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
