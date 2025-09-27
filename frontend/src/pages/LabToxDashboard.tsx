import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentsService, sessionsService, paymentsService, classesService } from '../services/api';
import SessionCalendar from '../components/SessionCalendar';
import '../styles/labtox-premium.css';
import '../styles/labtox-components.css';
import '../styles/labtox-utilities.css';
import '../styles/labtox-animations.css';

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

const LabToxDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'sessions' | 'classes' | 'calendar' | 'payments'>('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour les modales
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);

  // États pour les formulaires
  const [newStudent, setNewStudent] = useState({
    firstName: '', lastName: '', email: '', phone: '', subjects: '', hourlyRate: ''
  });
  const [newSession, setNewSession] = useState({
    studentId: '', classId: '', date: '', duration: '', subject: '', price: '', notes: '', type: 'individual'
  });
  const [newClass, setNewClass] = useState({
    name: '', studentIds: [] as string[], hourlyRate: '', description: ''
  });

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

  // Calculs pour les statistiques
  const totalStudents = students.filter(s => s.active).length;
  const totalSessions = sessions.length;
  const totalRevenue = sessions.reduce((sum, session) => sum + session.price, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const monthlyRevenue = sessions
    .filter(s => new Date(s.date).getMonth() === new Date().getMonth())
    .reduce((sum, session) => sum + session.price, 0);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const studentData = {
        ...newStudent,
        subjects: newStudent.subjects.split(',').map(s => s.trim()),
        hourlyRate: parseFloat(newStudent.hourlyRate)
      };
      
      const response = await studentsService.create(studentData);
      if (response.success) {
        await loadData();
        setShowAddStudent(false);
        setNewStudent({ firstName: '', lastName: '', email: '', phone: '', subjects: '', hourlyRate: '' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'étudiant:', error);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      try {
        const response = await studentsService.delete(id);
        if (response.success) {
          await loadData();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement du laboratoire...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="labtox-app">
      {/* Sidebar */}
      <aside className="labtox-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">⚛️</div>
            <div className="sidebar-logo-text">LabTox</div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Laboratoire</div>
            
            <div className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}
              >
                <div className="nav-icon">📊</div>
                <div className="nav-text">Vue d'ensemble</div>
              </a>
            </div>
            
            <div className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activeTab === 'calendar' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('calendar'); }}
              >
                <div className="nav-icon">📅</div>
                <div className="nav-text">Planning</div>
              </a>
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Gestion</div>
            
            <div className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activeTab === 'students' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('students'); }}
              >
                <div className="nav-icon">👨‍🎓</div>
                <div className="nav-text">Étudiants</div>
                <div className="nav-badge">{totalStudents}</div>
              </a>
            </div>
            
            <div className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activeTab === 'classes' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('classes'); }}
              >
                <div className="nav-icon">🧲</div>
                <div className="nav-text">Groupes</div>
                <div className="nav-badge">{classes.length}</div>
              </a>
            </div>
            
            <div className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activeTab === 'sessions' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('sessions'); }}
              >
                <div className="nav-icon">🧪</div>
                <div className="nav-text">Expériences</div>
                <div className="nav-badge">{totalSessions}</div>
              </a>
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Finances</div>
            
            <div className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('payments'); }}
              >
                <div className="nav-icon">💎</div>
                <div className="nav-text">Paiements</div>
                {pendingPayments > 0 && <div className="nav-badge">{pendingPayments}</div>}
              </a>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="labtox-main">
        {/* Topbar */}
        <header className="labtox-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">
              {activeTab === 'overview' && 'Laboratoire de Physique'}
              {activeTab === 'students' && 'Étudiants'}
              {activeTab === 'classes' && 'Groupes de Travail'}
              {activeTab === 'sessions' && 'Expériences'}
              {activeTab === 'calendar' && 'Planning Quantique'}
              {activeTab === 'payments' && 'Gestion Financière'}
            </h1>
            <div className="topbar-breadcrumb">
              <span>LabTox</span>
              <span>/</span>
              <span>Professeur {user?.name}</span>
            </div>
          </div>
          
          <div className="topbar-right">
            <div className="topbar-search">
              <input 
                type="text" 
                placeholder="Rechercher..."
                className="search-input"
              />
              <div className="search-icon">🔍</div>
            </div>
            
            <button className="btn btn-ghost btn-icon">
              🔔
            </button>
            
            <button onClick={logout} className="btn btn-primary">
              <span>🚪</span>
              Déconnexion
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="labtox-content">
          {activeTab === 'overview' && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 stagger-children">
                <div className="stats-card hover-lift">
                  <div className="stats-header">
                    <div className="stats-title">Étudiants Actifs</div>
                    <div className="stats-icon animate-pulse">👨‍🎓</div>
                  </div>
                  <div className="stats-value">{totalStudents}</div>
                  <div className="stats-trend trend-positive">
                    <span>↗️</span>
                    <span>+12% ce mois</span>
                  </div>
                </div>
                
                <div className="stats-card hover-lift">
                  <div className="stats-header">
                    <div className="stats-title">Expériences</div>
                    <div className="stats-icon animate-float">🧪</div>
                  </div>
                  <div className="stats-value">{totalSessions}</div>
                  <div className="stats-trend trend-positive">
                    <span>↗️</span>
                    <span>+8% ce mois</span>
                  </div>
                </div>
                
                <div className="stats-card hover-lift">
                  <div className="stats-header">
                    <div className="stats-title">Revenus Totaux</div>
                    <div className="stats-icon animate-glow">💎</div>
                  </div>
                  <div className="stats-value">{totalRevenue}€</div>
                  <div className="stats-trend trend-positive">
                    <span>↗️</span>
                    <span>+15% ce mois</span>
                  </div>
                </div>
                
                <div className="stats-card hover-lift">
                  <div className="stats-header">
                    <div className="stats-title">Ce Mois</div>
                    <div className="stats-icon animate-bounce">📈</div>
                  </div>
                  <div className="stats-value">{monthlyRevenue}€</div>
                  <div className="stats-trend trend-positive">
                    <span>↗️</span>
                    <span>Objectif atteint</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <span>🧪</span>
                      Dernières Expériences
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="space-y-4">
                      {sessions.slice(-5).reverse().map(session => (
                        <div key={session.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            {session.type === 'individual' ? '⚛️' : '🧲'}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{session.subject}</div>
                            <div className="text-xs text-gray-500">
                              {session.student?.firstName} {session.student?.lastName}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(session.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <span>📐</span>
                      Formules du Jour
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600 mb-2">E = mc²</div>
                        <div className="text-sm text-gray-600">Équivalence masse-énergie</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-cyan-600 mb-2">F = ma</div>
                        <div className="text-sm text-gray-600">Deuxième loi de Newton</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600 mb-2">P = UI</div>
                        <div className="text-sm text-gray-600">Puissance électrique</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <span>📅</span>
                  Planning des Expériences
                </h3>
              </div>
              <div className="card-body">
                <SessionCalendar 
                  sessions={sessions}
                  onSelectEvent={(event) => console.log('Event selected:', event)}
                  onSelectSlot={(slotInfo) => console.log('Slot selected:', slotInfo)}
                />
              </div>
            </div>
          )}

          {/* Autres onglets... */}
          {activeTab !== 'overview' && activeTab !== 'calendar' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Contenu en développement</h3>
              </div>
              <div className="card-body">
                <p>Cette section sera implémentée avec le design LabTox premium.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LabToxDashboard;
